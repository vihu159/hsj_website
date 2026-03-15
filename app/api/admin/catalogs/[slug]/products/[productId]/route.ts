import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { updateCatalogProduct } from "@/lib/catalogs";

async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
}

type ProductPatchBody = {
  status?: "live" | "archived";
  name?: string;
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

/** Update product: status only, or full details (name, description, image, pricing, etc.). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; productId: string }> }
) {
  await requireAdmin();
  const { slug, productId } = await params;
  const body = (await request.json()) as ProductPatchBody;
  const catalog = updateCatalogProduct(slug, productId, {
    ...(body.status && { status: body.status }),
    ...(body.name !== undefined && { name: body.name }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.image !== undefined && { image: body.image }),
    ...(body.images !== undefined && { images: body.images }),
    ...(body.grossWt !== undefined && { grossWt: body.grossWt }),
    ...(body.netWt !== undefined && { netWt: body.netWt }),
    ...(body.purity !== undefined && { purity: body.purity }),
    ...(body.makingCharges !== undefined && { makingCharges: body.makingCharges }),
    ...(body.makingCode !== undefined && { makingCode: body.makingCode }),
    ...(body.stonesCt !== undefined && { stonesCt: body.stonesCt }),
    ...(body.stoneRate !== undefined && { stoneRate: body.stoneRate }),
    ...(body.diamondWt !== undefined && { diamondWt: body.diamondWt }),
    ...(body.diamondRate !== undefined && { diamondRate: body.diamondRate }),
    ...(body.diamondWt2 !== undefined && { diamondWt2: body.diamondWt2 }),
    ...(body.diamondRate2 !== undefined && { diamondRate2: body.diamondRate2 }),
    ...(body.polkiWt !== undefined && { polkiWt: body.polkiWt }),
    ...(body.polkiRate !== undefined && { polkiRate: body.polkiRate }),
    ...(body.pricingType !== undefined && { pricingType: body.pricingType }),
    ...(body.mrp !== undefined && { mrp: body.mrp }),
  });
  if (!catalog) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(catalog);
}

/** Remove a product from the catalog */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; productId: string }> }
) {
  await requireAdmin();
  const { slug, productId } = await params;
  const catalog = removeCatalogProduct(slug, productId);
  if (!catalog) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(catalog);
}
