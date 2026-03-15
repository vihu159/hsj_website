import fs from "fs";
import path from "path";

export type PendingItem = {
  id: string;
  collectionSlug: string;
  name: string;
  description: string;
  image: string;
  source: "excel" | "bulk";
  createdAt: string;
};

const pendingPath = path.join(process.cwd(), "content/pending.json");

function readPending(): PendingItem[] {
  if (!fs.existsSync(pendingPath)) return [];
  const data = fs.readFileSync(pendingPath, "utf-8");
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

function writePending(items: PendingItem[]) {
  fs.mkdirSync(path.dirname(pendingPath), { recursive: true });
  fs.writeFileSync(pendingPath, JSON.stringify({ items }, null, 2));
}

export function getAllPending(): PendingItem[] {
  return readPending();
}

export function addPendingItems(items: Omit<PendingItem, "id" | "createdAt">[]): PendingItem[] {
  const existing = readPending();
  const created = items.map((item, i) => ({
    ...item,
    id: `pending-${Date.now()}-${i}`,
    createdAt: new Date().toISOString(),
  }));
  const updated = [...existing, ...created];
  writePending(updated);
  return created;
}

export function removePending(id: string): boolean {
  const items = readPending().filter((p) => p.id !== id);
  if (items.length === readPending().length) return false;
  writePending(items);
  return true;
}

export function getPendingById(id: string): PendingItem | null {
  return readPending().find((p) => p.id === id) ?? null;
}
