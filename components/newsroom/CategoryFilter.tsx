"use client";

import { useState, useRef, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface CategoryFilterProps {
  categories: Category[];
  totalCount: number;
  onFilterChange: (slug: string | null) => void;
}

export default function CategoryFilter({ categories, totalCount, onFilterChange }: CategoryFilterProps) {
  const [active, setActive] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const handleClick = (slug: string | null) => {
    setActive(slug);
    onFilterChange(slug);
  };

  // Detect overflow for mobile fade edges
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const check = () => {
      setShowLeftFade(el.scrollLeft > 8);
      setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    };

    check();
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return (
    <div className="relative">
      {/* Mobile fade edges */}
      {showLeftFade && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none md:hidden" />
      )}
      {showRightFade && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none md:hidden" />
      )}

      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto scrollbar-none py-2 -mx-2 px-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* "Todos" pill */}
        <button
          onClick={() => handleClick(null)}
          className={`shrink-0 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-200 [font-family:var(--font-figtree)] border cursor-pointer ${
            active === null
              ? "bg-[#1534DC] border-[#1534DC] text-white shadow-[0_0_24px_rgba(21,52,220,0.25)]"
              : "bg-transparent border-[#111A31]/15 text-[#111A31]/60 hover:border-[#111A31]/30 hover:text-[#111A31]"
          }`}
        >
          Todos
          <span className="ml-2 opacity-60">({totalCount})</span>
        </button>

        {/* Category pills */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleClick(cat.slug)}
            className={`shrink-0 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-200 [font-family:var(--font-figtree)] border cursor-pointer ${
              active === cat.slug
                ? "bg-[#1534DC] border-[#1534DC] text-white shadow-[0_0_24px_rgba(21,52,220,0.25)]"
                : "bg-transparent border-[#111A31]/15 text-[#111A31]/60 hover:border-[#111A31]/30 hover:text-[#111A31]"
            }`}
          >
            {cat.name}
            <span className="ml-2 opacity-60">({cat.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
