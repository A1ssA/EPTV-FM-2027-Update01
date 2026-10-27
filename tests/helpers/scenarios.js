/**
 * Scénarios rejoués à l'identique sur la version d'origine et sur la nouvelle version.
 * Chaque scénario enchaîne des actions utilisateur réelles (saisie, sélection, clics, touches clavier)
 * et appelle snap(label) pour enregistrer l'état de l'interface à chaque étape.
 */
const row = (n) => `#tbodyMission tr:nth-child(${n})`;

export const scenarios = [
  {
    name: "01-feuille-vierge",
    seedDb: false,
    async run(page, snap) {
      await page.fill("#dateDebutPicker", "2026-11-05");
      await snap("dates fixées");
      await page.fill("#inpDestination", "");
      await snap("état initial");
    },
  },
  {
    name: "02-mission-complete-sud-40",
    seedDb: true,
    async run(page, snap) {
      await page.fill("#inpDestination", "TAMANRASSET");
      await page.fill("#inpEvenement", "Couverture du festival de la chanson");
      await page.fill("#dateDebutPicker", "2026-11-04"); // mercredi
      await page.fill("#dateFinPicker", "2026-11-12"); // jeudi (traverse 2 week-ends)
      await page.selectOption("#cellAI1_Zone", "SUD");
      await page.selectOption("#cellAK1_Taux", "0.4");
      await page.selectOption("#cellN4_HeureFin", "20:00");
      await snap("en-tête configuré");

      const noms = ["BENALI KARIM", "BENSALEM AMINA", "BOUZID YACINE", "DAHMANI SOFIANE",
        "HAMIDI NADIA", "KACI RACHID", "MERABET LYDIA", "OUALI MOHAMED-AMINE", "SAIDI INVITE"];
      for (let i = 0; i < noms.length; i++) await page.fill(`${row(i + 1)} .inp-nom`, noms[i]);
      await snap("9 agents saisis par nom exact");

      await page.selectOption("#cellN4_HeureFin", "15:00");
      await snap("retour 15:00");
      await page.selectOption("#cellN4_HeureFin", "12:00");
      await snap("retour 12:00 (fin ouvrable)");

      await page.fill(`${row(2)} .inp-njours`, "3");
      await page.fill(`${row(3)} .inp-nrepas`, "5");
      await snap("saisies manuelles jours/repas");

      await page.fill(`${row(11)} .inp-mat`, "56789");
      await snap("recherche par matricule");
      await page.fill(`${row(12)} .inp-mat`, "conv");
      await snap("matricule CONV");
      await page.fill(`${row(13)} .inp-cat`, "1075");
      await page.fill(`${row(13)} .inp-nom`, "Agent libre hors base");
      await page.fill(`${row(13)} .inp-poste`, "PIGISTE");
      await snap("ligne libre hors base");

      await page.selectOption("#cellN4_HeureFin", "20:00");
      await page.selectOption("#cellAK1_Taux", "1");
      await page.selectOption("#cellAI1_Zone", "NORD");
      await snap("NORD 100% 20:00");
    },
  },
  {
    name: "03-combobox-clavier-selection-lignes",
    seedDb: true,
    async run(page, snap) {
      await page.fill("#dateDebutPicker", "2026-11-07");
      await page.fill("#inpDestination", "ORAN");
      await page.click(`${row(1)} .inp-nom`);
      await snap("focus nom : liste complète");
      await page.keyboard.type("BEN");
      await snap("filtre BEN");
      await page.keyboard.press("ArrowDown");
      await snap("flèche bas");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowUp");
      await page.keyboard.press("Enter");
      await snap("Entrée -> agent appliqué");

      await page.click(`${row(2)} .inp-nom`);
      await page.keyboard.type("MER");
      await page.keyboard.press("Tab");
      await snap("Tab -> agent appliqué");

      await page.click(`${row(3)} .combo-arrow`);
      await snap("clic flèche : ouvre");
      await page.click(`${row(3)} .nom-dropdown-item:nth-child(4)`);
      await snap("clic sur un agent de la liste");
      await page.click(`${row(4)} .combo-arrow`);
      await page.click(`${row(4)} .combo-arrow`);
      await snap("flèche ouvre/ferme");
      await page.click(`${row(4)} .inp-nom`);
      await page.keyboard.type("ZZZ");
      await snap("aucune correspondance");
      await page.keyboard.press("Escape");
      await page.click("#inpEvenement");
      await snap("clic ailleurs ferme la liste");

      await page.click(`${row(5)} .cell-poste`);
      await snap("sélection ligne 5");
      await page.click(".btn-add");
      await snap("insertion sous la ligne 5");
      await page.click(`${row(2)} .cell-num >> nth=0`);
      await page.click(".btn-delete");
      await snap("suppression ligne 2");
      await page.click(".btn-delete");
      await snap("suppression sans sélection (alerte)");
      await page.click(`${row(3)} .cell-poste`);
      await snap("ligne sélectionnée laissée active pour l'impression");

      await page.click(`${row(8)} .inp-nom`);
      await page.keyboard.type("O");
      await snap("liste laissée ouverte pour l'impression");
    },
  },
  {
    name: "04-deux-pages-gros-montant",
    seedDb: true,
    async run(page, snap) {
      await page.fill("#dateDebutPicker", "2026-01-03");
      await page.fill("#dateFinPicker", "2026-09-28");
      await page.selectOption("#cellAI1_Zone", "SUD");
      await page.selectOption("#cellN4_HeureFin", "20:00");
      await page.fill("#inpDestination", "ILLIZI");
      await page.fill("#inpEvenement", "Mission de très longue durée avec un intitulé volontairement long pour tester le retour");
      for (let i = 0; i < 30; i++) await page.click(".btn-add");
      await snap("53 lignes");
      const noms = ["BENALI KARIM", "BENSALEM AMINA", "BOUZID YACINE", "DAHMANI SOFIANE", "HAMIDI NADIA",
        "KACI RACHID", "MERABET LYDIA", "OUALI MOHAMED-AMINE", "SAIDI INVITE"];
      for (let i = 0; i < 53; i++) await page.fill(`${row(i + 1)} .inp-nom`, noms[i % noms.length]);
      await snap("53 agents");
      await page.fill(`${row(1)} .inp-njours`, "100000");
      await page.fill(`${row(2)} .inp-njours`, "2000");
      await snap("montants très élevés");
    },
  },
  {
    name: "05-import-excel",
    seedDb: false,
    async run(page, snap, ctx) {
      await page.fill("#dateDebutPicker", "2026-11-05");
      await page.setInputFiles("#fileExcelInput", ctx.xlsxPath);
      await page.waitForFunction(() => /agent/.test(document.getElementById("badgeDbCount").innerText) && !/: 0 agent/.test(document.getElementById("badgeDbCount").innerText));
      await snap("après import");
      await page.reload();
      await page.fill("#dateDebutPicker", "2026-11-05");
      await snap("rechargement : base conservée (localStorage)");
      await page.fill(`${row(1)} .inp-nom`, "kaci rachid");
      await page.fill(`${row(2)} .inp-nom`, "HAMIDI NADIA");
      await snap("saisie avec base importée");
    },
  },
];
