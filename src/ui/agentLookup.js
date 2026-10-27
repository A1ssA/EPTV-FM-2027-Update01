import { getAgents } from "../services/personnelDb.js";
import { recalculerFeuille } from "./recalcul.js";

/**
 * LISTE DÉROULANTE INTELLIGENTE NOM & PRENOM :
 * Filtrage progressif lettre par lettre (1re lettre -> 2e lettre -> etc.)
 */
export function fermerToutesLesListesNoms() {
  document.querySelectorAll(".nom-dropdown-list.open").forEach(ul => {
    ul.classList.remove("open");
  });
}

export function afficherListeFiltree(inputElem, forcerTous = false) {
  fermerToutesLesListesNoms();

  const sdmpvmTableau1 = getAgents();
  const wrapper = inputElem.closest(".nom-combobox");
  const ul = wrapper.querySelector(".nom-dropdown-list");
  const saisie = forcerTous ? "" : inputElem.value.trim().toUpperCase();

  // Filtre strict par préfixe (1re lettre, puis 2e lettre, etc.) puis par sous-chaîne
  let resultats = [];
  if (!saisie) {
    resultats = sdmpvmTableau1;
  } else {
    const commencePar = sdmpvmTableau1.filter(a => a.nom.startsWith(saisie));
    const contientAussi = sdmpvmTableau1.filter(a => !a.nom.startsWith(saisie) && a.nom.includes(saisie));
    resultats = [...commencePar, ...contientAussi];
  }

  ul.innerHTML = "";

  if (resultats.length === 0) {
    ul.classList.remove("open");
    return;
  }

  resultats.forEach((agent, idx) => {
    const li = document.createElement("li");
    li.className = "nom-dropdown-item" + (idx === 0 && saisie ? " highlighted" : "");

    // Mise en évidence visuelle des lettres tapées
    let nomFormate = agent.nom;
    if (saisie && agent.nom.startsWith(saisie)) {
      nomFormate = `<span class="match-chars">${agent.nom.substring(0, saisie.length)}</span>${agent.nom.substring(saisie.length)}`;
    }

    li.innerHTML = `
          <span>${nomFormate}</span>
          <span class="meta-agent">${agent.categorie} | ${agent.mat}</span>
        `;

    li.onmousedown = function (evt) {
      evt.preventDefault(); // Empêche le blur avant la sélection
      appliquerAgentSurLigne(inputElem.closest("tr"), agent);
      ul.classList.remove("open");
    };

    ul.appendChild(li);
  });

  ul.classList.add("open");
}

export function appliquerAgentSurLigne(tr, agent) {
  tr.querySelector(".inp-nom").value = agent.nom;
  tr.querySelector(".inp-poste").value = agent.poste;
  tr.querySelector(".inp-cat").value = agent.categorie;
  tr.querySelector(".inp-mat").value = agent.mat;
  delete tr.dataset.manualJours;
  delete tr.dataset.manualRepas;
  recalculerFeuille();
}

export function onSaisieNomLettreParLettre(inputElem) {
  const tr = inputElem.closest("tr");
  const val = inputElem.value.trim().toUpperCase();

  // Affiche la liste filtrée dès la 1re lettre tapée
  afficherListeFiltree(inputElem, false);

  if (!val) {
    tr.querySelector(".inp-poste").value = "";
    tr.querySelector(".inp-cat").value = "";
    tr.querySelector(".inp-mat").value = "";
    delete tr.dataset.manualJours;
    delete tr.dataset.manualRepas;
  } else {
    const correspondanceExacte = getAgents().find(a => a.nom === val);
    if (correspondanceExacte) {
      appliquerAgentSurLigne(tr, correspondanceExacte);
      return;
    }
  }
  recalculerFeuille();
}

export function onClavierNom(evt, inputElem) {
  const wrapper = inputElem.closest(".nom-combobox");
  const ul = wrapper.querySelector(".nom-dropdown-list");
  if (!ul.classList.contains("open")) return;

  const items = Array.from(ul.querySelectorAll(".nom-dropdown-item"));
  if (items.length === 0) return;

  let currentIndex = items.findIndex(el => el.classList.contains("highlighted"));

  if (evt.key === "ArrowDown") {
    evt.preventDefault();
    if (currentIndex >= 0) items[currentIndex].classList.remove("highlighted");
    currentIndex = (currentIndex + 1) % items.length;
    items[currentIndex].classList.add("highlighted");
    items[currentIndex].scrollIntoView({ block: "nearest" });
  } else if (evt.key === "ArrowUp") {
    evt.preventDefault();
    if (currentIndex >= 0) items[currentIndex].classList.remove("highlighted");
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    items[currentIndex].classList.add("highlighted");
    items[currentIndex].scrollIntoView({ block: "nearest" });
  } else if (evt.key === "Enter" || evt.key === "Tab") {
    if (currentIndex >= 0) {
      evt.preventDefault();
      items[currentIndex].dispatchEvent(new MouseEvent("mousedown"));
    }
  } else if (evt.key === "Escape") {
    ul.classList.remove("open");
  }
}

export function basculerMenuNom(arrowElem, evt) {
  evt.stopPropagation();
  const wrapper = arrowElem.closest(".nom-combobox");
  const inp = wrapper.querySelector(".inp-nom");
  const ul = wrapper.querySelector(".nom-dropdown-list");

  if (ul.classList.contains("open")) {
    ul.classList.remove("open");
  } else {
    inp.focus();
    afficherListeFiltree(inp, true);
  }
}

export function onInputMatChange(inputMat) {
  const tr = inputMat.closest("tr");
  const matCherche = inputMat.value.trim().toUpperCase();

  if (matCherche && matCherche !== "CONV") {
    const agent = getAgents().find(a => a.mat.toUpperCase() === matCherche);
    if (agent) {
      tr.querySelector(".inp-nom").value = agent.nom;
      tr.querySelector(".inp-poste").value = agent.poste;
      tr.querySelector(".inp-cat").value = agent.categorie;
    }
  } else if (matCherche === "CONV") {
    tr.querySelector(".inp-cat").value = "/";
  }
  recalculerFeuille();
}

/** Fermer la liste déroulante si on clique ailleurs sur la page. */
export function brancherFermetureListesAuClic() {
  document.addEventListener("click", function (evt) {
    if (!evt.target.closest(".nom-combobox")) {
      fermerToutesLesListesNoms();
    }
  });
}
