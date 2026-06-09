import { getPool } from "./client";

export async function insertMessageFeedback(input: {
  sessionId: string;
  messageContent: string;
  rating: 1 | -1;
  reason?: string;
  comment?: string;
}): Promise<void> {
  const q = `
    INSERT INTO message_feedback (session_id, message_content, rating, reason, comment)
    VALUES ($1, $2, $3, $4, $5)
  `;
  const v = [
    input.sessionId,
    input.messageContent,
    input.rating,
    input.reason || null,
    input.comment || null,
  ];

  try {
    await getPool().query(q, v);
  } catch (err) {
    console.error("[db/metrics] insertMessageFeedback error:", err);
  }
}

export async function upsertSessionMetrics(input: {
  sessionId: string;
  csatScore?: number;
  userComment?: string;
  totalTurns?: number;
  durationSeconds?: number;
}): Promise<void> {
  const q = `
    INSERT INTO session_metrics (session_id, csat_score, user_comment, total_turns, duration_seconds)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (session_id) DO UPDATE SET
      csat_score = COALESCE(EXCLUDED.csat_score, session_metrics.csat_score),
      user_comment = COALESCE(EXCLUDED.user_comment, session_metrics.user_comment),
      total_turns = COALESCE(EXCLUDED.total_turns, session_metrics.total_turns),
      duration_seconds = COALESCE(EXCLUDED.duration_seconds, session_metrics.duration_seconds),
      closed_at = NOW()
  `;
  const v = [
    input.sessionId,
    input.csatScore || null,
    input.userComment || null,
    input.totalTurns || null,
    input.durationSeconds || null,
  ];

  try {
    await getPool().query(q, v);
  } catch (err) {
    console.error("[db/metrics] upsertSessionMetrics error:", err);
  }
}
