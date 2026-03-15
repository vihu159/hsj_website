import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getPhotoshootBySlug, type PhotoshootSummary } from "@/lib/photoshoots";
import { CREATIVE_SIZES } from "@/lib/creative-sizes";
import fs from "fs";
import path from "path";
import sharp from "sharp";

async function requireAdmin() {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

const { width: recW, height: recH } = CREATIVE_SIZES.photoshootImage;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireAdmin();
  if (auth) return auth;

  const { slug } = await params;
  const shoot = getPhotoshootBySlug(slug);
  if (!shoot) {
    return Response.json({ error: "Photoshoot not found" }, { status: 404 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const files = formData.getAll("files") as File[];
  const accepted: { url: string; alt: string }[] = [];
  const rejected: { name: string; reason: string }[] = [];

  const dir = path.join(process.cwd(), "public", "images", "photoshoots");
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

      // Always accept: auto-orient + crop/resize to recommended photoshoot size.
      const ext = ".jpg";
      const base = path.basename(file.name, path.extname(file.name)).replace(/[^a-z0-9-_]/gi, "-");
      const filename = `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
      const filePath = path.join(dir, filename);
      await sharp(buf)
        .rotate()
        .resize(recW, recH, { fit: "cover", position: "attention" })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(filePath);
      const url = `/images/photoshoots/${filename}`;
      const alt = path.basename(file.name, path.extname(file.name)).replace(/-/g, " ");
      accepted.push({ url, alt });
    } catch (err) {
      rejected.push({
        name: file.name,
        reason: err instanceof Error ? err.message : "Invalid image",
      });
    }
  }

  if (accepted.length === 0) {
    return Response.json({
      accepted: 0,
      rejected: rejected.length,
      rejectedDetails: rejected,
      images: shoot.images,
    });
  }

  const newImages = accepted.map((a) => ({ src: a.url, alt: a.alt }));
  const updatedImages = [...shoot.images, ...newImages];
  let coverImage = shoot.coverImage;
  if (!coverImage || coverImage === "/placeholder.svg") {
    coverImage = newImages[0].src;
  }

  const contentDir = path.join(process.cwd(), "content/photoshoots");
  const filePath = path.join(contentDir, `${slug}.json`);
  const updated = {
    ...shoot,
    coverImage,
    images: updatedImages,
  };
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));

  const indexPath = path.join(contentDir, "index.json");
  const indexData = JSON.parse(fs.readFileSync(indexPath, "utf-8")) as PhotoshootSummary[];
  const i = indexData.findIndex((p) => p.slug === slug);
  if (i >= 0) {
    indexData[i] = {
      slug: updated.slug,
      title: updated.title,
      date: updated.date,
      coverImage: updated.coverImage,
      caption: updated.caption,
    };
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
  }

  return Response.json({
    accepted: accepted.length,
    rejected: rejected.length,
    rejectedDetails: rejected,
    images: updatedImages,
    coverImage: updated.coverImage,
  });
}
