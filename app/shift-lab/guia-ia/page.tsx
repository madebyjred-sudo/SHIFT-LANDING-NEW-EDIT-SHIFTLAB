import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createPageMetadata, absoluteUrl } from "@/app/seo";

/* Guía Shift LAB de visibilidad de marca en IA (AEO/GEO) y escucha digital.
 * Contenido en content/guia-ia.md; se renderiza en el servidor (indexable). */

const RUTA = "/shift-lab/guia-ia";
const TITULO = "Guía de visibilidad de marca en IA (AEO y GEO) · Shift LAB";
const DESCRIPCION = "Cómo medir y mejorar lo que ChatGPT, Gemini, Claude, Perplexity y otras IA dicen de tu marca: preguntas, palabras calientes, auditoría, estrategia y programa. Con datos de Eco en América Latina.";

export const metadata: Metadata = createPageMetadata({ pathname: RUTA, title: TITULO, description: DESCRIPCION, keywords: ["AEO", "GEO", "visibilidad en IA", "palabras calientes", "qué dice ChatGPT de mi marca", "guía AEO en español"] });

const slug = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const texto = (n: unknown): string => (typeof n === "string" ? n : Array.isArray(n) ? n.map(texto).join("") : n && typeof n === "object" && "props" in n ? texto((n as { props: { children?: unknown } }).props.children) : "");

export default async function GuiaPage() {
  const md = await readFile(path.join(process.cwd(), "content", "guia-ia.md"), "utf8");
  const capitulos = [...md.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: TITULO,
    description: DESCRIPCION,
    inLanguage: "es",
    url: absoluteUrl(RUTA),
    author: { "@type": "Organization", name: "Shift LAB · Shift LATAM" },
    publisher: { "@type": "Organization", name: "Shift LATAM" },
    datePublished: "2026-10-21",
  };
  return (
    <div className="eco-guia bg-[#F7F8FC] text-[#0e1745]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="mx-auto grid w-full max-w-[1180px] gap-12 px-6 pt-32 pb-24 md:px-10 md:pt-40 grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-28" aria-label="Capítulos">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#f540ff] [font-family:var(--font-figtree)]">Capítulos</p>
            <ol className="mt-4 space-y-2.5 border-l border-[#e3e5f1] pl-4">
              {capitulos.map((c) => (
                <li key={c}>
                  <a href={`#${slug(c)}`} className="text-[14px] leading-snug text-[#4a5488] transition-colors hover:text-[#1534dc]">{c.replace(/^Capítulo \d+\.\s*/, "")}</a>
                </li>
              ))}
            </ol>
            <div className="mt-8 border-t border-[#e3e5f1] pt-5">
              <p className="text-[13px] text-[#4a5488]">Mide tu marca gratis</p>
              <Link href="/shift-lab/escucha-gratis" className="mt-2 inline-block text-[14px] font-semibold text-[#1534dc]">Pedir mi reporte →</Link>
            </div>
          </nav>
        </aside>
        <article className="guia min-w-0 max-w-[720px] [overflow-wrap:anywhere]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => <h2 id={slug(texto(children))}>{children}</h2>,
              h3: ({ children }) => <h3 id={slug(texto(children))}>{children}</h3>,
              a: ({ href, children }) => (href?.startsWith("/") ? <Link href={href}>{children}</Link> : <a href={href} target="_blank" rel="noopener">{children}</a>),
            }}
          >
            {md}
          </ReactMarkdown>
        </article>
      </div>
      <style>{`
.guia h1{font-family:var(--font-figtree);font-size:clamp(34px,5vw,56px);line-height:1.04;font-weight:800;letter-spacing:-.02em;margin:0 0 20px}
.guia h2{font-family:var(--font-figtree);font-size:clamp(26px,3.4vw,36px);line-height:1.12;font-weight:800;letter-spacing:-.015em;margin:72px 0 18px;padding-top:28px;border-top:1px solid #0e1745;scroll-margin-top:110px}
.guia h3{font-family:var(--font-figtree);font-size:21px;font-weight:700;margin:40px 0 10px;scroll-margin-top:110px}
.guia h4{font-family:var(--font-figtree);font-size:17px;font-weight:700;margin:28px 0 8px}
.guia p,.guia li{font-size:17px;line-height:1.75;color:#2c3566}
.guia p{margin:0 0 16px}
.guia ul,.guia ol{margin:0 0 18px;padding-left:22px}
.guia ul{list-style:disc}.guia ol{list-style:decimal}
.guia li{margin:6px 0}
.guia strong{color:#0e1745}
.guia a{color:#1534dc;text-decoration:underline;text-underline-offset:3px}
.guia hr{border:0;border-top:1px solid #e3e5f1;margin:40px 0}
.guia table{width:100%;border-collapse:collapse;margin:20px 0 24px;font-size:15px}
.guia th{text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#858eb4;border-bottom:1px solid #0e1745;padding:8px 10px}
.guia td{border-bottom:1px solid #e3e5f1;padding:10px;color:#2c3566}
.guia blockquote{border-left:3px solid #f540ff;margin:20px 0;padding:4px 0 4px 18px;color:#4a5488}
@media(max-width:640px){.guia table{display:block;overflow-x:auto}}
`}</style>
    </div>
  );
}
