import { ajouterJoursISO, dateDuJourISO, formaterISOversFR } from "../utils/dates.js";
import { recalculerFeuille } from "./recalcul.js";

/**
 * GESTION DES CALENDRIERS DÉPART / RETOUR
 */
function ouvrirCalendrier(inputId) {
  const inp = document.getElementById(inputId);
  if (inp && typeof inp.showPicker === "function") {
    try { inp.showPicker(); } catch (e) {}
  }
}

function onDateDebutChange() {
  const pickerDebut = document.getElementById("dateDebutPicker");
  const pickerFin = document.getElementById("dateFinPicker");
  const valDebut = pickerDebut.value;

  document.querySelector("#labelDateDebut .val-date").innerText = formaterISOversFR(valDebut);

  if (valDebut) {
    const lendemainISO = ajouterJoursISO(valDebut, 1);
    pickerFin.min = lendemainISO;

    if (!pickerFin.value || pickerFin.value <= valDebut) {
      pickerFin.value = lendemainISO;
      document.querySelector("#labelDateFin .val-date").innerText = formaterISOversFR(lendemainISO);
    }
  }
  recalculerFeuille();
}

function onDateFinChange() {
  const pickerDebut = document.getElementById("dateDebutPicker");
  const pickerFin = document.getElementById("dateFinPicker");

  if (pickerDebut.value && pickerFin.value < pickerDebut.value) {
    pickerFin.value = ajouterJoursISO(pickerDebut.value, 1);
  }
  document.querySelector("#labelDateFin .val-date").innerText = formaterISOversFR(pickerFin.value);
  recalculerFeuille();
}

/** Branche les champs de l'en-tête (zone, taux, heure de retour, dates). */
export function brancherEntete() {
  ["cellAI1_Zone", "cellAK1_Taux", "cellN4_HeureFin"].forEach((id) => {
    document.getElementById(id).addEventListener("change", recalculerFeuille);
  });

  document.getElementById("dateDebutPicker").addEventListener("change", onDateDebutChange);
  document.getElementById("dateFinPicker").addEventListener("change", onDateFinChange);

  document.querySelectorAll(".date-picker-cell").forEach((cell) => {
    const input = cell.querySelector(".date-native-input");
    cell.addEventListener("click", () => ouvrirCalendrier(input.id));
  });
}

/** Dates par défaut : départ = aujourd'hui, retour = demain. */
export function initialiserDatesParDefaut() {
  const todayISO = dateDuJourISO();
  const tomorrowISO = ajouterJoursISO(todayISO, 1);

  const pickerDebut = document.getElementById("dateDebutPicker");
  const pickerFin = document.getElementById("dateFinPicker");

  pickerDebut.value = todayISO;
  pickerFin.min = tomorrowISO;
  pickerFin.value = tomorrowISO;

  document.querySelector("#labelDateDebut .val-date").innerText = formaterISOversFR(todayISO);
  document.querySelector("#labelDateFin .val-date").innerText = formaterISOversFR(tomorrowISO);
}
