import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vector | Aprobación de Columna",
  description: "Bandeja de revisión editorial para el avatar Vector",
};

export default function VectorApprovalPage() {
  // En una implementación real, esto fetchería el borrador desde Directus o desde
  // la carpeta del run actual (ej: /lib/avatar-factory/avatars/vector/runs/.../draft.md)
  const isDraftPending = true;
  
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white p-8 [font-family:var(--font-fira-sans)]">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold text-white [font-family:var(--font-figtree)] flex items-center gap-3">
              <span className="text-[#1534DC]">●</span> Vector: Bandeja de Revisión
            </h1>
            <p className="text-white/50 mt-1">
              Revisión editorial semi-autónoma. Subraya texto para pedir cambios o aprueba para publicar.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="px-4 py-2 rounded border border-white/20 text-white/70 hover:text-white hover:bg-white/5 transition">
              Descartar Borrador
            </button>
            <button className="px-6 py-2 rounded bg-[#1534DC] text-white font-semibold hover:bg-[#1534DC]/80 transition shadow-[0_0_15px_rgba(21,52,220,0.3)]">
              Aprobar y Publicar
            </button>
          </div>
        </header>

        {isDraftPending ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna Izquierda: El Borrador */}
            <div className="lg:col-span-2 bg-[#111A31] rounded-xl border border-white/5 p-8 shadow-xl">
              <div className="mb-8">
                <span className="inline-block px-3 py-1 rounded-full bg-[#1534DC]/20 text-[#7B9CFF] text-xs font-bold uppercase tracking-wider mb-4">
                  Borrador Pendiente
                </span>
                <h2 className="text-3xl font-bold mb-4 [font-family:var(--font-figtree)]">
                  La Muerte Silenciosa del SEO B2B
                </h2>
                
                {/* ASCII Art Placeholder */}
                <div className="bg-black/50 p-6 rounded-lg font-mono text-[8px] leading-[8px] text-gray-400 mb-8 whitespace-pre overflow-hidden flex justify-center opacity-70">
{`   _____      _      
  |  __ \\    | |     
  | |  | |___| |__   
  | |  | / __| '_ \\  
  | |__| \\__ \\ |_) | 
  |_____/|___/_.__/  `}
                </div>
              </div>

              <article className="prose prose-invert max-w-none prose-p:text-lg prose-p:leading-relaxed prose-p:text-white/80">
                <p>
                  Todos están mirando el gráfico equivocado. Mientras las agencias celebran un aumento
                  del 5% en tráfico referencial desde LinkedIn, Google está canibalizando el top of funnel
                  con AI Overviews. No es una predicción, es un hecho contable.
                </p>
                <p>
                  Si revisamos los datos de adopción en Latam, las consultas informacionales "Zero-Click" 
                  pasaron del 57% al 68% en los últimos seis meses. 
                </p>
                <p className="bg-yellow-500/20 text-yellow-100 p-2 rounded -mx-2 border border-yellow-500/30 cursor-pointer">
                  [TEXTO SUBRAYADO POR EL EDITOR]
                  <br/><br/>
                  La estrategia corporativa actual de seguir escribiendo blogs de 2000 palabras es
                  básicamente quemar dinero frente a un servidor.
                </p>
              </article>
            </div>

            {/* Columna Derecha: Chat de Edición */}
            <div className="bg-[#111A31] rounded-xl border border-white/5 flex flex-col h-[600px] lg:h-auto shadow-xl">
              <div className="p-4 border-b border-white/10 bg-black/20 rounded-t-xl">
                <h3 className="font-bold [font-family:var(--font-figtree)]">Mini-Chat de Edición</h3>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="bg-white/5 p-3 rounded-lg text-sm text-white/80">
                  <span className="block text-xs text-[#F540FF] font-bold mb-1">Editor (Tú)</span>
                  Vector, en el párrafo subrayado sobre quemar dinero, sé más sutil pero igual de crudo. Usa la estética Mad Men.
                </div>
                
                <div className="bg-[#1534DC]/10 border border-[#1534DC]/30 p-3 rounded-lg text-sm text-white/90">
                  <span className="block text-xs text-[#7B9CFF] font-bold mb-1">Vector</span>
                  Entendido. He reescrito el párrafo: "Las corporaciones siguen invirtiendo fortunas en redactar blogs maratonianos que nadie leerá. Es el equivalente digital a comprar vallas publicitarias en una carretera clausurada."
                </div>
              </div>

              <div className="p-4 border-t border-white/10">
                <textarea 
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#1534DC] transition-colors resize-none"
                  rows={3}
                  placeholder="Instruye a Vector para modificar el texto..."
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
            <p className="text-white/50">Vector no tiene borradores pendientes de revisión en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
