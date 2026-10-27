/**
 * Barèmes et règles métier du modèle Excel (FM_dev / sdmpvm).
 * Toute modification de ce fichier modifie les montants des documents imprimés.
 */

export const SEUIL_CATEGORIE = 1050;

/** Taux journalier de prise en charge (PP) par jour ouvrable retenu. */
export const PP_PAR_JOUR_OUVRABLE = 400;

/** Seuils d'heure de retour (fraction de jour Excel). */
export const SEUIL_DEUX_REPAS = 0.782;
export const SEUIL_UN_REPAS = 0.615;

/**
 * Barème selon la catégorie : "sup1050" si la catégorie est un nombre > 1050.
 * Les champs nord / sud / repas sont aussi stockés tels quels dans la base locale (compatibilité).
 */
export function baremePourCategorie(categorie) {
  const catNum = parseInt(categorie, 10);
  const sup1050 = !isNaN(catNum) && catNum > SEUIL_CATEGORIE;
  return {
    nord: sup1050 ? 3500 : 3200,
    sud: sup1050 ? 4000 : 3700,
    repas: sup1050 ? 550 : 500,
  };
}
