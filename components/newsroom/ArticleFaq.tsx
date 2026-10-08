"use client";

import * as React from "react";
import { openShifty } from "@/lib/shifty-bus";
import type { FaqItem } from "@/lib/newsroom/faq";

interface ArticleFaqProps {
  heading: string;
  items: FaqItem[];
  /** Título del artículo: contexto para el asistente. */
  articleTitle: string;
}

/*
 * FAQ desplegable del artículo.
 *
 * Decisión que no se toca: las respuestas viven SIEMPRE en el DOM. El
 * colapso es `grid-template-rows: 0fr → 1fr`, así que el texto está
 * presente y medible aunque la tarjeta esté cerrada. Con `display:none`
 * el FAQPage del JSON-LD declararía texto invisible y eso es cloaking
 * para Google — justo en las páginas que queremos posicionar.
 *
 * `hidden` tampoco: usamos `inert` sólo para el foco de teclado, que no
 * afecta la indexación.
 */
export default function ArticleFaq({
  heading,
  items,
  articleTitle,
}: ArticleFaqProps) {
  const [open, setOpen] = React.useState<number | null>(null);

  if (!items.length) return null;

  return (
    <section
      className="mt-14 border-t border-[#111A31]/10 pt-10"
      aria-labelledby="faq-heading"
    >
      <h2
        id="faq-heading"
        className="text-2xl md:text-3xl font-bold text-[#111A31] [font-family:var(--font-figtree)]"
      >
        {heading}
      </h2>

      <ul className="mt-6 flex flex-col gap-3">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <li
              key={i}
              className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                isOpen
                  ? "border-[#1534DC]/35 bg-[#1534DC]/[0.03]"
                  : "border-[#111A31]/10 bg-white hover:border-[#1534DC]/25"
              }`}
            >
              <h3 className="m-0">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-trigger-${i}`}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left md:px-6 md:py-5"
                >
                  <span
                    className={`text-base md:text-lg font-semibold leading-snug transition-colors duration-200 [font-family:var(--font-figtree)] ${
                      isOpen ? "text-[#1534DC]" : "text-[#111A31]"
                    }`}
                  >
                    {item.q}
                  </span>
                  <Chevron open={isOpen} />
                </button>
              </h3>

              {/* grid 0fr→1fr: anima la altura sin quitar el texto del DOM */}
              <div
                id={`faq-panel-${i}`}
                role="region"
                aria-labelledby={`faq-trigger-${i}`}
                className={`grid transition-[grid-template-rows,opacity] duration-400 ease-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div
                    className="faq-answer px-5 pb-5 md:px-6 md:pb-6 text-[#1F2A44] leading-[1.8] [font-family:var(--font-fira-sans)]
                      [&_p]:mb-3 [&_p:last-child]:mb-0
                      [&_a]:text-[#1534DC] [&_a]:no-underline hover:[&_a]:underline
                      [&_strong]:text-[#111A31] [&_strong]:font-bold
                      [&_ul]:mt-2 [&_ul]:mb-3 [&_li]:mb-1"
                    dangerouslySetInnerHTML={{ __html: item.a }}
                  />
                </div>
              </div>
            </li>
          );
        })}

        {/* Última fila: abre el asistente con el artículo como contexto. */}
        <li className="mt-1">
          <button
            type="button"
            onClick={() =>
              openShifty({
                message: "Me gustaría saber más sobre este artículo que estoy viendo",
                context: articleTitle,
              })
            }
            className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-dashed border-[#1534DC]/40 bg-white px-5 py-4 text-left transition-all duration-300 hover:border-[#F540FF]/60 hover:bg-[#1534DC]/[0.04] md:px-6 md:py-5"
          >
            <span className="text-base md:text-lg font-semibold text-[#1534DC] transition-colors duration-200 group-hover:text-[#F540FF] [font-family:var(--font-figtree)]">
              ¿Alguna pregunta nueva?
            </span>
            <span className="flex items-center gap-2 text-sm text-[#111A31]/55 [font-family:var(--font-fira-sans)]">
              <span className="hidden sm:inline">Preguntale al asistente</span>
              <ArrowChat />
            </span>
          </button>
        </li>
      </ul>
    </section>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`mt-0.5 shrink-0 transition-transform duration-300 ${
        open ? "rotate-180 text-[#1534DC]" : "text-[#111A31]/45"
      }`}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowChat() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-[#1534DC] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-[#F540FF]"
    >
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
