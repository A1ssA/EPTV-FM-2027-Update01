import { describe, expect, it } from "vitest";
import { ChiffreLettre, ConvertirPartie } from "../../src/utils/chiffreLettre.js";
import { formaterMontantDA } from "../../src/utils/format.js";
import { chargerOriginal } from "../helpers/loadOriginal.js";

const orig = chargerOriginal();

describe("ChiffreLettre / ConvertirPartie : identiques à l'original", () => {
  it("ConvertirPartie 0..999", () => {
    for (let n = 0; n <= 999; n++) expect(ConvertirPartie(n)).toBe(orig.ConvertirPartie(n));
  });

  it("ChiffreLettre 0..60000 (entiers)", () => {
    for (let n = 0; n <= 60000; n++) expect(ChiffreLettre(n)).toBe(orig.ChiffreLettre(n));
  });

  it("ChiffreLettre : grands montants, négatifs et décimaux", () => {
    const valeurs = [99999, 100000, 123456, 999999, 1000000, 1000001, 2500000, 80000000, 999999999,
      1000000000, 1234567890, 2000000000, 9999999999, -1, -3200, 0.5, 12.34, 3200.99, 0.01, 1e12];
    for (let i = 0; i < 3000; i++) valeurs.push(Math.floor(Math.random() * 3e9), Math.random() * 1e6);
    for (const v of valeurs) expect(ChiffreLettre(v)).toBe(orig.ChiffreLettre(v));
  });

  it("exemples de référence", () => {
    expect(ChiffreLettre(0)).toBe("Zéro Dinars");
    expect(ChiffreLettre(71)).toBe("Soixante et Onze Dinars");
    expect(ChiffreLettre(80)).toBe("Quatre-vingts Dinars");
    expect(ChiffreLettre(3200)).toBe("Trois Mille Deux Cents Dinars");
  });

  it("formatage du total : séparateur de milliers = espace ordinaire", () => {
    expect(formaterMontantDA(0)).toBe("0 DA");
    expect(formaterMontantDA(1234567)).toBe("1 234 567 DA");
    expect(formaterMontantDA(-45300)).toBe("-45 300 DA");
    expect(formaterMontantDA(1000)).not.toContain("\u00a0");
  });
});
