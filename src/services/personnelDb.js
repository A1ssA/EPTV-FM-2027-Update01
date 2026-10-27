import { baremePourCategorie } from "../domain/tarifs.js";

/**
 * Base du personnel (feuille Excel "sdmpvm"), conservée dans le localStorage.
 * La clé et le format JSON sont inchangés pour rester compatibles avec les données déjà enregistrées.
 */
export const CLE_STOCKAGE_DB = "eptv_sdmpvm_db_v2";

let agents = [];

export function getAgents() {
  return agents;
}

export function setAgents(liste) {
  agents = liste;
}

export function creerEntreeSdmpvm(nom, poste, mat, categorie) {
  const bareme = baremePourCategorie(categorie);
  return {
    nom: String(nom).trim().toUpperCase(),
    poste: String(poste).trim(),
    mat: String(mat).trim(),
    categorie: String(categorie).trim(),
    nord: bareme.nord,
    sud: bareme.sud,
    repas: bareme.repas,
  };
}

export function chargerBaseDepuisStockage() {
  const savedDb = localStorage.getItem(CLE_STOCKAGE_DB);
  if (savedDb) {
    try { agents = JSON.parse(savedDb); } catch (e) {}
  }
}

export function sauvegarderBaseDansStockage() {
  localStorage.setItem(CLE_STOCKAGE_DB, JSON.stringify(agents));
}

/** Dédoublonne par nom (le dernier gagne) et trie par ordre alphabétique. */
export function dedoublonnerEtTrier(extraits) {
  const mapUnique = new Map();
  extraits.forEach(a => mapUnique.set(a.nom.toUpperCase(), a));
  return Array.from(mapUnique.values()).sort((a, b) => a.nom.localeCompare(b.nom));
}
