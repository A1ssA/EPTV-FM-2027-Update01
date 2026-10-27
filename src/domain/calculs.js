import {
  excelDATEDIF_D,
  excelNETWORKDAYS_INTL_7,
  excelTimeDecimal,
  parserISO,
} from "../utils/dates.js";
import {
  PP_PAR_JOUR_OUVRABLE,
  SEUIL_DEUX_REPAS,
  SEUIL_UN_REPAS,
  baremePourCategorie,
} from "./tarifs.js";

/**
 * Paramètres globaux de la mission, calculés à partir de l'en-tête de la feuille.
 * @param {{dateDebutISO:string, dateFinISO:string, heureFin:string, zone:string, taux:string}} entrees
 *   (valeurs brutes des champs : G4, K4, N4, AI1, AK1 du modèle Excel)
 */
export function evaluerParametresMission({ dateDebutISO, dateFinISO, heureFin, zone, taux }) {
  const dG4 = parserISO(dateDebutISO);
  const dK4 = parserISO(dateFinISO);
  const decN4 = excelTimeDecimal(heureFin);
  const zoneAI1 = zone;
  const tauxAK1 = parseFloat(taux) || 1;

  const S7_njours = excelDATEDIF_D(dG4, dK4);

  // 12:00 (0.5) -> 0 repas | 15:00 (0.625 >= 0.615) -> 1 repas | 20:00 (0.833 >= 0.782) -> 2 repas
  let V7_nrepas = 0;
  if (decN4 >= SEUIL_DEUX_REPAS) V7_nrepas = 2;
  else if (decN4 >= SEUIL_UN_REPAS) V7_nrepas = 1;

  const nbOuvrablesTotal = excelNETWORKDAYS_INTL_7(dG4, dK4);
  const finEstOuvrable = excelNETWORKDAYS_INTL_7(dK4, dK4) === 1;
  const nbOuvrablesRetenus = (finEstOuvrable && decN4 < SEUIL_UN_REPAS)
    ? Math.max(0, nbOuvrablesTotal - 1)
    : nbOuvrablesTotal;
  const AG7_ppStandard = PP_PAR_JOUR_OUVRABLE * nbOuvrablesRetenus;

  return { S7_njours, V7_nrepas, AG7_ppStandard, zoneAI1, tauxAK1 };
}

/** Calcul d'une ligne de missionnaire (colonnes % DE JOUR, REPAS, PP, NET). */
export function calculerLigneAgent(catStr, matStr, njours, nrepas, params) {
  const isConv = (matStr.trim().toUpperCase() === "CONV" || catStr.trim() === "/");

  const bareme = baremePourCategorie(catStr);
  const valNord = bareme.nord;
  const valSud = bareme.sud;
  const AB7_repas = bareme.repas;

  const baseZone = (params.zoneAI1 === "NORD") ? valNord : valSud;
  const Y7_pctJour = Math.round(baseZone * params.tauxAK1);
  const AG7_pp = isConv ? 0 : params.AG7_ppStandard;
  const AI7_net = (Y7_pctJour * njours) + (AB7_repas * nrepas) - AG7_pp;

  return { Y7_pctJour, AB7_repas, AG7_pp, AI7_net };
}
