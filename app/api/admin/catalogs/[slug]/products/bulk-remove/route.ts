import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { bulkRemoveCatalogProducts } from "@/lib/catalogs";

async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
}

/** Body: { productIds: string[] } */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await requireAdmin();
  const { slug } = await params;
  const body = (await request.json()) as { productIds: string[] };
  const productIds = body.productIds ?? [];
  if (!Array.isArray(productIds)) {
    return Response.json({ error: "productIds array required" }, { status: 400 });
  }
  const catalog = bulkRemoveCatalogProducts(slug, productIds);
  if (!catalog) return Response.json({ error: "Catalog not found" }, { status: 404 });
  return Response.json(catalog);
}
