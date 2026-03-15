import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { addPendingItems } from "@/lib/pending";
import { CREATIVE_SIZES } from "@/lib/creative-sizes";
import fs from "fs";
import path from "path";
import sharp from "sharp";

async function requireAdmin() {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

const { width: recW, height: recH } = CREATIVE_SIZES.pieceImage;

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }
  const collectionSlug = (formData.get("collectionSlug") as string) || "";
  if (!collectionSlug) {
    return Response.json({ error: "collectionSlug required" }, { status: 400 });
  }

  const files = formData.getAll("files") as File[];
  const accepted: { url: string; name: string }[] = [];
  const rejected: { name: string; reason: string }[] = [];

  const dir = path.join(process.cwd(), "public", "images", "collections");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const file of files) {
    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      rejected.push({ name: file.name, reason: "Not an image" });
      continue;
    }
    try {
      const buf = Buffer.from(await file.arrayBuffer());
      const meta = await sharp(buf).metadata();
      const w = meta.width ?? 0;
      const h = meta.height ?? 0;
      if (!w || !h) {
        rejected.push({ name: file.name, reason: "Invalid image" });
        continue;
      }

      // Always accept: auto-orient + crop/resize to recommended piece size (center crop for jewellery).
      const ext = ".jpg";
      const base = path.basename(file.name, path.extname(file.name)).replace(/[^a-z0-9-_]/gi, "-");
      const filename = `${base}-${Date.now()}${ext}`;
      const filePath = path.join(dir, filename);
      await sharp(buf)
        .rotate()
        .resize(recW, recH, { fit: "cover", position: "center" })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(filePath);
      const url = `/images/collections/${filename}`;
      const name = path.basename(file.name, path.extname(file.name)).replace(/-/g, " ");
      accepted.push({ url, name });
    } catch (err) {
      rejected.push({
        name: file.name,
        reason: err instanceof Error ? err.message : "Invalid image",
      });
    }
  }

  const pendingItems = accepted.map((a) => ({
    collectionSlug,
    name: a.name,
    description: "",
    image: a.url,
    source: "bulk" as const,
  }));
  addPendingItems(pendingItems);

  return Response.json({
    accepted: accepted.length,
    rejected: rejected.length,
    acceptedUrls: accepted.map((a) => a.url),
    rejectedDetails: rejected,
  });
}
