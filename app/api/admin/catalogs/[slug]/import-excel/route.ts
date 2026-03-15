import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getCatalogBySlug, addCatalogProducts } from "@/lib/catalogs";
import * as XLSX from "xlsx";

async function requireAdmin() {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/** Import products from Excel. Columns: name, description, image_url, gross_wt, net_wt, purity, making_charges, stones_ct, stone_rate, diamond_wt, diamond_rate, pricing_type, mrp. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireAdmin();
  if (auth) return auth;
  const { slug } = await params;

  const catalog = getCatalogBySlug(slug);
  if (!catalog) {
    return Response.json({ error: "Catalog not found" }, { status: 404 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }
  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return Response.json({ error: "No file" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buf, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

  type ProductRow = {
    name: string;
    description: string;
    image: string;
    images?: string[];
    grossWt?: number;
    netWt?: number;
    purity?: "24k" | "22k" | "18k" | "14k" | "Silver";
    makingCharges?: number;
    makingCode?: string;
    stonesCt?: number;
    stoneRate?: number;
    diamondWt?: number;
    diamondRate?: number;
    diamondWt2?: number;
    diamondRate2?: number;
    polkiWt?: number;
    polkiRate?: number;
    pricingType?: "formula" | "mrp";
    mrp?: number;
  };
  const products: ProductRow[] = [];

  /** Only accept values that look like URLs or paths (avoid template labels like "Main image (required)"). */
  function isValidImageUrl(s: string): boolean {
    const t = s.trim();
    return t.length > 0 && (t.startsWith("/") || t.startsWith("http://") || t.startsWith("https://"));
  }

  /** Collect image URLs from row; only include valid URLs, never template text. */
  function collectImageUrls(row: Record<string, string>): string[] {
    const primary = (row.image_url ?? row.image ?? row.imageUrl ?? "").trim();
    const urls: string[] = [];
    if (isValidImageUrl(primary)) urls.push(primary);
    for (let n = 2; n <= 20; n++) {
      const v = (row[`image_url_${n}`] ?? row[`image_${n}`] ?? "").trim();
      if (isValidImageUrl(v)) urls.push(v);
    }
    if (urls.length === 0) urls.push("/placeholder.svg");
    return urls;
  }

  /** Skip template/note rows from the downloadable template (e.g. "Required", "Optional"). */
  const skipNames = new Set(["required", "optional", "example necklace", "example"]);

  function num(val: string | undefined): number | undefined {
    if (val === undefined || val === "") return undefined;
    const n = Number(String(val).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : undefined;
  }

  function purityVal(val: string | undefined): "24k" | "22k" | "18k" | "14k" | "Silver" | undefined {
    const s = (val ?? "").trim().toLowerCase().replace(/\s/g, "");
    if (["24k", "22k", "18k", "14k", "silver"].includes(s)) return s as "24k" | "22k" | "18k" | "14k" | "Silver";
    return undefined;
  }

  for (const row of rows) {
    const name = (row.name ?? row.title ?? "").trim();
    if (!name) continue;
    if (skipNames.has(name.toLowerCase())) continue;
    const primaryImage = (row.image_url ?? row.image ?? row.imageUrl ?? "").trim().toLowerCase();
    if (primaryImage && primaryImage.includes("required") && primaryImage.includes("image")) continue;
    const description = (row.description ?? row.desc ?? "").trim();
    const imageUrls = collectImageUrls(row);
    const allImages = imageUrls.length > 0 ? imageUrls : ["/placeholder.svg"];
    const image = allImages[0];
    const pricingTypeRaw = (row.pricing_type ?? row.pricingType ?? "").trim().toLowerCase();
    const pricingType = pricingTypeRaw === "mrp" ? "mrp" : pricingTypeRaw === "formula" ? "formula" : undefined;
    const makingCodeRaw = (row.making_code ?? row.makingCode ?? "").trim().toUpperCase();
    const makingCode = makingCodeRaw || undefined;
    products.push({
      name,
      description,
      image,
      images: allImages.length > 1 ? allImages : undefined,
      grossWt: num(row.gross_wt ?? row.grossWt),
      netWt: num(row.net_wt ?? row.netWt),
      purity: purityVal(row.purity),
      makingCharges: num(row.making_charges ?? row.makingCharges),
      makingCode,
      stonesCt: num(row.stones_ct ?? row.stonesCt),
      stoneRate: num(row.stone_rate ?? row.stoneRate),
      diamondWt: num(row.diamond_wt ?? row.diamondWt),
      diamondRate: num(row.diamond_rate ?? row.diamondRate),
      diamondWt2: num(row.diamond_wt_2 ?? row.diamondWt2),
      diamondRate2: num(row.diamond_rate_2 ?? row.diamondRate2),
      polkiWt: num(row.polki_wt ?? row.polkiWt),
      polkiRate: num(row.polki_rate ?? row.polkiRate),
      pricingType,
      mrp: num(row.mrp),
    });
  }

  if (products.length === 0) {
    return Response.json({ error: "No valid rows (need at least 'name' column)" }, { status: 400 });
  }

  addCatalogProducts(slug, products);
  return Response.json({ ok: true, count: products.length });
}
