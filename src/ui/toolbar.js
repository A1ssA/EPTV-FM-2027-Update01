import { extraireAgentsDepuisClasseur } from "../services/excelImport.js";
import {
  dedoublonnerEtTrier,
  getAgents,
  sauvegarderBaseDansStockage,
  setAgents,
} from "../services/personnelDb.js";
import { insererUneLigne, supprimerUneLigne, viderFeuilleComplete } from "./tableau.js";

export function mettreAJourBadgeDB() {
  const n = getAgents().length;
  const badge = document.getElementById("badgeDbCount");
  badge.innerText = `Base Personnel : ${n} agent${n > 1 ? "s" : ""}`;
  if (n > 0) {
    badge.classList.add("has-data");
  } else {
    badge.classList.remove("has-data");
  }
}

/**
 * EXPORTATION AU FORMAT PDF
 * Prépare un nom de document contextuel (Destination + Date) avant d'ouvrir la boîte
 * de dialogue d'impression/export PDF du navigateur, puis restaure le titre d'origine.
 */
function exporterPDF() {
  const dest = document.getElementById("inpDestination")?.value.trim() || "";
  const dateDebut = document.getElementById("dateDebutPicker")?.value || "";

  const originalTitle = document.title;
  const cleanDest = dest ? dest.replace(/[/\\?%*:|"<>]/g, "-").replace(/\s+/g, "_") : "Mission";
  const cleanDate = dateDebut ? `_${dateDebut}` : "";
  document.title = `EPTV_Frais_Mission_${cleanDest}${cleanDate}`;

  window.print();

  setTimeout(() => {
    document.title = originalTitle;
  }, 1000);
}

/**
 * IMPORTATION DE LA BASE PERSONNEL DEPUIS VOTRE FICHIER EXCEL (Feuille "sdmpvm")
 */
function onFichierExcelChoisi(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    const extraits = extraireAgentsDepuisClasseur(evt.target.result);

    if (extraits.length > 0) {
      setAgents(dedoublonnerEtTrier(extraits));

      sauvegarderBaseDansStockage();
      mettreAJourBadgeDB();
      alert(`${getAgents().length} agents ont été chargés. Tapez les premières lettres dans NOM & PRENOM pour filtrer.`);
    } else {
      alert("Aucun agent détecté dans ce fichier Excel.");
    }
  };
  reader.readAsArrayBuffer(file);
}

/** Branche la barre d'outils (masquée à l'impression). */
export function brancherBarreOutils() {
  document.getElementById("btnInsererLigne").addEventListener("click", insererUneLigne);
  document.getElementById("btnSupprimerLigne").addEventListener("click", supprimerUneLigne);
  document.getElementById("btnReinitialiser").addEventListener("click", viderFeuilleComplete);
  document.getElementById("btnImprimer").addEventListener("click", () => window.print());

  const btnExportPdf = document.getElementById("btnExportPdf");
  if (btnExportPdf) {
    btnExportPdf.addEventListener("click", exporterPDF);
  }

  document.getElementById("fileExcelInput").addEventListener("change", onFichierExcelChoisi);
}
