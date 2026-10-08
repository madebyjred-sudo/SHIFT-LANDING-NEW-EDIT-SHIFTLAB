// /api/agents/[agentId]/memory — memoria estructurada (insights/entities/…)
// Por ahora STUB: los agentes nuevos (p.ej. Luna) todavía no tienen su DB de
// memoria (llega con su cerebro/Chunk A). Devuelve vacío para que el cockpit
// degrade limpio en vez de 404. Shifter sigue usando /api/shifter/memory.

import { NextResponse } from "next/server";
import { getAgent } from "@/lib/avatar-factory/agent-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;
  if (!getAgent(agentId)) {
    return NextResponse.json({ success: false, error: `Agente desconocido: ${agentId}` }, { status: 404 });
  }
  // Sin DB de memoria todavía para agentes nuevos.
  return NextResponse.json({ success: true, data: [] });
}

export async function PUT(
  _req: Request,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;
  if (!getAgent(agentId)) {
    return NextResponse.json({ success: false, error: `Agente desconocido: ${agentId}` }, { status: 404 });
  }
  return NextResponse.json(
    { success: false, error: "La memoria estructurada de este agente aún no está disponible." },
    { status: 200 },
  );
}
