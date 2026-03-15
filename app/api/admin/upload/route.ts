import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";

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

  const safeExt = isVideo ? ext : (ext || ".jpg");
  const base = path.basename(file.name, path.extname(file.name)).replace(/[^a-z0-9-_]/gi, "-");
  const filename = `${base}-${Date.now()}${safeExt}`;
  const filePath = path.join(dir, filename);

  const bytes = await file.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(bytes));

  const url = isVideo ? `/videos/${filename}` : `/images/${type}/${filename}`;
  return Response.json({ url });
}
