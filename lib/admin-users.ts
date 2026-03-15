import fs from "fs";
import path from "path";
import { createHash } from "crypto";

const USERS_PATH = path.join(process.cwd(), "content/admin-users.json");

export type AdminUser = {
  username: string;
  passwordHash: string;
};

type AdminUsersFile = {
  users: AdminUser[];
};

function hashPassword(password: string): string {
  return createHash("sha256").update(password.trim()).digest("hex");
}

function readUsers(): AdminUser[] {
  if (!fs.existsSync(USERS_PATH)) return [];
  try {
    const data = fs.readFileSync(USERS_PATH, "utf-8");
    const parsed = JSON.parse(data) as AdminUsersFile;
    return Array.isArray(parsed.users) ? parsed.users : [];
  } catch {
    return [];
  }
}

function writeUsers(users: AdminUser[]): void {
  fs.mkdirSync(path.dirname(USERS_PATH), { recursive: true });
  fs.writeFileSync(USERS_PATH, JSON.stringify({ users }, null, 2));
}

/** Get all admin users (usernames and hash only; passwords are not stored in plain text). */
export function getAdminUsers(): AdminUser[] {
  return readUsers();
}

/** Verify a username and password. Returns true if valid. */
export function verifyAdminUser(username: string, password: string): boolean {
  const users = readUsers();
  const u = username?.trim().toLowerCase();
  const user = users.find((x) => x.username.toLowerCase() === u);
  if (!user) return false;
  return user.passwordHash === hashPassword(password);
}

/** Add a new admin user. Returns error message or null on success. */
export function addAdminUser(username: string, password: string): string | null {
  const trimmed = username?.trim();
  if (!trimmed) return "Username is required.";
  if (!password?.trim()) return "Password is required.";
  const users = readUsers();
  if (users.some((x) => x.username.toLowerCase() === trimmed.toLowerCase())) {
    return "That username already exists.";
  }
  users.push({ username: trimmed, passwordHash: hashPassword(password) });
  writeUsers(users);
  return null;
}

/** Remove an admin user by username. */
export function removeAdminUser(username: string): void {
  const u = username?.trim().toLowerCase();
  const users = readUsers().filter((x) => x.username.toLowerCase() !== u);
  writeUsers(users);
}

/** Check if there are any users (for bootstrap: allow first user creation without auth). */
export function hasAnyAdminUser(): boolean {
  return readUsers().length > 0;
}
