import { NextResponse } from "next/server";

/**
 * Lightweight readiness probe for load balancers and uptime checks.
 * Does not verify SMTP or external services.
 */
export async function GET() {
  return NextResponse.json(
    { ok: true, service: "loymark-web" },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
