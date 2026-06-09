import { NextResponse } from "next/server";
import { insertMessageFeedback } from "@/lib/db/metrics";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, messageContent, rating, reason, comment } = body;

    if (!sessionId || !messageContent || (rating !== 1 && rating !== -1)) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    // Fire and forget insert to not block the response
    insertMessageFeedback({ sessionId, messageContent, rating, reason, comment });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/feedback/message] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
