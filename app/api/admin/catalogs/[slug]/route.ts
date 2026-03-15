import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import {
  getCatalogBySlug,
  updateCatalog,
  deleteCatalog,
  syncCatalogIndex,
  type Catalog,
} from "@/lib/catalogs";
import fs from "fs";
import path from "path";

async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await requireAdmin();
  const { slug } = await params;
  const catalog = getCatalogBySlug(slug);
  if (!catalog) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(catalog);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await requireAdmin();
  const { slug } = await params;
  const body = (await request.json()) as Partial<Catalog>;
  const current = getCatalogBySlug(slug);
  if (!current) return Response.json({ error: "Not found" }, { status: 404 });
  const updated: Catalog = {
    slug: current.slug,
    category: body.category ?? current.category,
    subcategory: body.subcategory ?? current.subcategory,
    title: body.title ?? current.title,
    status: body.status ?? current.status,
    products: body.products ?? current.products,
  };
  const contentDir = path.join(process.cwd(), "content/catalogs");
  fs.writeFileSync(
    path.join(contentDir, `${slug}.json`),
    JSON.stringify(updated, null, 2)
  );
  syncCatalogIndex();
  const catalog = getCatalogBySlug(slug);
  return Response.json(catalog ?? updated);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await requireAdmin();
  const { slug } = await params;
  const body = (await request.json()) as { title?: string; status?: "live" | "archived" };
  const updated = updateCatalog(slug, body);
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await requireAdmin();
  const { slug } = await params;
  const ok = deleteCatalog(slug);
  if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ok: true });
}
