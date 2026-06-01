"use client";

import { useState, useEffect, useRef } from "react";
import NewsCard, { type NewsCardArticle } from "./NewsCard";
import CategoryFilter from "./CategoryFilter";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface NewsroomGridProps {
  articles: NewsCardArticle[];
  categories: Category[];
}

const INITIAL_GRID_COUNT = 8; // Show 8 in the grid zone initially
const LOAD_MORE_COUNT = 4;

export default function NewsroomGrid({ articles, categories }: NewsroomGridProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [visibleGridCount, setVisibleGridCount] = useState(INITIAL_GRID_COUNT);
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

  // Layout zones: hero (1), secondary (3), panoramic (1) + compacts (2), grid (rest)
  const hero = filtered[0] || null;
  const secondaries = filtered.slice(1, 4);
  const panoramic = filtered[4] || null;
  const compacts = filtered.slice(5, 7);
  const gridArticles = filtered.slice(7, 7 + visibleGridCount);
  const hasMore = filtered.length > 7 + visibleGridCount;

  // Handle filter change with transition
  const handleFilterChange = (slug: string | null) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveFilter(slug);
      setVisibleGridCount(INITIAL_GRID_COUNT);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  const handleLoadMore = () => {
    setVisibleGridCount((prev) => prev + LOAD_MORE_COUNT);
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
  }, [filtered, visibleGridCount, isTransitioning]);

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
            {/* ZONE 1: Hero */}
            {hero && (
              <div className="newsroom-card-reveal mb-8 lg:mb-10">
                <NewsCard article={hero} variant="hero" priority index={0} />
              </div>
            )}

            {/* ZONE 2: Secondary (3 columns) */}
            {secondaries.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-10">
                {secondaries.map((article, i) => (
                  <div key={article.id} className="newsroom-card-reveal">
                    <NewsCard article={article} variant="standard" index={i + 1} />
                  </div>
                ))}
              </div>
            )}

            {/* ZONE 3: Panoramic + Compact Stack */}
            {(panoramic || compacts.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-8 lg:mb-10">
                {panoramic && (
                  <div className="lg:col-span-8 newsroom-card-reveal">
                    <NewsCard article={panoramic} variant="panoramic" index={4} />
                  </div>
                )}
                {compacts.length > 0 && (
                  <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8">
                    {compacts.map((article, i) => (
                      <div key={article.id} className="newsroom-card-reveal flex-1">
                        <NewsCard article={article} variant="compact" index={5 + i} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ZONE 4: Standard Grid */}
            {gridArticles.length > 0 && (
              <>
                {/* Divider */}
                <div className="flex items-center gap-6 mb-10">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#111A31]/15 to-transparent" />
                  <span className="text-[#111A31]/30 text-[11px] font-bold uppercase tracking-[0.2em] [font-family:var(--font-figtree)]">
                    Más artículos
                  </span>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#111A31]/15 to-transparent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
                  {gridArticles.map((article, i) => (
                    <div key={article.id} className="newsroom-card-reveal">
                      <NewsCard article={article} variant="grid" index={7 + i} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-16">
                <button
                  onClick={handleLoadMore}
                  className="group relative px-10 py-4 rounded-full border border-[#111A31]/15 text-[#111A31] text-[12px] font-bold uppercase tracking-[0.2em] [font-family:var(--font-figtree)] hover:border-[#1534DC] hover:shadow-[0_0_30px_rgba(21,52,220,0.15)] transition-all duration-300 cursor-pointer"
                >
                  <span className="relative z-10">Cargar más artículos</span>
                  <div className="absolute inset-0 rounded-full bg-[#1534DC]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
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
