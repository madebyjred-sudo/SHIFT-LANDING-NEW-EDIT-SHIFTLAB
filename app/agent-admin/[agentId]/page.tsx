// ----------------------------------------------------------------------
// /agent-admin/[agentId] — cockpit multi-ICM (Shifter, Luna, …)
// ----------------------------------------------------------------------
// Server component: resuelve el descriptor del agente, carga su estado
// REAL (ICM file-based, memoria, container) aislado por avatarDir, y lo
// pasa al ShifterShell (reusado). Shifter usa /api/shifter (intacto);
// los demás usan /api/agents/<id>.

import path from "node:path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ShifterShell, { type AgentInfo } from "@/components/shifter/ShifterShell";
import { loadAgentICM } from "@/lib/shifter-icm";
import { getAgentStatus } from "@/lib/shifter-status";
import { getAgentSystemStatus } from "@/lib/shifter-system";
import { getAgent, listAgents } from "@/lib/avatar-factory/agent-registry";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ agentId: string }>;
}): Promise<Metadata> {
  const { agentId } = await params;
  const a = getAgent(agentId);
  return {
    title: a ? `${a.displayName} · Agent Admin` : "Agent Admin",
    description: a ? `Cockpit del agente ${a.displayName}` : "Cockpit de agentes",
  };
}

export default async function AgentAdminPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  const agent = getAgent(agentId);
  if (!agent) notFound();

  const [memory, status] = await Promise.all([
    loadAgentICM(agent.avatarDir),
    getAgentStatus(path.join(agent.avatarDir, "memory")),
  ]);
  const system = getAgentSystemStatus(agent.containerName);

  const agents: AgentInfo[] = listAgents().map((a) => ({
    id: a.id,
    displayName: a.displayName,
    status: a.status,
  }));
  const apiBase = agent.id === "shifter" ? "/api/shifter" : `/api/agents/${agent.id}`;

  return (
    <ShifterShell
      memory={memory}
      system={system}
      status={status}
      agentId={agent.id}
      agentName={agent.displayName}
      apiBase={apiBase}
      agents={agents}
      colorCore={agent.colorTokens.core}
    />
  );
}
