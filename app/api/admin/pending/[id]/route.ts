import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import {
  getPendingById,
  removePending,
} from "@/lib/pending";
import { getCollectionBySlug } from "@/lib/collections";
import fs from "fs";
import path from "path";

const contentDir = path.join(process.cwd(), "content/collections");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const item = getPendingById(id);
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(item);
}

/** Approve: add to collection as live piece and remove from pending. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const item = getPendingById(id);
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });

  const collection = getCollectionBySlug(item.collectionSlug, true);
  if (!collection) {
    return Response.json({ error: "Collection not found" }, { status: 400 });
  }

  const piece = {
    id: `p-${Date.now()}`,
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
  return Response.json({ ok: true, piece });
}

/** Reject: remove from pending. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const ok = removePending(id);
  if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ok: true });
}
