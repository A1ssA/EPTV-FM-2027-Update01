/**
 * MODULE 5 VBA : ChiffreLettre (montant en toutes lettres, en Dinars).
 * Portage à l'identique de la version d'origine.
 */

export function ConvertirPartie(Valeur) {
  const Unites = ["", "Un", "Deux", "Trois", "Quatre", "Cinq", "Six", "Sept", "Huit", "Neuf"];
  const SpecialDix = ["Dix", "Onze", "Douze", "Treize", "Quatorze", "Quinze", "Seize", "Dix-sept", "Dix-huit", "Dix-neuf"];
  let Resultat = "";

  if (Valeur >= 100) {
    const centaine = Math.floor(Valeur / 100);
    const reste = Valeur % 100;
    if (centaine === 1) Resultat = "Cent";
    else Resultat = Unites[centaine] + (reste === 0 ? " Cents" : " Cent");
    if (reste > 0) Resultat += " ";
    Valeur = reste;
  }

  if (Valeur >= 20) {
    const dizaine = Math.floor(Valeur / 10);
    const unite = Valeur % 10;
    if (dizaine >= 2 && dizaine <= 6) {
      const mapDiz = { 2: "Vingt", 3: "Trente", 4: "Quarante", 5: "Cinquante", 6: "Soixante" };
      Resultat += mapDiz[dizaine];
      if (unite === 1) Resultat += " et Un";
      else if (unite > 0) Resultat += "-" + Unites[unite];
    } else if (dizaine === 7) {
      const temp = Valeur - 60;
      Resultat += "Soixante";
      if (temp === 11) Resultat += " et " + SpecialDix[1];
      else Resultat += "-" + SpecialDix[temp - 10];
    } else if (dizaine === 8) {
      if (unite === 0) Resultat += "Quatre-vingts";
      else {
        Resultat += "Quatre-vingt";
        if (unite === 1) Resultat += "-un";
        else Resultat += "-" + Unites[unite];
      }
    } else if (dizaine === 9) {
      Resultat += "Quatre-vingt-" + SpecialDix[unite];
    }
  } else if (Valeur >= 10) {
    Resultat += SpecialDix[Valeur - 10];
  } else if (Valeur > 0) {
    Resultat += Unites[Valeur];
  }
  return Resultat.trim();
}

export function ChiffreLettre(Valeur) {
  let PartieEntiere = Math.floor(Valeur);
  const Centimes = Math.round((Valeur - PartieEntiere) * 100);
  let Resultat = "";

  if (PartieEntiere === 0) Resultat = "Zéro";

  if (PartieEntiere >= 1000000000) {
    const Milliards = Math.floor(PartieEntiere / 1000000000);
    Resultat += " " + ConvertirPartie(Milliards) + " Milliard" + (Milliards > 1 ? "s" : "");
    PartieEntiere %= 1000000000;
  }
  if (PartieEntiere >= 1000000) {
    const Millions = Math.floor(PartieEntiere / 1000000);
    Resultat += " " + ConvertirPartie(Millions) + " Million" + (Millions > 1 ? "s" : "");
    PartieEntiere %= 1000000;
  }
  if (PartieEntiere >= 1000) {
    const Milliers = Math.floor(PartieEntiere / 1000);
    Resultat += (Milliers === 1) ? " Mille" : " " + ConvertirPartie(Milliers) + " Mille";
    PartieEntiere %= 1000;
  }
  if (PartieEntiere > 0) Resultat += " " + ConvertirPartie(PartieEntiere);
  if (Centimes > 0) Resultat += " et " + ConvertirPartie(Centimes) + " Centime" + (Centimes > 1 ? "s" : "");

  return (Resultat + " Dinars").trim();
}
