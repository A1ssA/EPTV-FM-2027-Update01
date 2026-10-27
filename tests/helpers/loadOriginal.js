/**
 * Charge le <script> de la version d'origine (reference/index.original.html) dans un contexte isolé,
 * avec un DOM minimal simulé, afin d'exécuter ses fonctions TELLES QUELLES comme référence.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

export function chargerOriginal() {
  const html = readFileSync(join(ROOT, "reference/index.original.html"), "utf8");
  const m = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!m) throw new Error("script d'origine introuvable");

  const valeurs = {}; // id -> value, pour evaluerParametresMission()
  const elem = (id) => ({ value: valeurs[id] ?? "", addEventListener() {}, innerText: "" });
  const sandbox = {
    document: { getElementById: elem, addEventListener() {}, querySelector: () => elem(""), querySelectorAll: () => [] },
    window: {},
    localStorage: { getItem: () => null, setItem() {} },
    console, Math, Date, parseInt, parseFloat, isNaN, String, Number, Array, Map, JSON,
    alert() {}, FileReader: class {}, XLSX: {},
  };
  vm.createContext(sandbox);
  vm.runInContext(m[1], sandbox);
  sandbox.__valeurs = valeurs;
  return sandbox;
}
