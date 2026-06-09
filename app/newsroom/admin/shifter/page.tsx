import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shifter | Aprobación de Columna",
  description: "Bandeja de revisión editorial para el avatar Shifter",
};

// In a real app we'd use directus sdk or fetch from API
async function getDraft() {
  try {
    // Attempt to fetch from local Directus instance if available
    const res = await fetch("http://localhost:8055/items/shifter_columns?filter[status][_eq]=draft&limit=1", {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data[0] || null;
  } catch (e) {
    return null;
  }
}

export default async function ShifterApprovalPage() {
  const draft = await getDraft();
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
              Revisión editorial semi-autónoma. Subraya texto para pedir cambios o aprueba para publicar.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="px-4 py-2 rounded border border-white/20 text-white/70 hover:text-white hover:bg-white/5 transition disabled:opacity-50" disabled={!isDraftPending}>
              Descartar Borrador
            </button>
            <button className="px-6 py-2 rounded bg-[#F540FF] text-white font-semibold hover:bg-[#F540FF]/80 transition shadow-[0_0_15px_rgba(245,64,255,0.3)] disabled:opacity-50" disabled={!isDraftPending}>
              Aprobar y Publicar
            </button>
          </div>
        </header>

        {isDraftPending ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#111A31] rounded-xl border border-white/5 p-8 shadow-xl">
              <div className="mb-8">
                <span className="inline-block px-3 py-1 rounded-full bg-[#F540FF]/20 text-[#F540FF] text-xs font-bold uppercase tracking-wider mb-4">
                  Borrador Pendiente
                </span>
                <h2 className="text-3xl font-bold mb-4 [font-family:var(--font-figtree)]">
                  {draft.title || "La Muerte Silenciosa del SEO B2B"}
                </h2>
                
                <div className="bg-black/50 p-6 rounded-lg font-mono text-[8px] leading-[8px] text-gray-400 mb-8 whitespace-pre overflow-hidden flex justify-center opacity-70">
{`   _____      _      
  |  __ \\    | |     
  | |  | |___| |__   
  | |  | / __| '_ \\  
  | |__| \\__ \\ |_) | 
  |_____/|___/_.__/  `}
                </div>
              </div>

              <article className="prose prose-invert max-w-none prose-p:text-lg prose-p:leading-relaxed prose-p:text-white/80" dangerouslySetInnerHTML={{ __html: draft.content || "Contenido no disponible." }} />
            </div>

            <div className="bg-[#111A31] rounded-xl border border-white/5 flex flex-col h-[600px] lg:h-auto shadow-xl">
              <div className="p-4 border-b border-white/10 bg-black/20 rounded-t-xl">
                <h3 className="font-bold [font-family:var(--font-figtree)]">Mini-Chat de Edición</h3>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-4 flex items-center justify-center text-white/30">
                Historial de edición no disponible para este borrador.
              </div>

              <div className="p-4 border-t border-white/10">
                <textarea 
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#F540FF] transition-colors resize-none"
                  rows={3}
                  placeholder="Instruye a Shifter para modificar el texto..."
                />
                <button className="w-full mt-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded transition">
                  Enviar instrucción
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-[#111A31] rounded-xl border border-white/5">
            <h2 className="text-2xl font-bold mb-2 [font-family:var(--font-figtree)]">Todo al día</h2>
            <p className="text-white/50">Shifter no tiene borradores pendientes de revisión en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
