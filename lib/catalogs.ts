import fs from "fs";
import path from "path";

export const CATEGORIES = ["Gold", "Silver", "Diamond", "Polki"] as const;

/** Suggested subcategories; you can use any custom subcategory when creating a catalog */
export const SUBCATEGORIES = [
  "Necklace",
  "Ring",
  "Earring",
  "Set of 3",
  "Nath",
  "Tika",
  "Bangles",
  "Bracelet",
  "Mangalsutra",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Purity = "24k" | "22k" | "18k" | "14k" | "Silver";

export type CatalogProduct = {
  id: string;
  name: string;
  description: string;
  /** Primary/cover image. */
  image: string;
  /** Additional images (e.g. other angles). First image is the primary; may be duplicated in image. */
  images?: string[];
  status: "live" | "archived";
  /** Weight in grams */
  grossWt?: number;
  /** Weight in grams (for pricing) */
  netWt?: number;
  purity?: Purity;
  /** For gold: making code (AA, BB, CC, …); for silver formula: rupees per gram */
  makingCharges?: number;
  /** Gold making code (AA–II). Looked up in rates for percentage. */
  makingCode?: string;
  /** Stones in carats */
  stonesCt?: number;
  /** Rate per carat (stone amount = stoneRate * stonesCt) */
  stoneRate?: number;
  /** Diamond weight (e.g. in ct) */
  diamondWt?: number;
  /** Rate per unit (diamond amount = diamondRate * diamondWt) */
  diamondRate?: number;
  /** Diamond 2 weight (Diamond category can have two diamond components) */
  diamondWt2?: number;
  /** Diamond 2 rate per unit */
  diamondRate2?: number;
  /** Polki only: weight in g for polki component */
  polkiWt?: number;
  /** Polki only: rate per unit (polki amount = polkiRate * polkiWt) */
  polkiRate?: number;
  /** Silver only: "formula" or "mrp" */
  pricingType?: "formula" | "mrp";
  /** Silver only: direct MRP when pricingType is "mrp" */
  mrp?: number;
};

export type Catalog = {
  slug: string;
  category: Category;
  /** Subcategory name (e.g. Necklace, or custom like Kada, Choker, Haar) */
  subcategory: string;
  title: string;
  status: "live" | "archived";
  products: CatalogProduct[];
};

export type CatalogSummary = {
  slug: string;
  category: Category;
  subcategory: string;
  title: string;
  status: "live" | "archived";
  productCount: number;
  liveCount: number;
};

const contentDir = path.join(process.cwd(), "content/catalogs");

function ensureDir() {
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }
}

