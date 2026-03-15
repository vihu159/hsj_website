import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";

async function requireAdmin() {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  let url: string | undefined;
  try {
    const body = await request.json();
    url = typeof body?.url === "string" ? body.url : undefined;
  } catch {
    // fall through
  }

  if (!url || !url.startsWith("/images/bulk/")) {
    return Response.json({ error: "Invalid URL" }, { status: 400 });
  }

  const safePath = path.normalize(url).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(process.cwd(), "public", safePath);

  if (!filePath.startsWith(path.join(process.cwd(), "public", "images", "bulk"))) {
    return Response.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Failed to delete file" }, { status: 500 });
  }
}

