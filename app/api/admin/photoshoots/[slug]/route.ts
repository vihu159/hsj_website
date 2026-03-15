import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";
import { getPhotoshootBySlug } from "@/lib/photoshoots";
import type { Photoshoot, PhotoshootImage, PhotoshootSummary } from "@/lib/photoshoots";

const contentDir = path.join(process.cwd(), "content/photoshoots");

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
  const shoot = getPhotoshootBySlug(slug);
  if (!shoot) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json(shoot);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await requireAdmin();
  const { slug } = await params;
  const body = (await request.json()) as Partial<Photoshoot> & { images?: PhotoshootImage[] };
  const filePath = path.join(contentDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  const current = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Photoshoot;
  const updated: Photoshoot = {
    slug: body.slug ?? current.slug,
    title: body.title ?? current.title,
    date: body.date ?? current.date,
    coverImage: body.coverImage ?? current.coverImage,
    caption: body.caption ?? current.caption,
    images: body.images ?? current.images,
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
    if (updated.slug !== slug) {
      indexData.splice(i, 1);
      indexData.push({
        slug: updated.slug,
        title: updated.title,
        date: updated.date,
        coverImage: updated.coverImage,
        caption: updated.caption,
      });
      try {
        fs.renameSync(filePath, path.join(contentDir, `${updated.slug}.json`));
      } catch {
        // keep old file
      }
    }
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
  }
  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await requireAdmin();
  const { slug } = await params;
  const filePath = path.join(contentDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  fs.unlinkSync(filePath);
  const indexPath = path.join(contentDir, "index.json");
  const indexData = JSON.parse(fs.readFileSync(indexPath, "utf-8")) as { slug: string }[];
  const newIndex = indexData.filter((p) => p.slug !== slug);
  fs.writeFileSync(indexPath, JSON.stringify(newIndex, null, 2));
  return Response.json({ ok: true });
}