export function getAllCatalogs(): CatalogSummary[] {
  ensureDir();
  const indexPath = path.join(contentDir, "index.json");
  if (!fs.existsSync(indexPath)) return [];
  try {
    const data = fs.readFileSync(indexPath, "utf-8");
    const list = JSON.parse(data) as CatalogSummary[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function getCatalogBySlug(slug: string): Catalog | null {
  const filePath = path.join(contentDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const cat = JSON.parse(data) as Catalog;
    if (!cat || !Array.isArray(cat.products)) return null;
    return cat;
  } catch {
    return null;
  }
}

/** Catalogs that are live and have at least one live product — for menu and public pages */
export function getLiveCatalogs(): Catalog[] {
  const index = getAllCatalogs();
  const result: Catalog[] = [];
  for (const sum of index) {
    if (!sum?.slug || sum.status !== "live" || (sum.liveCount ?? 0) === 0) continue;
    const cat = getCatalogBySlug(sum.slug);
    if (cat && Array.isArray(cat.products) && cat.products.some((p) => p.status === "live")) result.push(cat);
  }
  return result;
}

/** Group live catalogs by category, then by subcategory — for building the menu */
export function getMenuCatalogGroups(): { category: Category; catalogs: Catalog[] }[] {
  const live = getLiveCatalogs();
  const byCategory = new Map<Category, Catalog[]>();
  for (const cat of live) {
    if (!byCategory.has(cat.category)) byCategory.set(cat.category, []);
    byCategory.get(cat.category)!.push(cat);
  }
  return CATEGORIES.filter((c) => byCategory.has(c)).map((category) => ({
    category,
    catalogs: byCategory.get(category)!,
  }));
}

/** Slugify subcategory for URL (lowercase, spaces and special chars to single dash) */
export function slugFromCategorySubcategory(category: Category, subcategory: string): string {
  const cat = category.toLowerCase();
  const sub = (subcategory || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return sub ? `${cat}-${sub}` : cat;
}

function counts(catalog: Catalog): { productCount: number; liveCount: number } {
  const liveCount = catalog.products.filter((p) => p.status === "live").length;
  return { productCount: catalog.products.length, liveCount };
}

export function syncCatalogIndex() {
  const list: CatalogSummary[] = [];
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".json") && f !== "index.json");
  for (const f of files) {
    const slug = f.replace(/\.json$/, "");
    const cat = getCatalogBySlug(slug);
    if (cat)
      list.push({
        slug: cat.slug,
        category: cat.category,
        subcategory: cat.subcategory,
        title: cat.title,
        status: cat.status,
        ...counts(cat),
      });
  }
  fs.writeFileSync(path.join(contentDir, "index.json"), JSON.stringify(list, null, 2));
}

function syncIndex() {
  syncCatalogIndex();
}

export function createCatalog(
  category: Category,
  subcategory: string,
  title: string
): Catalog {
  ensureDir();
  const sub = (subcategory || "").trim();
  if (!sub) throw new Error("Subcategory is required");
  const slug = slugFromCategorySubcategory(category, sub);
  const filePath = path.join(contentDir, `${slug}.json`);
  if (fs.existsSync(filePath)) throw new Error("Catalog slug already exists");
  const catalog: Catalog = {
    slug,
    category,
    subcategory: sub,
    title: title || `${category} ${sub}`,
    status: "live",
    products: [],
  };
  fs.writeFileSync(filePath, JSON.stringify(catalog, null, 2));
  syncIndex();
  return catalog;
}

export function updateCatalog(
  slug: string,
  updates: Partial<Pick<Catalog, "title" | "status">>
): Catalog | null {
  const cat = getCatalogBySlug(slug);
  if (!cat) return null;
  const updated: Catalog = {
    ...cat,
    ...updates,
  };
  fs.writeFileSync(path.join(contentDir, `${slug}.json`), JSON.stringify(updated, null, 2));
  syncIndex();
  return updated;
}

export function deleteCatalog(slug: string): boolean {
  const filePath = path.join(contentDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  syncIndex();
  return true;
}

export function addCatalogProducts(
  slug: string,
  products: (Omit<CatalogProduct, "id" | "status"> & { images?: string[] })[]
): Catalog | null {
  const cat = getCatalogBySlug(slug);
  if (!cat) return null;
  const newProducts: CatalogProduct[] = products.map((p, i) => {
    const allImages = Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : [p.image || "/placeholder.svg"];
    const image = allImages[0] || p.image || "/placeholder.svg";
    return {
      id: `prod-${Date.now()}-${i}`,
      name: p.name ?? "",
      description: p.description ?? "",
      image,
      images: allImages.length > 1 ? allImages : undefined,
      status: "live" as const,
      grossWt: p.grossWt,
      netWt: p.netWt,
      purity: p.purity,
      makingCharges: p.makingCharges,
      makingCode: p.makingCode,
      stonesCt: p.stonesCt,
      stoneRate: p.stoneRate,
      diamondWt: p.diamondWt,
      diamondRate: p.diamondRate,
      diamondWt2: p.diamondWt2,
      diamondRate2: p.diamondRate2,
      polkiWt: p.polkiWt,
      polkiRate: p.polkiRate,
      pricingType: p.pricingType,
      mrp: p.mrp,
    };
  });
  const updated: Catalog = { ...cat, products: [...cat.products, ...newProducts] };
  fs.writeFileSync(path.join(contentDir, `${slug}.json`), JSON.stringify(updated, null, 2));
  syncIndex();
  return updated;
}

export function setCatalogProductStatus(
  slug: string,
  productId: string,
  status: "live" | "archived"
): Catalog | null {
  const cat = getCatalogBySlug(slug);
  if (!cat) return null;
  const products = cat.products.map((p) => (p.id === productId ? { ...p, status } : p));
  if (products.every((p) => p.id !== productId || p.status === status)) {
    const found = products.some((p) => p.id === productId);
    if (!found) return null;
  }
  const updated: Catalog = { ...cat, products };
  fs.writeFileSync(path.join(contentDir, `${slug}.json`), JSON.stringify(updated, null, 2));
  syncIndex();
  return updated;
}

/** Update a product's details (name, description, image, pricing fields, etc.). */
export function updateCatalogProduct(
  slug: string,
  productId: string,
  updates: Partial<Omit<CatalogProduct, "id">>
): Catalog | null {
  const cat = getCatalogBySlug(slug);
  if (!cat) return null;
  const index = cat.products.findIndex((p) => p.id === productId);
  if (index === -1) return null;
  const current = cat.products[index];
  const merged = { ...current, ...updates, id: current.id };
  if (updates.images !== undefined && updates.images.length > 0) {
    merged.image = updates.images[0];
    merged.images = updates.images;
  } else if (updates.image !== undefined) {
    merged.image = updates.image;
    if (!merged.images || merged.images[0] !== updates.image) {
      merged.images = [updates.image, ...(current.images ?? [current.image]).filter((u) => u !== updates.image)];
    }
  }
  const products = cat.products.slice();
  products[index] = merged;
  const updated: Catalog = { ...cat, products };
  fs.writeFileSync(path.join(contentDir, `${slug}.json`), JSON.stringify(updated, null, 2));
  syncIndex();
  return updated;
}

export function removeCatalogProduct(slug: string, productId: string): Catalog | null {
  const cat = getCatalogBySlug(slug);
  if (!cat) return null;
  const products = cat.products.filter((p) => p.id !== productId);
  if (products.length === cat.products.length) return null;
  const updated: Catalog = { ...cat, products };
  fs.writeFileSync(path.join(contentDir, `${slug}.json`), JSON.stringify(updated, null, 2));
  syncIndex();
  return updated;
}

export function bulkRemoveCatalogProducts(slug: string, productIds: string[]): Catalog | null {
  const cat = getCatalogBySlug(slug);
  if (!cat) return null;
  const set = new Set(productIds);
  const products = cat.products.filter((p) => !set.has(p.id));
  const updated: Catalog = { ...cat, products };
  fs.writeFileSync(path.join(contentDir, `${slug}.json`), JSON.stringify(updated, null, 2));
  syncIndex();
  return updated;
}
