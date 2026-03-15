import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";
import { getAllPhotoshoots } from "@/lib/photoshoots";
import type { Photoshoot, PhotoshootSummary } from "@/lib/photoshoots";

const contentDir = path.join(process.cwd(), "content/photoshoots");

async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
}

export async function GET() {
  await requireAdmin();
  const list = getAllPhotoshoots();
  return Response.json(list);
}

export async function POST(request: NextRequest) {
  await requireAdmin();
  const body = (await request.json()) as {
    slug: string;
    title: string;
    date?: string;
    caption?: string;
    coverImage?: string;
  };
  const slug = (body.slug || "").replace(/[^a-z0-9-]/gi, "-").toLowerCase() || "photoshoot";
  const index = getAllPhotoshoots();
  if (index.some((p) => p.slug === slug)) {
    return Response.json({ error: "Slug already exists" }, { status: 400 });
  }
  const summary: PhotoshootSummary = {
    slug,
    title: body.title || slug,
    date: body.date,
    coverImage: body.coverImage || "/placeholder.svg",
    caption: body.caption,
  };
  const indexPath = path.join(contentDir, "index.json");
  const indexData = JSON.parse(fs.readFileSync(indexPath, "utf-8")) as PhotoshootSummary[];
  indexData.push(summary);
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
  const detail: Photoshoot = { ...summary, images: [] } as Photoshoot;
  fs.writeFileSync(
    path.join(contentDir, `${slug}.json`),
    JSON.stringify(detail, null, 2)
  );
  return Response.json(detail);
}
