import { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getRates, updateRates, type Rates } from "@/lib/rates";

async function requireAdmin() {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/** GET: current rates (admin) */
export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;
  const rates = getRates();
  return Response.json(rates);
}

/** PATCH: update rates (admin) */
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;
  const body = (await request.json()) as Partial<Rates>;
  const updated = updateRates(body);
  return Response.json(updated);
}
