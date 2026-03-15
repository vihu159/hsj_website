/** Gold making codes (editable percentages in Admin → Rates). Safe to import in client components. */
export const GOLD_MAKING_CODES = ["AA", "BB", "CC", "DD", "EE", "FF", "GG", "HH", "II"] as const;

export type Rates = {
  gold24k: number;
  gold22k: number;
  gold18k: number;
  gold14k: number;
  silver: number;
  diamondMakingRupees: number;
  goldMakingByCode: Record<string, number>;
  silverMakingRupees: number;
  /** GST percent applied to product amount after final calculation (e.g. 3 for 3%). */
  gstPercent: number;
};
