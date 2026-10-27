import { creerEntreeSdmpvm } from "./personnelDb.js";

/**
 * Lecture du classeur Excel du personnel (feuille "sdmpvm" ou, à défaut, toutes les feuilles).
 * Utilise la bibliothèque SheetJS (objet global XLSX), chargée depuis index.html comme dans la version d'origine.
 *
 * @param {ArrayBuffer} arrayBuffer contenu du fichier
 * @returns {Array} entrées brutes (non dédoublonnées) au format creerEntreeSdmpvm
 */
export function extraireAgentsDepuisClasseur(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer);
  const wb = XLSX.read(data, { type: "array" });

  const extraits = [];
  const targetSheets = wb.SheetNames.includes("sdmpvm") ? ["sdmpvm"] : wb.SheetNames;

  targetSheets.forEach(sName => {
    const ws = wb.Sheets[sName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

    rows.forEach(r => {
      if (!r || r.length < 4) return;
      const c0 = String(r[0]).trim();
      const c1 = String(r[1]).trim();
      const c2 = String(r[2]).trim();
      const c3 = String(r[3]).trim();

      if (c0.toUpperCase().includes("NOM") || c1.toUpperCase() === "POSTE") return;

      if (c0 && c1 && (!isNaN(parseInt(c3, 10)) || c3 === "/")) {
        extraits.push(creerEntreeSdmpvm(c0, c1, c2, c3));
      }
    });
  });

  return extraits;
}
