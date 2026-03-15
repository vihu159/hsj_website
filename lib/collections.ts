import fs from "fs";
import path from "path";

export type CollectionSummary = {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  status?: "live" | "archived";
};

export type Piece = {
  id: string;
  name: string;
  description: string;
  image: string;
  status?: "live" | "archived";
};

export type Collection = CollectionSummary & {
  pieces: Piece[];
};

/** Default status for backwards compatibility */
const DEFAULT_STATUS = "live" as const;

const contentDir = path.join(process.cwd(), "content/collections");

export function getAllCollections(includeArchived = false): CollectionSummary[] {
  const indexPath = path.join(contentDir, "index.json");
  if (!fs.existsSync(indexPath)) return [];
  try {
    const data = fs.readFileSync(indexPath, "utf-8");
    const list = JSON.parse(data) as CollectionSummary[];
    if (!Array.isArray(list)) return [];
    if (includeArchived) return list;
    return list.filter((c) => (c.status ?? DEFAULT_STATUS) === "live");
  } catch {
    return [];
  }
}

export function getAllCollectionsAdmin(): CollectionSummary[] {
  return getAllCollections(true);
}

export function getCollectionBySlug(slug: string, includeArchived = false): Collection | null {
  const filePath = path.join(contentDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const col = JSON.parse(data) as Collection;
    if (!col || !Array.isArray(col.pieces)) return null;
    if (!includeArchived && (col.status ?? DEFAULT_STATUS) !== "live") return null;
    return col;
  } catch {
    return null;
  }
}

/** For public: only live pieces */
export function getCollectionBySlugPublic(slug: string): Collection | null {
  const col = getCollectionBySlug(slug);
  if (!col) return null;
  const livePieces = col.pieces.filter((p) => (p.status ?? DEFAULT_STATUS) === "live");
  return { ...col, pieces: livePieces };
}

export function getAllCollectionSlugs(): string[] {
  const index = getAllCollections();
  return index.map((c) => c.slug);
}
