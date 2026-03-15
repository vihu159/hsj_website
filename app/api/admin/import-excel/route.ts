import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { addPendingItems } from "@/lib/pending";
import * as XLSX from "xlsx";

async function requireAdmin() {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/** Download Excel template with expected columns and one example row */
export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;

  const headers = ["collection_slug", "name", "description", "image_url"];
  const exampleRow = ["heritage", "Example necklace", "Optional description", "https://example.com/image.jpg"];
  const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Items");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="bulk-import-template.xlsx"',
    },
  });
}

/** Expected columns: collection_slug, name, description, image_url (or image) */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

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

  const items: { collectionSlug: string; name: string; description: string; image: string; source: "excel" }[] = [];
  const normalize = (s: string) => (s || "").trim().toLowerCase().replace(/\s+/g, "-");

  for (const row of rows) {
    const collectionSlug = normalize(
      row.collection_slug ?? row.collection ?? row.collectionSlug ?? ""
    );
    const name = (row.name ?? row.title ?? "").trim();
    const description = (row.description ?? row.desc ?? "").trim();
    const image = (row.image_url ?? row.image ?? row.imageUrl ?? "").trim();
    if (!collectionSlug || !name) continue;
    items.push({
      collectionSlug,
      name,
      description,
      image: image || "/placeholder.svg",
      source: "excel",
    });
  }

  const created = addPendingItems(items);
  return Response.json({ ok: true, count: created.length, items: created });
}
