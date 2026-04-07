import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";
import sharp from "sharp";

// Max dimension (width or height) for processed site images — preserves aspect ratio.
const SITE_IMAGE_MAX_PX = 1400;

async function requireAdmin() {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }
  const type = (formData.get("type") as string) || "collections";
  const isVideo = type === "videos";
  if (type !== "collections" && type !== "photoshoots" && type !== "site" && type !== "bulk" && !isVideo) {
    return Response.json({ error: "Invalid type" }, { status: 400 });
  }
  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return Response.json({ error: "No file" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (isVideo) {
    const allowed = [".mp4", ".webm", ".mov"];
    if (!allowed.includes(ext)) {
      return Response.json({ error: "Video must be MP4, WebM, or MOV" }, { status: 400 });
    }
  }

  const dir = isVideo
    ? path.join(process.cwd(), "public", "videos")
    : path.join(process.cwd(), "public", "images", type);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const base = path.basename(file.name, path.extname(file.name)).replace(/[^a-z0-9-_]/gi, "-");
  const bytes = await file.arrayBuffer();
  const buf = Buffer.from(bytes);

  if (isVideo) {
    const safeExt = ext;
    const filename = `${base}-${Date.now()}${safeExt}`;
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, buf);
    return Response.json({ url: `/videos/${filename}` });
  }

  // Process images with sharp: auto-orient (fix EXIF rotation) + resize to fit within max dimension.
  // PNGs keep PNG format (preserves transparency for logos). Everything else → JPEG.
  const isPng = ext === ".png";
  const outExt = isPng ? ".png" : ".jpg";
  const filename = `${base}-${Date.now()}${outExt}`;
  const filePath = path.join(dir, filename);

  try {
    let pipeline = sharp(buf)
      .rotate() // auto-orient from EXIF
      .resize(SITE_IMAGE_MAX_PX, SITE_IMAGE_MAX_PX, { fit: "inside", withoutEnlargement: true });

    if (isPng) {
      pipeline = pipeline.png({ compressionLevel: 8 });
    } else {
      pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true });
    }

    await pipeline.toFile(filePath);
  } catch {
    // If sharp fails (e.g. SVG or unusual format), fall back to saving the raw bytes.
    fs.writeFileSync(filePath, buf);
  }

  return Response.json({ url: `/images/${type}/${filename}` });
}
