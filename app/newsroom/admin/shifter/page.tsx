import { Metadata } from "next";
import { getDirectusToken } from "@/lib/directus-auth";

export const metadata: Metadata = {
  title: "Shifter | Aprobación de Columna",
  description: "Bandeja de revisión editorial para el avatar Shifter",
};

export const dynamic = "force-dynamic";

const DIRECTUS_URL =
  process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://2.25.128.2:8055";

type ShifterColumn = {
  id: string;
  title: string;
  status: string;
  tension: string | null;
  thesis: string | null;
  lede: string | null;
  body: string | null;
  agent_updated_at: string | null;
};

// Trae candidatos pendientes de revisión (ready primero, luego draft).
async function getPending(): Promise<ShifterColumn[]> {
  try {
    const token = await getDirectusToken();
    const fields =
      "id,title,status,tension,thesis,lede,body,agent_updated_at";
    const filter =
      "filter[status][_in]=ready,draft,in_review";
    const res = await fetch(
      `${DIRECTUS_URL}/items/shifter_columns?${filter}&sort=-agent_updated_at&fields=${fields}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: ShifterColumn[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function ShifterApprovalPage() {
  const pending = await getPending();
  const draft = pending[0] ?? null;
  const isDraftPending = !!draft;

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white p-8 [font-family:var(--font-fira-sans)]">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold text-white [font-family:var(--font-figtree)] flex items-center gap-3">
              <span className="text-[#F540FF]">●</span> Shifter: Bandeja de Revisión
            </h1>
            <p className="text-white/50 mt-1">
              {pending.length} candidato{pending.length === 1 ? "" : "s"} en cola ·
              revisión editorial semi-autónoma.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              className="px-4 py-2 rounded border border-white/20 text-white/70 hover:text-white hover:bg-white/5 transition disabled:opacity-50"
              disabled={!isDraftPending}
            >
              Descartar Borrador
            </button>
            <button
              className="px-6 py-2 rounded bg-[#F540FF] text-white font-semibold hover:bg-[#F540FF]/80 transition shadow-[0_0_15px_rgba(245,64,255,0.3)] disabled:opacity-50"
              disabled={!isDraftPending}
            >
              Aprobar y Publicar
            </button>
          </div>
        </header>

        {isDraftPending ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#111A31] rounded-xl border border-white/5 p-8 shadow-xl">
              <div className="mb-8">
                <span className="inline-block px-3 py-1 rounded-full bg-[#F540FF]/20 text-[#F540FF] text-xs font-bold uppercase tracking-wider mb-4">
                  {draft.status === "ready" ? "Listo p/ revisión" : draft.status}
                </span>
                <h2 className="text-3xl font-bold mb-2 [font-family:var(--font-figtree)]">
                  {draft.title}
                </h2>
                {draft.agent_updated_at && (
                  <p className="text-white/30 text-xs font-mono mb-6">
                    Generado por Shifter · {new Date(draft.agent_updated_at).toLocaleString("es")}
                  </p>
                )}
              </div>

              {/* Si ya hay body completo, renderizarlo; si es candidato, mostrar tensión/tesis/lede */}
              {draft.body ? (
                <article
                  className="prose prose-invert max-w-none prose-p:text-lg prose-p:leading-relaxed prose-p:text-white/80"
                  dangerouslySetInnerHTML={{ __html: draft.body }}
                />
              ) : (
                <div className="space-y-6">
                  {draft.tension && (
                    <Field label="Tensión" accent="#5BAEFF" text={draft.tension} />
                  )}
                  {draft.thesis && (
                    <Field label="Tesis" accent="#F540FF" text={draft.thesis} />
                  )}
                  {draft.lede && (
                    <Field label="Lede propuesto" accent="#5BE9FF" text={draft.lede} />
                  )}
                  <p className="text-white/30 text-sm font-mono pt-4 border-t border-white/5">
                    Candidato editorial — el cuerpo completo se redacta en el stage 02_write
                    tras aprobación del ángulo.
                  </p>
                </div>
              )}
            </div>

            {/* Cola de candidatos */}
            <div className="bg-[#111A31] rounded-xl border border-white/5 flex flex-col shadow-xl">
              <div className="p-4 border-b border-white/10 bg-black/20 rounded-t-xl">
                <h3 className="font-bold [font-family:var(--font-figtree)]">
                  Cola ({pending.length})
                </h3>
              </div>
              <div className="flex-1 p-3 overflow-y-auto space-y-2 max-h-[600px]">
                {pending.map((c, i) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-lg border transition ${
                      i === 0
                        ? "border-[#F540FF]/40 bg-[#F540FF]/[0.06]"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          c.status === "ready" ? "bg-green-400" : "bg-amber-400"
                        }`}
                      />
                      <span className="font-mono text-[10px] uppercase text-white/40">
                        {c.status}
                      </span>
                    </div>
                    <p className="text-sm text-white/80 leading-snug">{c.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-[#111A31] rounded-xl border border-white/5">
            <h2 className="text-2xl font-bold mb-2 [font-family:var(--font-figtree)]">
              Todo al día
            </h2>
            <p className="text-white/50">
              Shifter no tiene candidatos pendientes de revisión en este momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, accent, text }: { label: string; accent: string; text: string }) {
  return (
    <div>
      <span
        className="block font-mono text-[11px] uppercase tracking-widest mb-1.5"
        style={{ color: accent }}
      >
        {label}
      </span>
      <p className="text-lg leading-relaxed text-white/85">{text}</p>
    </div>
  );
}
