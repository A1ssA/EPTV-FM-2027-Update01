import { creerLigneVierge } from "./ligne.js";
import { recalculerFeuille } from "./recalcul.js";
import { getIndexLigneSelectionnee, resetSelection, selectionnerLigne } from "./selection.js";
import {
  afficherListeFiltree,
  basculerMenuNom,
  onClavierNom,
  onInputMatChange,
  onSaisieNomLettreParLettre,
} from "./agentLookup.js";

export const NB_LIGNES_DEFAUT = 23;

/**
 * ACTIONS BOUTONS : Insérer / Supprimer / Vider
 */
export function insererUneLigne() {
  const tbody = document.getElementById("tbodyMission");
  const tr = creerLigneVierge();
  const indexLigneSelectionnee = getIndexLigneSelectionnee();

  if (indexLigneSelectionnee >= 0 && indexLigneSelectionnee < tbody.children.length) {
    tbody.insertBefore(tr, tbody.children[indexLigneSelectionnee + 1]);
  } else {
    tbody.appendChild(tr);
  }
  recalculerFeuille();
}

export function supprimerUneLigne() {
  const tbody = document.getElementById("tbodyMission");
  const indexLigneSelectionnee = getIndexLigneSelectionnee();
  if (indexLigneSelectionnee >= 0 && tbody.children.length > 1) {
    tbody.removeChild(tbody.children[indexLigneSelectionnee]);
    resetSelection();
    recalculerFeuille();
  } else {
    alert("Veuillez cliquer sur une ligne du tableau pour la sélectionner avant de la supprimer.");
  }
}

export function viderFeuilleComplete() {
  document.getElementById("inpDestination").value = "";
  document.getElementById("inpEvenement").value = "";
  const tbody = document.getElementById("tbodyMission");
  tbody.innerHTML = "";
  for (let i = 0; i < NB_LIGNES_DEFAUT; i++) {
    tbody.appendChild(creerLigneVierge());
  }
  recalculerFeuille();
}

/**
 * Écouteurs du tableau, attachés une seule fois sur <tbody> (délégation d'événements)
 * à la place des attributs inline oninput/onfocus/onkeydown/onclick des lignes d'origine.
 */
export function brancherEvenementsTableau() {
  const tbody = document.getElementById("tbodyMission");

  tbody.addEventListener("input", (evt) => {
    const t = evt.target;
    if (t.matches(".inp-nom")) {
      onSaisieNomLettreParLettre(t);
    } else if (t.matches(".inp-cat")) {
      recalculerFeuille();
    } else if (t.matches(".inp-njours")) {
      t.closest("tr").dataset.manualJours = "1";
      recalculerFeuille();
    } else if (t.matches(".inp-nrepas")) {
      t.closest("tr").dataset.manualRepas = "1";
      recalculerFeuille();
    } else if (t.matches(".inp-mat")) {
      onInputMatChange(t);
    }
  });

  tbody.addEventListener("focusin", (evt) => {
    if (evt.target.matches(".inp-nom")) afficherListeFiltree(evt.target, false);
  });

  tbody.addEventListener("keydown", (evt) => {
    if (evt.target.matches(".inp-nom")) onClavierNom(evt, evt.target);
  });

  tbody.addEventListener("click", (evt) => {
    const fleche = evt.target.closest(".combo-arrow");
    if (fleche) {
      // Comme à l'origine : la flèche stoppe la propagation (pas de sélection de ligne,
      // pas de fermeture par le gestionnaire de clic global).
      basculerMenuNom(fleche, evt);
      return;
    }
    const tr = evt.target.closest("tr");
    if (tr && tbody.contains(tr)) selectionnerLigne(tr);
  });
}
