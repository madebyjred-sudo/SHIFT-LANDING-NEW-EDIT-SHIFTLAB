// ----------------------------------------------------------------------
// /api/agents/[agentId]/history — historial de chat por usuario+agente
// ----------------------------------------------------------------------
// GET            → lista de sesiones del usuario con este agente
// GET ?session=  → mensajes de esa sesión
// GET ?q=        → búsqueda full-text en los chats del usuario+agente
// POST {sessionId, userMessage, agentMessage, model} → guarda un turno
//
// Aislamiento: verifica el JWT (Bearer) → user.id, y TODA query filtra
// por ese user_id + agentId. 401 si no hay usuario.

import { NextResponse } from "next/server";
import { getAgent } from "@/lib/avatar-factory/agent-registry";
import { getUserIdFromRequest } from "@/lib/agent-auth";
import {
  saveTurn,
  listSessions,
  getSessionMessages,
  searchMessages,
} from "@/lib/db/agent-chats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;
  if (!getAgent(agentId)) {
    return NextResponse.json({ success: false, error: `Agente desconocido: ${agentId}` }, { status: 404 });
  }
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const session = url.searchParams.get("session");
  try {
    if (q !== null) {
      return NextResponse.json({ success: true, results: await searchMessages(userId, agentId, q) });
    }
    if (session) {
      return NextResponse.json({ success: true, messages: await getSessionMessages(userId, agentId, session) });
    }
    return NextResponse.json({ success: true, sessions: await listSessions(userId, agentId) });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "db error" },
      { status: 200 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;
  if (!getAgent(agentId)) {
    return NextResponse.json({ success: false, error: `Agente desconocido: ${agentId}` }, { status: 404 });
  }
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  let body: { sessionId?: string; userMessage?: string; agentMessage?: string; model?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "JSON inválido" }, { status: 400 });
  }
  const { sessionId, userMessage, agentMessage, model } = body;
  if (!sessionId || !userMessage || !agentMessage) {
    return NextResponse.json({ success: false, error: "Faltan campos (sessionId, userMessage, agentMessage)" }, { status: 400 });
  }
  try {
    await saveTurn({ userId, agentId, sessionId, userMessage, agentMessage, model });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "db error" },
      { status: 200 },
    );
  }
}
