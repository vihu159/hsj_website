import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getAllPending, getPendingById, removePending } from "@/lib/pending";
import { getCollectionBySlug } from "@/lib/collections";
import fs from "fs";
import path from "path";

const contentDir = path.join(process.cwd(), "content/collections");

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = getAllPending();
  return Response.json(items);
}

/** Bulk approve or reject. Body: { ids: string[], action: "approve" | "reject" }. */
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as { ids?: string[]; action?: "approve" | "reject" };
  const ids = Array.isArray(body.ids) ? body.ids : [];
  const action = body.action === "approve" || body.action === "reject" ? body.action : undefined;
  if (ids.length === 0 || !action) {
    return Response.json(
      { error: "Body must include ids (array) and action (approve or reject)" },
      { status: 400 }
    );
  }

  const errors: string[] = [];
  let approved = 0;
  let rejected = 0;

  if (action === "approve") {
    ids.forEach((id, index) => {
      const item = getPendingById(id);
      if (!item) {
        errors.push(`${id}: not found`);
        return;
      }
      const collection = getCollectionBySlug(item.collectionSlug, true);
      if (!collection) {
        errors.push(`${item.name}: collection "${item.collectionSlug}" not found`);
        return;
      }
      const piece = {
        id: `p-${Date.now()}-${index}`,
        name: item.name,
        description: item.description,
        image: item.image,
        status: "live" as const,
      };
      const updatedPieces = [...collection.pieces, piece];
      const filePath = path.join(contentDir, `${item.collectionSlug}.json`);
      const updated = { ...collection, pieces: updatedPieces };
      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
      removePending(id);
      approved++;
    });
  } else {
    for (const id of ids) {
      const ok = removePending(id);
      if (ok) rejected++;
      else errors.push(`${id}: not found`);
    }
  }

  return Response.json({
    ok: true,
    approved: action === "approve" ? approved : undefined,
    rejected: action === "reject" ? rejected : undefined,
    errors: errors.length > 0 ? errors : undefined,
  });
}
