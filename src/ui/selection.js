/** Sélection de ligne à l'écran (classe .active-row, neutralisée à l'impression par print.css). */
let indexLigneSelectionnee = -1;

export function getIndexLigneSelectionnee() {
  return indexLigneSelectionnee;
}

export function resetSelection() {
  indexLigneSelectionnee = -1;
}

export function selectionnerLigne(trElem) {
  const rows = document.querySelectorAll("#tbodyMission tr");
  rows.forEach((r, idx) => {
    r.classList.remove("active-row");
    if (r === trElem) indexLigneSelectionnee = idx;
  });
  trElem.classList.add("active-row");
}
