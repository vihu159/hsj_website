import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getBanners, setBanners } from "@/lib/banners";

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json(getBanners());
}

export async function PUT(request: NextRequest) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  setBanners(body);
  return Response.json(body);
}
