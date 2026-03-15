import { NextRequest } from "next/server";
import { setAdminCookie } from "@/lib/admin-auth";
import { getAdminUsers, verifyAdminUser } from "@/lib/admin-users";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const username = (body.username as string)?.trim();
  const password = body.password as string | undefined;

  if (!username || !password) {
    return Response.json({ error: "Username and password are required" }, { status: 400 });
  }

  if (!verifyAdminUser(username, password)) {
    return Response.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const users = getAdminUsers();
  const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    return Response.json({ error: "Invalid username or password" }, { status: 401 });
  }

  await setAdminCookie(user.username, user.passwordHash);
  return Response.json({ ok: true, username: user.username });
}
