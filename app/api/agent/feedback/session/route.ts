import { NextResponse } from "next/server";
import { upsertSessionMetrics } from "@/lib/db/metrics";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, csatScore, userComment, totalTurns, durationSeconds } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Fire and forget insert to not block the response
    upsertSessionMetrics({ sessionId, csatScore, userComment, totalTurns, durationSeconds });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/feedback/session] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
