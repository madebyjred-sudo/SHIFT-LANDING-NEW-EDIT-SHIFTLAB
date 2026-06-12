"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeSanitize from "rehype-sanitize";

/**
 * ChatMarkdown — renderer profesional de markdown para mensajes de chat.
 *
 * Tecnología:
 *   - react-markdown    → parser/remark ecosystem (CommonMark + plugins)
 *   - remark-gfm        → GitHub Flavored Markdown (tablas, ~tachado~, listas task)
 *   - remark-breaks     → saltos de línea simples → <br/>
 *   - rehype-sanitize   → XSS-safe, sólo tags permitidos
 *
 * Estilos custom por elemento ( Tailwind + CSS vars del sistema ),
 * diseñados para superficie oscura del chat. Nada de "prose" genérico.
 */
interface ChatMarkdownProps {
  text: string;
  streaming?: boolean;
}

export default function ChatMarkdown({ text, streaming }: ChatMarkdownProps) {
  // Cuando streaming está activo, el markdown puede estar incompleto
  // (por ejemplo, un `**` sin cerrar). react-markdown lo maneja bien
  // en la mayoría de casos, pero si el texto termina con caracteres
  // de markdown sin cerrar, puede quedar raro. No hay mucho que hacer
  // salvo dejar que fluya; al llegar el cierre, se re-renderiza limpio.
  return (
    <div
      className="chat-markdown"
      style={{
        overflowWrap: "break-word",
        wordBreak: "break-word",
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          // ---- Block elements ----
          p: ({ children }) => (
            <p className="mb-2 text-[13.5px] leading-relaxed text-white/90 last:mb-0">
              {children}
            </p>
          ),
          h1: ({ children }) => (
            <h1 className="mb-2 mt-3 text-[15px] font-bold text-white [font-family:var(--font-figtree)]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-3 text-[14px] font-bold text-white [font-family:var(--font-figtree)]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-1.5 mt-2.5 text-[13.5px] font-semibold text-white/90 [font-family:var(--font-figtree)]">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-1 mt-2 text-[13px] font-semibold text-white/80">
              {children}
            </h4>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-2 border-[#F540FF]/40 pl-3 italic text-white/70">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="my-3 border-white/10" />
          ),

          // ---- Lists ----
          ul: ({ children }) => (
            <ul className="mb-2 list-disc space-y-1 pl-5 marker:text-white/40">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal space-y-1 pl-5 marker:text-white/40">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-[13.5px] leading-relaxed text-white/90">
              {children}
            </li>
          ),

          // ---- Inline elements ----
          strong: ({ children }) => (
            <strong className="font-medium text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-white/80">
              {children}
            </em>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="rounded bg-white/[0.08] px-1 py-0.5 [font-family:var(--font-fira-mono)] text-[12px] text-[#5BE9FF]">
                {children}
              </code>
            ) : (
              <pre className="my-2 overflow-x-auto rounded-lg border border-white/[0.08] bg-black/40 p-3">
                <code className="[font-family:var(--font-fira-mono)] text-[12px] leading-[1.6] text-[#00FF88]">
                  {children}
                </code>
              </pre>
            );
          },
          a: ({ href, children }) => {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="text-white underline underline-offset-[3px] decoration-white/30 hover:text-[#F540FF] hover:decoration-[#F540FF] transition-colors"
              >
                {children}
              </a>
            );
          },

          // ---- Tables (GFM) ----
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto">
              <table className="w-full border-collapse text-[12.5px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-white/20">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-white/[0.08]">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr>{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-2 py-1.5 text-left [font-family:var(--font-figtree)] text-[12px] font-semibold text-white/80">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-2 py-1.5 text-white/70">
              {children}
            </td>
          ),

          // ---- Del / Strikethrough (GFM) ----
          del: ({ children }) => (
            <del className="text-white/40 line-through">
              {children}
            </del>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
      {streaming && <Caret />}
    </div>
  );
}

function Caret() {
  return (
    <span
      aria-hidden
      className="ml-0.5 inline-block h-[13px] w-[1.5px] translate-y-[2px] animate-pulse align-baseline"
      style={{ backgroundColor: "#F540FF" }}
    />
  );
}
