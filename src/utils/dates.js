/**
 * Utilitaires de dates (format ISO "AAAA-MM-JJ" des <input type="date">)
 * et équivalents des fonctions Excel utilisées par le modèle :
 * DATEDIF(..., "d") et NETWORKDAYS.INTL(..., 7).
 */

export function formaterISOversFR(isoStr) {
  if (!isoStr) return "";
  const [y, m, d] = isoStr.split("-");
  return `${d}/${m}/${y}`;
}

export function ajouterJoursISO(isoStr, nbJours) {
  const [y, m, d] = isoStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d, 12, 0, 0);
  dt.setDate(dt.getDate() + nbJours);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Date du jour au format ISO (heure locale). */
export function dateDuJourISO(today = new Date()) {
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function parserISO(isoStr) {
  if (!isoStr) return null;
  const [y, m, d] = isoStr.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function excelDATEDIF_D(d1, d2) {
  if (!d1 || !d2 || d2 < d1) return 0;
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function excelTimeDecimal(strHeure) {
  if (!strHeure) return 0;
  const parts = strHeure.trim().split(":");
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return (h * 60 + m) / (24 * 60);
}

// Weekend = 7 dans Excel -> Vendredi (5) et Samedi (6)
export function excelNETWORKDAYS_INTL_7(dStart, dEnd) {
  if (!dStart || !dEnd || dEnd < dStart) return 0;
  let count = 0;
  const cur = new Date(dStart.getTime());
  while (cur <= dEnd) {
    const day = cur.getDay();
    if (day !== 5 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}
