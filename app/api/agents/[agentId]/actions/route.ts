// /api/agents/[agentId]/actions — acciones del toolkit (scan/think/deep-dive/…)
// STUB por ahora: dependen de los scripts del agente (shifter-intelligent-*.sh),
// que para agentes nuevos llegan con su cerebro (Chunk A). Shifter sigue usando
// /api/shifter/actions. Devuelve un error legible en vez de 404.

import { NextResponse } from "next/server";
import { getAgent } from "@/lib/avatar-factory/agent-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;
  const agent = getAgent(agentId);
  if (!agent) {
    return NextResponse.json({ success: false, error: `Agente desconocido: ${agentId}` }, { status: 404 });
  }
  return NextResponse.json(
    { success: false, error: `${agent.displayName} todavía no tiene acciones autónomas (llegan con su cerebro).` },
    { status: 200 },
  );
}
