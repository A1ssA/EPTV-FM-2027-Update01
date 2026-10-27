import { evaluerParametresMission, calculerLigneAgent } from "../domain/calculs.js";
import { ChiffreLettre } from "../utils/chiffreLettre.js";
import { formaterMontantDA } from "../utils/format.js";

/** Lit l'en-tête de la feuille (dates, heure, zone, taux) et évalue les paramètres de la mission. */
function lireParametresMission() {
  return evaluerParametresMission({
    dateDebutISO: document.getElementById("dateDebutPicker").value,
    dateFinISO: document.getElementById("dateFinPicker").value,
    heureFin: document.getElementById("cellN4_HeureFin").value,
    zone: document.getElementById("cellAI1_Zone").value,
    taux: document.getElementById("cellAK1_Taux").value,
  });
}

/**
 * RECALCUL GLOBAL DE LA FEUILLE
 */
export function recalculerFeuille() {
  const params = lireParametresMission();
  const rows = document.querySelectorAll("#tbodyMission tr");
  let P41_total = 0;

  rows.forEach(tr => {
    const nom = tr.querySelector(".inp-nom").value.trim();
    const poste = tr.querySelector(".inp-poste").value.trim();
    const cat = tr.querySelector(".inp-cat").value.trim();
    const mat = tr.querySelector(".inp-mat").value.trim();
    const inpJours = tr.querySelector(".inp-njours");
    const inpRepas = tr.querySelector(".inp-nrepas");

    if (!nom && !poste && !cat && !mat) {
      inpJours.value = "";
      inpRepas.value = "";
      tr.querySelector(".col-y7").innerText = "";
      tr.querySelector(".col-ab7").innerText = "";
      tr.querySelector(".col-ag7").innerText = "";
      tr.querySelector(".col-ai7").innerText = "";
      return;
    }

    if (!tr.dataset.manualJours) inpJours.value = params.S7_njours;
    if (!tr.dataset.manualRepas) inpRepas.value = params.V7_nrepas;

    const njours = parseFloat(inpJours.value) || 0;
    const nrepas = parseFloat(inpRepas.value) || 0;

    const calc = calculerLigneAgent(cat, mat, njours, nrepas, params);

    tr.querySelector(".col-y7").innerText = calc.Y7_pctJour;
    tr.querySelector(".col-ab7").innerText = calc.AB7_repas;
    tr.querySelector(".col-ag7").innerText = calc.AG7_pp;
    tr.querySelector(".col-ai7").innerText = calc.AI7_net;

    P41_total += calc.AI7_net;
  });

  document.getElementById("cellP41_Total").innerText = formaterMontantDA(P41_total);

  document.getElementById("cellA44_Lettres").innerText = ChiffreLettre(P41_total);
}
