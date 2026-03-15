import { NextResponse } from "next/server";
import { buildSearchIndex } from "@/lib/search-index";

/** GET /api/search-index — returns client-side search index (public, no auth) */
export async function GET() {
  const index = buildSearchIndex();
  return NextResponse.json(index);
}
