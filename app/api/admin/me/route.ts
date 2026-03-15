import { isAdmin } from "@/lib/admin-auth";

export async function GET() {
  const ok = await isAdmin();
  return Response.json({ ok });
}
