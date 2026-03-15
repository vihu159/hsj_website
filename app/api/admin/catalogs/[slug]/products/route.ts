import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getCatalogBySlug, addCatalogProducts } from "@/lib/catalogs";

async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
}

type ProductInput = {
  name: string;
  description?: string;
  image?: string;
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

/** Bulk add products. Body: { products: ProductInput[] }. Same fields as Excel template. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await requireAdmin();
  const { slug } = await params;
  const body = (await request.json()) as { products: ProductInput[] };
  const products = body.products ?? [];
  if (!Array.isArray(products) || products.length === 0) {
    return Response.json({ error: "products array required" }, { status: 400 });
  }
  const catalog = addCatalogProducts(
    slug,
    products.map((p) => ({
      name: p.name ?? "",
      description: p.description ?? "",
      image: p.image ?? "",
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : undefined,
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
    }))
  );
  if (!catalog) return Response.json({ error: "Catalog not found" }, { status: 404 });
  return Response.json(catalog);
}
