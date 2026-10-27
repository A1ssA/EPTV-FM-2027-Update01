/**
 * Point d'entrée. L'ORDRE DES IMPORTS CSS EST SIGNIFICATIF (cascade identique à la version d'origine) :
 *   base -> interface -> feuille -> champs -> sélection de ligne -> document imprimable -> règles d'impression
 * Les règles d'impression (src/print/print.css) restent en dernier.
 */
import "./styles/base.css";
import "./styles/ui.css";
import "./styles/workspace.css";
import "./styles/inputs.css";
import "./styles/row-selection.css";
import "./print/document.css";
import "./print/print.css";

import { chargerBaseDepuisStockage } from "./services/personnelDb.js";
import { brancherFermetureListesAuClic } from "./ui/agentLookup.js";
import { brancherEntete, initialiserDatesParDefaut } from "./ui/entete.js";
import { brancherEvenementsTableau, viderFeuilleComplete } from "./ui/tableau.js";
import { brancherBarreOutils, mettreAJourBadgeDB } from "./ui/toolbar.js";

/**
 * INITIALISATION AU DÉMARRAGE
 */
function demarrer() {
  brancherBarreOutils();
  brancherEntete();
  brancherEvenementsTableau();
  brancherFermetureListesAuClic();

  chargerBaseDepuisStockage();
  initialiserDatesParDefaut();
  viderFeuilleComplete();
  mettreAJourBadgeDB();
}

window.addEventListener("load", demarrer);
