"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AmericasGlobe, { type Mercado } from "@/components/ui/AmericasGlobe";
import NewsCard, { type NewsCardArticle } from "@/components/newsroom/NewsCard";

/**
 * Feed "Voces de la región": el globo es el control del listado.
 *
 * Estados y gestos, tal como se pidieron:
 *  - clic en un punto           → fija el país (sincroniza marcador y ficha)
 *  - clic en un país ya fijado  → filtra el listado a ese país
 *  - clic fuera de todo punto   → suelta y vuelve a la vista de las Américas
 *
 * Las fichas de país hacen lo mismo que el globo: en móvil el globo se oculta
 * y sin ellas el filtro quedaría fuera de alcance.
 */

export interface VocesArticulo extends NewsCardArticle {
  pais: string | null;
}

interface Props {
  mercados: Mercado[];
  articulos: VocesArticulo[];
  intro: string;
}

export default function VocesFeed({ mercados, articulos, intro }: Props) {
  // Un solo estado, no dos: con `fijado` y `filtrado` separados, dos clics muy
  // seguidos leen el valor viejo del closure y el segundo vuelve a fijar en vez
  // de filtrar. Con actualización funcional sobre un objeto, la transición es
  // correcta sin importar el timing.
  const [sel, setSel] = useState<{ pais: string | null; solo: boolean }>({
    pais: null,
    solo: false,
  });
  const [animar, setAnimar] = useState(false);
  const [i, setI] = useState(0);
  const sombraRef = useRef<HTMLCanvasElement | null>(null);

  const activos = useMemo(() => mercados.filter((m) => m.activo), [mercados]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setAnimar(true);
  }, []);

  // El marcador rota solo mientras no haya país fijado.
  useEffect(() => {
    if (sel.pais || activos.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % activos.length), 3200);
    return () => clearInterval(t);
  }, [sel.pais, activos.length]);

  const elegir = (pais: string | null) => {
    setSel((prev) => {
      if (pais === null) return { pais: null, solo: false };
      // Mismo país: alterna el filtro. Otro país: lo fija y suelta el filtro.
      if (prev.pais === pais) return { pais, solo: !prev.solo };
      return { pais, solo: false };
    });
  };

  const fijado = sel.pais;
  const filtrado = sel.solo ? sel.pais : null;

  const foco = fijado ?? activos[i]?.pais ?? null;
  const mercadoFoco = mercados.find((m) => m.pais === foco) ?? null;
  const autorFoco = articulos.find((a) => a.pais === foco)?.author?.split("×")[0].trim() ?? null;

  const lista = filtrado ? articulos.filter((a) => a.pais === filtrado) : articulos;

  return (
    <>
      {/* El espejo vive FUERA de la caja para que no lo recorte: el fondo opaco
          del hero lo tapa y solo queda visible lo que sobresale. */}
      <div className="relative">
        <canvas
          ref={sombraRef}
          aria-hidden
          className="pointer-events-none absolute -right-[300px] top-1/2 -z-10 hidden -translate-y-1/2 md:block"
          style={{
            // El globo es más grande que su lienzo, así que sin máscara se corta
            // en recto contra los bordes. El degradado radial lo desvanece a la
            // nada antes de llegar al borde — arriba, abajo y a la derecha por
            // igual. `closest-side` hace que el 100% caiga justo en el borde.
            maskImage:
              "radial-gradient(circle closest-side, #000 52%, rgba(0,0,0,0.32) 78%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(circle closest-side, #000 52%, rgba(0,0,0,0.32) 78%, transparent 100%)",
          }}
        />

      <header className="relative z-[1] isolate overflow-hidden rounded-[28px] bg-[#0B1020] px-6 py-12 md:px-12 md:py-16">
        {/* El globo excede la caja y la caja lo recorta. Es clicable. */}
        <div className="pointer-events-none absolute inset-0 z-0 hidden md:block">
          <div className="pointer-events-auto absolute -right-[300px] top-1/2 -translate-y-1/2">
            <AmericasGlobe
              mercados={mercados}
              seleccionado={fijado}
              onSeleccionar={elegir}
              size={1000}
              shadowRef={sombraRef}
            />
          </div>
        </div>

        {/* Velo: el texto tiene que ganarle al globo sin taparlo del todo. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#0B1020] via-[#0B1020]/92 to-transparent md:to-[#0B1020]/0"
        />

        <div className="relative z-[2] max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm [font-family:var(--font-figtree)]">
            <span className="relative flex h-1.5 w-1.5">
              {animar && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              )}
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            {filtrado ? `Leyendo ${filtrado}` : "Voces de la región"}
          </span>

          <h1 className="mt-5 text-4xl font-bold leading-[0.95] text-white md:text-6xl [font-family:var(--font-figtree)]">
            Doce mercados
            <br />
            Once lecturas
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70 md:text-lg">
            {intro}
          </p>

          {foco && (
            <p
              key={`${foco}-${filtrado}`}
              className={`mt-7 text-sm text-white/55 ${animar ? "animate-[fadeUp_.45s_ease-out]" : ""}`}
            >
              {filtrado ? "Mostrando solo " : "Ahora mismo leyendo "}
              <span className="font-semibold text-white">{foco}</span>
              {autorFoco ? (
                <>
                  {" · "}
                  <span className="text-white/80">{autorFoco}</span>
                </>
              ) : mercadoFoco && !mercadoFoco.activo ? (
                <span className="text-white/40"> · sin piezas todavía</span>
              ) : null}
              {fijado && (
                <>
                  {" — "}
                  <button
                    type="button"
                    onClick={() => elegir(fijado === filtrado ? null : fijado)}
                    className="underline underline-offset-4 hover:text-white"
                  >
                    {filtrado ? "ver todas" : "ver solo este país"}
                  </button>
                </>
              )}
            </p>
          )}
        </div>

        {/* Fichas de país: mismo gesto que el globo. */}
        <ul className="relative z-[2] mt-9 flex flex-wrap gap-2">
          {mercados.map((m, n) => {
            const esFijado = fijado === m.pais;
            const esFiltro = filtrado === m.pais;
            return (
              <li key={m.pais}>
                <button
                  type="button"
                  onClick={() => elegir(m.pais)}
                  aria-pressed={esFijado}
                  className={
                    `rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide backdrop-blur-sm ` +
                    `transition-all duration-300 [font-family:var(--font-figtree)] ` +
                    (esFiltro
                      ? "border-[#F540FF] bg-[#F540FF]/25 text-white"
                      : esFijado
                        ? "border-white/60 bg-white/20 text-white"
                        : m.activo
                          ? "border-white/40 bg-white/15 text-white hover:border-white/70"
                          : "border-white/10 bg-white/[0.03] text-white/35 hover:text-white/60")
                  }
                  style={animar ? { animation: `fadeUp .5s ease-out ${n * 40}ms both` } : undefined}
                >
                  {m.pais}
                </button>
              </li>
            );
          })}
        </ul>

        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </header>
      </div>

      <div className="relative z-10 mt-10 flex items-baseline justify-between">
        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-black/50 [font-family:var(--font-figtree)]">
          {lista.length} {lista.length === 1 ? "pieza" : "piezas"}
          {filtrado ? ` · ${filtrado}` : ""}
        </h2>
        {filtrado && (
          <button
            type="button"
            onClick={() => elegir(null)}
            className="text-sm text-black/50 underline-offset-4 hover:text-black hover:underline"
          >
            Quitar filtro
          </button>
        )}
      </div>

      {lista.length === 0 ? (
        <p className="relative z-10 mt-8 rounded-2xl border border-black/10 bg-black/[0.02] p-8 text-black/60">
          {filtrado
            ? `Todavía no hay piezas de ${filtrado}.`
            : "Todavía no hay piezas publicadas en esta colección."}
        </p>
      ) : (
        <div className="relative z-10 mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lista.map((a, n) => (
            <NewsCard key={a.id} article={a} variant="grid" index={n} priority={n < 3} />
          ))}
        </div>
      )}
    </>
  );
}
