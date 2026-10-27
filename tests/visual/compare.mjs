/**
 * Vérification de non-régression : rejoue les mêmes scénarios sur
 *   - reference/index.original.html  (version d'origine, monolithique)
 *   - dist/index.html                (version refactorisée, après `npm run build`)
 * puis compare :
 *   1. l'état de l'interface à chaque étape (valeurs, textes, classes, listes ouvertes, alertes) ;
 *   2. le balisage du document A4 (hors attributs d'événements inline) ;
 *   3. les styles CALCULÉS et la géométrie de chaque élément du document, en média écran ET impression ;
 *   4. les PDF générés : nombre de pages, format, texte, puis comparaison PIXEL PAR PIXEL page par page.
 * Prérequis : Chromium (playwright-core), poppler-utils (pdftoppm, pdftotext, pdfinfo).
 */
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { AGENTS_TEST } from "../helpers/agents.js";
import { scenarios } from "../helpers/scenarios.js";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "tests/visual/out");
const VERSIONS = {
  original: pathToFileURL(join(ROOT, "reference/index.original.html")).href,
  nouvelle: process.env.NOUVELLE_URL || pathToFileURL(join(ROOT, "dist/index.html")).href,
};
const XLSX_LIB = join(ROOT, "node_modules/xlsx/dist/xlsx.full.min.js");
const DPI = 150;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// Classeur Excel de test pour la fonction d'import (feuille "sdmpvm", doublon, ligne invalide, minuscules)
const wb = XLSX.utils.book_new();
const rows = [["NOM", "POSTE", "MAT", "CATEGORIE"], ...AGENTS_TEST,
  ["benali karim", "REALISATEUR PRINCIPAL", "12345", "1250"], // doublon (le dernier gagne)
  ["SANS CATEGORIE", "X", "999", "abc"], // ignoré
  ["", "VIDE", "1", "1000"]]; // ignoré
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "sdmpvm");
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["AUTRE", "FEUILLE", "1", "1"]]), "autre");
const xlsxPath = join(OUT, "agents.xlsx");
XLSX.writeFile(wb, xlsxPath);

const seed = AGENTS_TEST.map(([nom, poste, mat, cat]) => {
  const n = parseInt(cat, 10); const sup = !isNaN(n) && n > 1050;
  return { nom, poste, mat, categorie: cat, nord: sup ? 3500 : 3200, sud: sup ? 4000 : 3700, repas: sup ? 550 : 500 };
});

// ---------- fonctions exécutées dans la page ----------
const snapshotInPage = () => {
  const val = (id) => document.getElementById(id).value;
  const txt = (s) => document.querySelector(s).innerText;
  return {
    entete: ["inpDestination", "inpEvenement", "cellAI1_Zone", "cellAK1_Taux", "cellN4_HeureFin", "dateDebutPicker", "dateFinPicker"].map(val),
    pickerFinMin: document.getElementById("dateFinPicker").min,
    labels: [txt("#labelDateDebut .val-date"), txt("#labelDateFin .val-date")],
    badge: document.getElementById("badgeDbCount").innerText,
    total: document.getElementById("cellP41_Total").innerText,
    lettres: document.getElementById("cellA44_Lettres").innerText,
    lignes: [...document.querySelectorAll("#tbodyMission tr")].map((tr) => ({
      cls: tr.className,
      manual: [tr.dataset.manualJours ?? null, tr.dataset.manualRepas ?? null],
      champs: [...tr.querySelectorAll("input")].map((i) => i.value),
      cellules: [...tr.querySelectorAll("td")].map((td) => td.querySelector("input") ? null : td.innerText),
    })),
    listes: [...document.querySelectorAll(".nom-dropdown-list")].map((ul, k) => ul.classList.contains("open")
      ? { ligne: k, items: [...ul.children].map((li) => li.className + "|" + li.textContent.replace(/\s+/g, " ").trim() + "|" + li.innerHTML.replace(/\s+/g, " ").trim()) }
      : null).filter(Boolean),
    focus: document.activeElement ? document.activeElement.className : null,
  };
};
const sheetHtmlInPage = () => document.querySelector(".a4-sheet").outerHTML
  .replace(/\son(click|change|input|focus|keydown|mousedown)="[^"]*"/g, "").replace(/>\s+</g, "><").replace(/\s+/g, " ");
