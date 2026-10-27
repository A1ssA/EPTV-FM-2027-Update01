# EPTV — État des Frais de Mission

Application web de saisie et d'impression de l'« État des Frais de Mission » (document A4 portrait).
Version modulaire de l'ancien `index.html` monolithique : **le comportement et le document imprimé sont inchangés**.

## Démarrage

```bash
npm install
npm run dev          # développement : http://localhost:5173
npm run build        # produit dist/index.html (UN SEUL fichier, ouvrable par double-clic)
npm test             # tests unitaires (calculs comparés au code de l'original)
npm run test:visual  # build + comparaison original / nouvelle version (voir plus bas)
```

`dist/index.html` est autonome (JS et CSS inclus) et s'utilise comme l'ancien fichier. Seule dépendance externe,
comme avant : la bibliothèque SheetJS chargée depuis `cdn.sheetjs.com` (nécessaire uniquement pour **Importer Base Excel**).

## Structure

```
index.html              Balisage de la page et du document A4 (repris de l'original, sans attributs onclick/onchange)
src/main.js             Point d'entrée : ordre des CSS (significatif) + initialisation
src/print/              ★ MODULE PROTÉGÉ — tout ce qui détermine le rendu du document imprimé
  document.css            structure, bordures, colonnes, polices et tailles du document
  print.css               @page A4, règles @media print
src/styles/             Interface écran : base, barre d'outils, champs de saisie, combobox, sélection de ligne
src/domain/             Règles métier : barèmes (tarifs.js) et calculs (calculs.js)
src/utils/              Dates / équivalents Excel, ChiffreLettre, formatage du total
src/services/           Base du personnel (localStorage, clé inchangée) et import Excel
src/ui/                 Composants DOM : lignes, combobox, en-tête, barre d'outils, recalcul
reference/              Version d'origine, conservée comme référence des tests
tests/                  Tests unitaires + comparaison visuelle
```

## Règles pour ne pas altérer le document imprimé

1. `src/print/*.css` et le balisage de `.a4-sheet` dans `index.html` définissent le document. **Ne pas les modifier sans validation explicite.**
2. L'ordre des `import "…css"` dans `src/main.js` reproduit la cascade d'origine ; les règles d'impression restent en dernier.
3. Les classes, ids et la structure de `creerLigneVierge()` (`src/ui/ligne.js`) sont ciblés par ces CSS : ne pas les renommer.
4. `cssMinify` est désactivé dans `vite.config.js` : le CSS du document est livré tel qu'écrit.
5. Ne pas « nettoyer » le CSS sans comparaison : certaines règles semblent mortes mais sont conservées telles quelles
   (ex. `td.cell-num { font-size }` est écrasée par `table.mission-table tbody td`).
6. Les règles métier (`src/domain/`) alimentent directement les montants imprimés ; toute modification doit être validée par les tests.
7. Compatibilité des données : clé `localStorage` `eptv_sdmpvm_db_v2` et format des entrées inchangés.

## Vérification de non-régression

`npm run test:visual` (nécessite Chromium via `playwright-core` et `poppler-utils` : `pdftoppm`, `pdftotext`, `pdfinfo`)
rejoue 5 scénarios identiques sur `reference/index.original.html` et `dist/index.html` :
feuille vierge ; mission complète (SUD, 40 %, 9 agents, saisies manuelles, matricule, CONV) ; combobox au clavier / sélection /
insertion / suppression de lignes ; document sur 2 pages avec très gros montants ; import d'un classeur Excel + rechargement.

Il compare : l'état de l'interface à chaque étape, le balisage du document, les **styles calculés et la géométrie de chaque
élément** (médias écran et impression), puis les **PDF** (pages, format, texte, **pixel par pixel à 150 dpi, seuil 0**).
Sortie non nulle au moindre écart ; les images de différence sont écrites dans `tests/visual/out/`.

Note : le PDF est volontairement généré **avant** toute bascule `emulateMedia` / lecture de styles calculés, ces opérations
rendant sinon certains segments de bordure de façon non déterministe dans Chromium (constaté sur la version d'origine elle-même).

Limites : Chromium uniquement ; le rendu de référence utilise la police Carlito (métriquement équivalente à Calibri) ;
la sortie d'un pilote d'imprimante physique n'est pas testée.
