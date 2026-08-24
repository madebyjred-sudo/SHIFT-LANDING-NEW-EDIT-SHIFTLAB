// /agent-admin — grilla de agentes (ICM) de Shift LAB.
import Link from "next/link";
import type { Metadata } from "next";
import { listAgents } from "@/lib/avatar-factory/agent-registry";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Agent Admin · Shift Latam",
  description: "Administración de los ICM de las mentes de Shift LAB",
};

export default function AgentAdminIndex() {
  const agents = listAgents();
  return (
    <main className="min-h-dvh bg-[#0A0E27] pt-24 text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="[font-family:var(--font-fira-mono)] text-[11px] uppercase tracking-[0.2em] text-[#8B92B5]">
          // agent-admin
        </p>
        <h1 className="mt-2 [font-family:var(--font-figtree)] text-4xl font-extrabold tracking-tight">
          Agentes
        </h1>
        <p className="mt-2 [font-family:var(--font-figtree)] text-white/50">
          Administrá los ICM de cada mente de Shift LAB. Cada una con su cerebro, memoria e identidad aislados.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {agents.map((a) => (
            <Link
              key={a.id}
              href={`/agent-admin/${a.id}`}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/25"
            >
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ background: a.colorTokens.core }} />
                <span className="[font-family:var(--font-figtree)] text-xl font-bold">{a.displayName}</span>
                {a.status === "awakening" && (
                  <span className="rounded bg-[#7C5CFF]/15 px-2 py-0.5 [font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.08em] text-[#B9A6FF]">
                    despertando
                  </span>
                )}
              </div>
              <p className="mt-2 [font-family:var(--font-figtree)] text-[13px] text-white/50">
                {a.persona.intro || "—"}
              </p>
              <p className="mt-3 [font-family:var(--font-fira-mono)] text-[11px] text-white/30 transition-colors group-hover:text-white/60">
                Abrir cockpit →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