const stylesInPage = () => {
  const root = document.querySelector(".a4-workspace");
  const els = [document.documentElement, document.body, root, ...root.querySelectorAll("*")];
  return els.map((el, i) => {
    const cs = getComputedStyle(el); const o = {};
    for (let k = 0; k < cs.length; k++) o[cs[k]] = cs.getPropertyValue(cs[k]);
    const r = el.getBoundingClientRect();
    return { i, tag: el.tagName, cls: String(el.className), style: o, rect: [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 100) / 100) };
  });
};

// ---------- exécution d'un scénario sur une version ----------
async function jouer(browser, version, sc) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 }, locale: "fr-FR", timezoneId: "Africa/Algiers" });
  await ctx.route("https://cdn.sheetjs.com/**", (r) => r.fulfill({ path: XLSX_LIB, contentType: "text/javascript" }));
  if (sc.seedDb) await ctx.addInitScript((s) => localStorage.setItem("eptv_sdmpvm_db_v2", JSON.stringify(s)), seed);
  const page = await ctx.newPage();
  const erreurs = []; const dialogs = [];
  page.on("pageerror", (e) => erreurs.push(String(e)));
  page.on("dialog", async (d) => { dialogs.push(d.message()); await d.accept(); });
  await page.goto(VERSIONS[version]);
  await page.waitForFunction(() => document.querySelectorAll("#tbodyMission tr").length > 0);
  const etapes = [];
  const snap = async (label) => etapes.push({ label, etat: await page.evaluate(snapshotInPage), dialogs: dialogs.length });
  await sc.run(page, snap, { xlsxPath });
  const res = { etapes, dialogs, erreurs };
  res.html = await page.evaluate(sheetHtmlInPage);
  // Le PDF est produit AVANT toute bascule de média / lecture de styles calculés : ces opérations
  // peuvent laisser Chromium dans un état de mise en page différent (segments de bordure rendus
  // de façon non déterministe), ce qui fausserait la comparaison indépendamment du code testé.
  const pdfPath = join(OUT, `${sc.name}.${version}.pdf`);
  await page.pdf({ path: pdfPath, preferCSSPageSize: true, printBackground: true });
  res.pdfPath = pdfPath;
  await page.emulateMedia({ media: "screen" }); res.stylesEcran = await page.evaluate(stylesInPage);
  await page.emulateMedia({ media: "print" }); res.stylesPrint = await page.evaluate(stylesInPage);
  await ctx.close();
  return res;
}

// ---------- comparaisons ----------
const diffs = (a, b, max = 8) => {
  const out = [];
  const walk = (x, y, p) => {
    if (out.length >= max) return;
    if (typeof x !== "object" || x === null || typeof y !== "object" || y === null) { if (x !== y) out.push(`${p}: ${JSON.stringify(x)} ≠ ${JSON.stringify(y)}`); return; }
    for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) walk(x[k], y[k], p ? `${p}.${k}` : k);
  };
  walk(a, b, "");
  return out;
};
const sh = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8" });
function rasteriser(pdf, prefix) {
  sh("pdftoppm", ["-r", String(DPI), "-png", pdf, prefix]);
  return readdirSync(OUT).filter((f) => f.startsWith(prefix.split("/").pop() + "-") && f.endsWith(".png")).sort().map((f) => join(OUT, f));
}

let echecs = 0;
const ligne = (ok, titre, detail = "") => { if (!ok) echecs++; console.log(`  ${ok ? "✔" : "✘"} ${titre}${detail ? " — " + detail : ""}`); };

