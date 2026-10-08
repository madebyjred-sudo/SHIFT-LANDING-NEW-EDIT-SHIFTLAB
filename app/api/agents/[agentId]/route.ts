// ----------------------------------------------------------------------
// /api/agents/[agentId] — chat genérico multi-agente (cockpit Comms)
// ----------------------------------------------------------------------
// Valida agentId contra el registry (404 si desconocido) y delega al
// agent-core. /api/shifter sigue vivo aparte (byte-idéntico) para el cron.

import { NextResponse } from "next/server";
import { getAgent } from "@/lib/avatar-factory/agent-registry";
import { chatWithAgent } from "@/lib/agent-core/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;
  const agent = getAgent(agentId);
  if (!agent) {
    return NextResponse.json(
      { success: false, error: `Agente desconocido: ${agentId}` },
      { status: 404 },
    );
  }

  let body: { message?: string; modelId?: string; traceLabel?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "JSON inválido" }, { status: 400 });
  }

  const { result, status } = await chatWithAgent(agent, body);
  return NextResponse.json(result, { status });
}
