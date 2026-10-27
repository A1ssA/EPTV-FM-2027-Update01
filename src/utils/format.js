/** Formate le total affiché dans la case TOTAL : "12 345 DA" (séparateur de milliers = espace ordinaire). */
export function formaterMontantDA(total) {
  return total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " DA";
}
