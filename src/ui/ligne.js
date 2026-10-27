/**
 * CRÉATION D'UNE LIGNE VIERGE DU TABLEAU
 * Le balisage (classes, structure des cellules) est identique à la version d'origine :
 * il est ciblé par les styles du document imprimable (src/print/document.css).
 * Les écouteurs d'événements sont attachés par délégation (voir tableau.js).
 */
export function creerLigneVierge() {
  const tr = document.createElement("tr");

  tr.innerHTML = `
        <td class="cell-nom">
          <div class="nom-combobox">
            <input type="text" class="inp-nom" value="" autocomplete="off" />
            <span class="combo-arrow">▾</span>
            <ul class="nom-dropdown-list"></ul>
          </div>
        </td>
        <td class="cell-poste">
          <input type="text" class="excel-input inp-poste t-center" value="" />
        </td>
        <td class="cell-num">
          <input type="text" class="excel-input inp-cat t-center" value="" />
        </td>
        <td class="cell-num">
          <input type="text" class="excel-input inp-njours t-center" value="" />
        </td>
        <td class="cell-num">
          <input type="text" class="excel-input inp-nrepas t-center" value="" />
        </td>
        <td class="cell-num col-y7"></td>
        <td class="cell-num col-ab7"></td>
        <td class="cell-num col-ag7"></td>
        <td class="cell-net col-ai7"></td>
        <td class="cell-mat">
          <input type="text" class="excel-input inp-mat t-center" value="" />
        </td>
        <td class="cell-num cell-emargement"></td>
      `;
  return tr;
}
