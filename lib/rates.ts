import fs from "fs";
import path from "path";
import type { CatalogProduct, Category, Purity } from "./catalogs";
import { GOLD_MAKING_CODES, type Rates } from "./rates-types";

export { GOLD_MAKING_CODES, type Rates };

const defaultGoldMakingByCode: Record<string, number> = {
  AA: 15,
  BB: 21,
  CC: 24,
  DD: 28,
  EE: 30,
  FF: 33,
  GG: 36,
  HH: 39,
  II: 52,
};

const defaultRates: Rates = {
  gold24k: 0,
  gold22k: 0,
  gold18k: 0,
  gold14k: 0,
  silver: 0,
  diamondMakingRupees: 0,
  goldMakingByCode: defaultGoldMakingByCode,
  silverMakingRupees: 0,
  gstPercent: 0,
};

const contentPath = path.join(process.cwd(), "content/rates.json");

function ensureContentDir() {
  const dir = path.dirname(contentPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function getRates(): Rates {
  try {
    if (fs.existsSync(contentPath)) {
      const data = fs.readFileSync(contentPath, "utf-8");
      const parsed = JSON.parse(data) as Partial<Rates>;
      const merged = { ...defaultRates, ...parsed };
      // Merge goldMakingByCode so saved rates can override individual codes
      if (parsed.goldMakingByCode && typeof parsed.goldMakingByCode === "object") {
        merged.goldMakingByCode = { ...defaultGoldMakingByCode, ...parsed.goldMakingByCode };
      }
      return merged;
    }
  } catch {
    // ignore
  }
  return { ...defaultRates };
}

export function updateRates(updates: Partial<Rates>): Rates {
  ensureContentDir();
  const current = getRates();
  const next: Rates = { ...current, ...updates };
  fs.writeFileSync(contentPath, JSON.stringify(next, null, 2));
  return next;
}

function goldRateForPurity(rates: Rates, purity: Purity | undefined): number {
  if (!purity || purity === "Silver") return 0;
  switch (purity) {
    case "24k": return rates.gold24k;
    case "22k": return rates.gold22k;
    case "18k": return rates.gold18k;
    case "14k": return rates.gold14k;
    default: return rates.gold22k;
  }
}

/** Stone amount in rupees = stoneRate * stonesCt */
export function stoneAmount(p: CatalogProduct): number {
  const ct = p.stonesCt ?? 0;
  const rate = p.stoneRate ?? 0;
  return ct * rate;
}

/** Diamond amount in rupees = diamondRate * diamondWt (and optional second: diamondRate2 * diamondWt2) */
export function diamondAmount(p: CatalogProduct): number {
  const part1 = (p.diamondWt ?? 0) * (p.diamondRate ?? 0);
  const part2 = (p.diamondWt2 ?? 0) * (p.diamondRate2 ?? 0);
  return part1 + part2;
}

/**
 * Compute product price based on category, product fields, and current rates.
 * Gold: ((gold rate of purity + making % applied to rate) * net wt) + (stone amount)
 * Diamond: ((gold rate + making in rupees) * net wt) + (diamond rate * diamond wt)
 * Silver formula: (silver rate + making in rupees) * net wt
 * Silver MRP: direct mrp
 */
export function computeProductPrice(
  product: CatalogProduct,
  category: Category,
  rates: Rates
): number | null {
  const netWt = product.netWt ?? 0;
  const purity = product.purity;

  if (category === "Silver") {
    if (product.pricingType === "mrp" && typeof product.mrp === "number") {
      return product.mrp;
    }
    // Silver formula: (silver rate + making in rupees) * net wt
    const makingRupees = product.makingCharges ?? rates.silverMakingRupees;
    const silverRate = rates.silver + makingRupees;
    return silverRate * netWt;
  }

  if (category === "Diamond" && purity && purity !== "Silver") {
    // ((Rate of purity + Diamond making) * net weight) + (diamond wt 1 * rate 1) + (diamond wt 2 * rate 2) + (stone weight * stone rate)
    const goldRate = goldRateForPurity(rates, purity);
    const makingRupees = rates.diamondMakingRupees;
    const goldPart = (goldRate + makingRupees) * netWt;
    const diamondPart = diamondAmount(product);
    const stonePart = stoneAmount(product);
    return goldPart + diamondPart + stonePart;
  }

  if (category === "Polki") {
    // ((Rate of purity + Diamond making) * net weight) + (polki weight * polki rate) + (diamond weight * diamond rate) + (stone weight * stone rate)
    const goldRate = goldRateForPurity(rates, purity);
    const makingRupees = rates.diamondMakingRupees;
    const goldPart = (goldRate + makingRupees) * netWt;
    const polkiWt = product.polkiWt ?? product.grossWt ?? 0;
    const polkiRate = product.polkiRate ?? 0;
    const polkiPart = polkiWt * polkiRate;
    const diamondPart = diamondAmount(product);
    const stonePart = stoneAmount(product);
    return goldPart + polkiPart + diamondPart + stonePart;
  }

  if (
    category === "Gold" ||
    (purity && purity !== "Silver")
  ) {
    // ((gold rate of purity + making % from code) * net wt) + (stone amount)
    const goldRate = goldRateForPurity(rates, purity);
    const code = (product.makingCode ?? "").trim().toUpperCase();
    const makingPct = code ? (rates.goldMakingByCode[code] ?? 0) : (product.makingCharges ?? 0);
    const rateWithMaking = goldRate * (1 + makingPct / 100);
    const goldPart = rateWithMaking * netWt;
    const stonePart = stoneAmount(product);
    return goldPart + stonePart;
  }

  return null;
}

/**
 * Apply GST to a base price. Returns GST amount and total (base + GST).
 * If gstPercent is 0 or basePrice is null, returns { gstAmount: 0, totalPrice: basePrice ?? 0 }.
 */
export function applyGst(
  basePrice: number | null,
  gstPercent: number
): { gstAmount: number; totalPrice: number } {
  if (basePrice == null || basePrice <= 0) return { gstAmount: 0, totalPrice: 0 };
  const pct = Math.max(0, Math.min(100, gstPercent));
  const gstAmount = Math.round((basePrice * pct) / 100);
  return { gstAmount, totalPrice: basePrice + gstAmount };
}
