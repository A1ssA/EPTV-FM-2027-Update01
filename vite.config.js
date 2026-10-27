import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  // Le build produit UN SEUL fichier dist/index.html (JS + CSS inclus), ouvrable par double-clic
  // (file://) comme l'ancien index.html : les modules ES externes sont bloqués en file:// par les navigateurs.
  plugins: [viteSingleFile()],
  build: {
    // Aucune minification du CSS : les déclarations du document imprimable restent telles qu'écrites.
    cssMinify: false,
    // CSS regroupé dans l'ordre des imports de src/main.js (cascade préservée).
    cssCodeSplit: false,
  },
  test: {
    include: ["tests/unit/**/*.test.js"],
  },
});
