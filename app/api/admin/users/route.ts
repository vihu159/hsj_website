import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import {
  getAdminUsers,
  addAdminUser,
  removeAdminUser,
  hasAnyAdminUser,
} from "@/lib/admin-users";

export async function GET() {
  const ok = await isAdmin();
  if (!ok) {
    const anyUser = hasAnyAdminUser();
    if (!anyUser) {
      return Response.json({ users: [], bootstrap: true });
    }
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const users = getAdminUsers();
  return Response.json({
    users: users.map((u) => ({ username: u.username })),
  });
}

export async function POST(request: NextRequest) {
  const anyUser = hasAnyAdminUser();
  if (anyUser) {
    const ok = await isAdmin();
    if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const username = (body.username as string)?.trim();
  const password = body.password as string | undefined;

  const err = addAdminUser(username ?? "", password ?? "");
  if (err) {
    return Response.json({ error: err }, { status: 400 });
  }
  return Response.json({ ok: true, username: username });
}

export async function DELETE(request: NextRequest) {
  const ok = await isAdmin();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();
  if (!username) {
    return Response.json({ error: "Username is required" }, { status: 400 });
  }

  removeAdminUser(username);
  return Response.json({ ok: true });
}
