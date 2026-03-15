import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import {
  getAllCatalogs,
  createCatalog,
  CATEGORIES,
  SUBCATEGORIES,
  type Category,
} from "@/lib/catalogs";

async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
}

export async function GET() {
  await requireAdmin();
  const list = getAllCatalogs();
  return Response.json({ catalogs: list, categories: CATEGORIES, subcategories: SUBCATEGORIES });
}

export async function POST(request: NextRequest) {
  await requireAdmin();
  const body = (await request.json()) as {
    category: Category;
    subcategory: string;
    title?: string;
  };
  const { category, subcategory, title } = body;
  if (!CATEGORIES.includes(category)) {
    return Response.json({ error: "Invalid category" }, { status: 400 });
  }
  const sub = (subcategory ?? "").trim();
  if (!sub) {
    return Response.json({ error: "Subcategory is required" }, { status: 400 });
  }
  try {
    const catalog = createCatalog(category, sub, title ?? "");
    return Response.json(catalog);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Slug already exists";
    return Response.json({ error: msg }, { status: 400 });
  }
}