const browser = await chromium.launch();
const FILTRE = process.env.SCENARIO;
for (const sc of scenarios.filter((x) => !FILTRE || x.name.startsWith(FILTRE))) {
  console.log(`\n■ ${sc.name}`);
  const A = await jouer(browser, "original", sc);
  const B = await jouer(browser, "nouvelle", sc);

  ligne(A.erreurs.length === 0 && B.erreurs.length === 0, "aucune erreur JavaScript", `orig:${A.erreurs.length} nouv:${B.erreurs.length} ${[...A.erreurs, ...B.erreurs].join(" | ")}`);
  const dE = diffs(A.etapes.map((e) => [e.label, e.etat, e.dialogs]), B.etapes.map((e) => [e.label, e.etat, e.dialogs]));
  ligne(dE.length === 0, `comportement identique à chacune des ${A.etapes.length} étapes`, dE.join(" ; "));
  ligne(JSON.stringify(A.dialogs) === JSON.stringify(B.dialogs), "alertes identiques", JSON.stringify(A.dialogs));
  ligne(A.html === B.html, "balisage du document A4 identique (hors attributs d'événements)");

  for (const [nom, k] of [["écran", "stylesEcran"], ["impression", "stylesPrint"]]) {
    const sa = A[k], sb = B[k];
    const d = sa.length !== sb.length ? [`${sa.length} éléments ≠ ${sb.length}`] : sa.flatMap((e, i) => diffs({ ...e }, { ...sb[i] }, 3).map((x) => `#${i} <${e.tag} .${e.cls}> ${x}`)).slice(0, 8);
    ligne(d.length === 0, `styles calculés + géométrie identiques (média ${nom}, ${sa.length} éléments × ${Object.keys(sa[0].style).length} propriétés)`, d.join(" ; "));
  }

  const infoA = sh("pdfinfo", [A.pdfPath]), infoB = sh("pdfinfo", [B.pdfPath]);
  const grab = (s, k) => (s.match(new RegExp(`^${k}:\\s+(.*)$`, "m")) || [])[1];
  ligne(grab(infoA, "Pages") === grab(infoB, "Pages"), `nombre de pages PDF identique`, `${grab(infoA, "Pages")} page(s)`);
  ligne(grab(infoA, "Page size") === grab(infoB, "Page size"), "format de page PDF identique", grab(infoA, "Page size"));
  const tA = sh("pdftotext", ["-layout", A.pdfPath, "-"]), tB = sh("pdftotext", ["-layout", B.pdfPath, "-"]);
  ligne(tA === tB, "texte du PDF identique (positions comprises)");

  const pa = rasteriser(A.pdfPath, join(OUT, `${sc.name}.original`)), pb = rasteriser(B.pdfPath, join(OUT, `${sc.name}.nouvelle`));
  let totalPx = 0, detail = [];
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if (!pa[i] || !pb[i]) { totalPx = -1; detail.push(`page ${i + 1} manquante`); continue; }
    const ia = PNG.sync.read(readFileSync(pa[i])), ib = PNG.sync.read(readFileSync(pb[i]));
    if (ia.width !== ib.width || ia.height !== ib.height) { totalPx = -1; detail.push(`page ${i + 1}: dimensions ${ia.width}×${ia.height} ≠ ${ib.width}×${ib.height}`); continue; }
    const diff = new PNG({ width: ia.width, height: ia.height });
    const n = pixelmatch(ia.data, ib.data, diff.data, ia.width, ia.height, { threshold: 0, includeAA: true });
    if (totalPx >= 0) totalPx += n;
    detail.push(`p${i + 1}: ${n} px / ${ia.width * ia.height}`);
    if (n > 0) writeFileSync(join(OUT, `${sc.name}.diff-p${i + 1}.png`), PNG.sync.write(diff));
  }
  ligne(totalPx === 0, `PDF identique pixel par pixel à ${DPI} dpi (seuil 0, anticrénelage inclus)`, detail.join(", "));
}
await browser.close();
console.log(`\n${echecs === 0 ? "✅ TOUTES LES VÉRIFICATIONS SONT PASSÉES" : `❌ ${echecs} VÉRIFICATION(S) EN ÉCHEC`}`);
process.exit(echecs === 0 ? 0 : 1);
