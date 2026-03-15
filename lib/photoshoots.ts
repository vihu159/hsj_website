import fs from "fs";
import path from "path";

export type PhotoshootSummary = {
  slug: string;
  title: string;
  date?: string;
  coverImage: string;
  caption?: string;
  status?: "live" | "archived";
};

export type PhotoshootImage = {
  src: string;
  alt: string;
};

export type Photoshoot = PhotoshootSummary & {
  images: PhotoshootImage[];
};

const contentDir = path.join(process.cwd(), "content/photoshoots");

export function getAllPhotoshoots(): PhotoshootSummary[] {
  const indexPath = path.join(contentDir, "index.json");
  if (!fs.existsSync(indexPath)) return [];
  try {
    const data = fs.readFileSync(indexPath, "utf-8");
    const list = JSON.parse(data) as PhotoshootSummary[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function getPhotoshootBySlug(slug: string): Photoshoot | null {
  const filePath = path.join(contentDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data) as Photoshoot;
  } catch {
    return null;
  }
}

export function getAllPhotoshootSlugs(): string[] {
  const index = getAllPhotoshoots();
  return index.map((p) => p.slug);
}
