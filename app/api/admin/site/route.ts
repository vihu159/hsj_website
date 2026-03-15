import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getSiteData } from "@/lib/site";
import fs from "fs";
import path from "path";

const contentPath = path.join(process.cwd(), "content/site.json");

async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
}

export async function GET() {
  await requireAdmin();
  const data = getSiteData();
  return Response.json(data);
}

export async function PUT(request: NextRequest) {
  await requireAdmin();
  const body = await request.json();
  fs.writeFileSync(contentPath, JSON.stringify(body, null, 2));
  return Response.json(body);
}
