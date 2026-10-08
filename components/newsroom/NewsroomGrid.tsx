"use client";

import { useState, useEffect, useRef } from "react";
import NewsCard, { type NewsCardArticle } from "./NewsCard";
import CategoryFilter from "./CategoryFilter";
import FeedSpotlightCard from "./FeedSpotlightCard";
import CollectionsRail, { type ColeccionResumen } from "./CollectionsRail";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface NewsroomGridProps {
  articles: NewsCardArticle[];
  categories: Category[];
  /** Colección destacada. Se omite y la franja cae a solo el artículo. */
  voces?: { total: number; activos: string[] } | null;
  /** Colecciones con su conteo, para el riel de cabecera. */
  colecciones?: ColeccionResumen[];
}

const POR_PAGINA = 9;


export default function NewsroomGrid({ articles, categories, voces = null, colecciones = [] }: NewsroomGridProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Filter articles
  const filtered = activeFilter
    ? articles.filter((a) => a.category_slug === activeFilter)
    : articles;

  // Compute category counts
  const categoryCounts = categories.map((cat) => ({
    ...cat,
    count: articles.filter((a) => a.category_slug === cat.slug).length,
  }));

  // Estructura editorial: una franja destacada arriba (la pieza del momento y
  // la puerta a la colección), y debajo una grilla regular paginada. El bento
  // de tamaños alternados se retiró: con portadas irregulares —hoy varias
  // piezas no tienen— la asimetría acentuaba los huecos en vez de disimularlos.
  const hero = filtered[0] || null;
  const resto = filtered.slice(1);
  const totalPaginas = Math.max(1, Math.ceil(resto.length / POR_PAGINA));
  const pageActual = Math.min(pagina, totalPaginas);
  const enPagina = resto.slice((pageActual - 1) * POR_PAGINA, pageActual * POR_PAGINA);

  // Handle filter change with transition
  const handleFilterChange = (slug: string | null) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveFilter(slug);
      setPagina(1);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  // Intersection Observer for scroll-reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("newsroom-card-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    const cards = gridRef.current?.querySelectorAll(".newsroom-card-reveal");
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [filtered, pageActual, isTransitioning]);

  return (
    <>
      {/* ── Filter Bar ── */}
      <div className="sticky top-[60px] z-30 bg-white/90 backdrop-blur-lg border-b border-[#111A31]/5 -mx-6 px-6 py-4 md:static md:bg-transparent md:backdrop-blur-none md:border-none md:mx-0 md:px-0 md:py-0 mb-12 md:mb-16">
        <CategoryFilter
          categories={categoryCounts}
          totalCount={articles.length}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* ── Bento Content ── */}
      <div
        ref={gridRef}
        className={`transition-opacity duration-200 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
      >
        {filtered.length === 0 ? (
          <div className="text-center py-24 border border-[#111A31]/10 rounded-3xl bg-[#111A31]/[0.02] backdrop-blur-sm">
            <p className="text-[#111A31]/60 text-lg [font-family:var(--font-figtree)] mb-2">
              No hay artículos en esta categoría
            </p>
            <p className="text-[#111A31]/40 text-sm [font-family:var(--font-fira-sans)]">
              Prueba con otra categoría o vuelve a "Todos"
            </p>
          </div>
        ) : (
          <>
            {/* Franja destacada: la pieza del momento y la colección. */}
            <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-12 md:mb-12">
              {hero && (
                <div className="newsroom-card-reveal lg:col-span-7">
                  <NewsCard article={hero} variant="hero" priority index={0} className="h-full" />
                </div>
              )}
              {voces && (
                <div className="newsroom-card-reveal lg:col-span-5">
                  <FeedSpotlightCard
                    total={voces.total}
                    activos={voces.activos}
                    className="h-full min-h-[340px]"
                  />
                </div>
              )}
            </div>

            {/* Tira de colecciones: va DEBAJO de la franja destacada y como línea
                fina. Arriba y en tarjetas hacía efecto de doble bandeja contra el
                panel oscuro de la colección, y le competía la atención. */}
            {pageActual === 1 && !activeFilter && <CollectionsRail items={colecciones} />}

            {/* Encabezado partido: título a la izquierda, contexto a la derecha. */}
            <div className="mb-12 grid grid-cols-1 items-end gap-8 lg:grid-cols-12 md:mb-16">
              <div className="lg:col-span-7">
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#111A31]/40 [font-family:var(--font-figtree)]">
                  Nuestro Newsroom
                </p>
                <h2 className="text-[36px] leading-[1.05] text-[#111A31] md:text-[56px] [font-family:var(--font-glitz-local)]">
                  Todo lo que estamos
                  <br />
                  <span className="text-[#1534DC]">publicando</span>
                </h2>
              </div>
              <p className="text-[15px] leading-[1.75] text-[#111A31]/55 lg:col-span-5 [font-family:var(--font-fira-sans)]">
                Análisis, casos y lecturas de mercado escritas por nuestros equipos en
                la región y por los agentes editoriales de Shift LAB. Todo pasa por
                revisión humana antes de publicarse.
              </p>
            </div>

            {/* Grilla regular. */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {enPagina.map((article, i) => (
                <div key={article.id} className="newsroom-card-reveal">
                  <NewsCard article={article} variant="grid" index={i + 1} className="h-full" />
                </div>
              ))}
            </div>

            {/* Paginación numerada. */}
            {totalPaginas > 1 && (
              <nav
                aria-label="Paginación del Newsroom"
                className="mt-16 flex items-center justify-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => setPagina((n) => Math.max(1, n - 1))}
                  disabled={pageActual === 1}
                  aria-label="Página anterior"
                  className="mr-2 flex h-10 w-10 items-center justify-center rounded-full border border-[#111A31]/15 text-[#111A31] transition-colors duration-200 hover:border-[#1534DC] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ←
                </button>

                {Array.from({ length: totalPaginas }, (_, n) => n + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPagina(n)}
                    aria-current={n === pageActual ? "page" : undefined}
                    className={
                      "h-10 w-10 rounded-full text-[13px] font-bold transition-all duration-200 [font-family:var(--font-figtree)] " +
                      (n === pageActual
                        ? "bg-[#1534DC] text-white"
                        : "border border-[#111A31]/15 text-[#111A31]/60 hover:border-[#1534DC] hover:text-[#111A31]")
                    }
                  >
                    {n}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPagina((n) => Math.min(totalPaginas, n + 1))}
                  disabled={pageActual === totalPaginas}
                  aria-label="Página siguiente"
                  className="ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-[#111A31]/15 text-[#111A31] transition-colors duration-200 hover:border-[#1534DC] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  →
                </button>
              </nav>
            )}

          </>
        )}
      </div>

      {/* Scroll-reveal animation styles */}
      <style jsx global>{`
        .newsroom-card-reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }
        .newsroom-card-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .newsroom-card-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
