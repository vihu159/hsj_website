export async function GET() {
  return Response.json({
    requireAuth: process.env.REQUIRE_ADMIN_AUTH === "true",
  });
}
