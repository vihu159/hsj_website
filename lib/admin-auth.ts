import { cookies } from "next/headers";
import { getAdminUsers } from "./admin-users";

const COOKIE_NAME = "hsj_admin_session";
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getSessionTokenForUser(username: string, passwordHash: string): string {
  const t = Date.now();
  return Buffer.from(JSON.stringify({ t, username: username.trim(), h: passwordHash })).toString("base64url");
}

/** When REQUIRE_ADMIN_AUTH is not "true", admin is open (no login). Set REQUIRE_ADMIN_AUTH=true to enable username/password login. */
export async function isAdmin(): Promise<boolean> {
  if (process.env.REQUIRE_ADMIN_AUTH !== "true") return true;
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return false;
  try {
    const payload = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf-8")
    ) as { t: number; username: string; h: string };
    if (payload.t < Date.now() - SESSION_MAX_AGE_MS) return false;
    const users = getAdminUsers();
    const user = users.find((u) => u.username.toLowerCase() === (payload.username || "").toLowerCase());
    return !!user && user.passwordHash === payload.h;
  } catch {
    return false;
  }
}

/** Set the admin session cookie after successful login. Call with the user's username and passwordHash from admin-users. */
export async function setAdminCookie(username: string, passwordHash: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, getSessionTokenForUser(username, passwordHash), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60,
    path: "/",
  });
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
