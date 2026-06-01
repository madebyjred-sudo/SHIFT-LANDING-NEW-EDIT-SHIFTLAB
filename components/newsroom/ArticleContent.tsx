import Image from "next/image";
import { getDirectusImageUrl } from "@/lib/directus";

interface ArticleContentProps {
  content: string;
}

/*
 * Parsea HTML plano y lo convierte en componentes React enriquecidos.
 * Fallback seguro: si el parseo falla, renderiza el HTML crudo.
 */
export default function ArticleContent({ content }: ArticleContentProps) {
  if (!content) return null;

  return (
    <div
      className="article-content prose prose-lg md:prose-xl max-w-none [font-family:var(--font-fira-sans)]
        prose-headings:[font-family:var(--font-figtree)] prose-headings:font-bold prose-headings:text-[#111A31]
        prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-14 prose-h2:mb-6
        prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
        prose-a:text-[#1534DC] hover:prose-a:text-[#F540FF] prose-a:transition-colors prose-a:no-underline hover:prose-a:underline
        prose-strong:text-[#111A31] prose-strong:font-bold
        prose-p:text-[#1F2A44] prose-p:leading-[1.8] prose-p:mb-6
        prose-blockquote:border-l-[3px] prose-blockquote:border-[#1534DC] prose-blockquote:bg-[#1534DC]/[0.03] prose-blockquote:px-6 prose-blockquote:py-5 prose-blockquote:rounded-r-xl prose-blockquote:text-[#111A31]/90 prose-blockquote:italic prose-blockquote:font-medium
        prose-ul:my-6 prose-ol:my-6 prose-li:text-[#1F2A44] prose-li:leading-[1.7] prose-li:mb-2
        prose-img:rounded-2xl prose-img:border prose-img:border-[#111A31]/8 prose-img:shadow-sm prose-img:my-8
        prose-figure:my-8
        prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-[#111A31]/50 prose-figcaption:mt-2
        prose-pre:bg-[#111A31] prose-pre:text-white prose-pre:rounded-xl prose-pre:p-5 prose-pre:my-8 prose-pre:overflow-x-auto
        prose-code:text-[#1534DC] prose-code:bg-[#1534DC]/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
        prose-pre:prose-code:text-white prose-pre:prose-code:bg-transparent prose-pre:prose-code:p-0 prose-pre:prose-code:rounded-none
        prose-hr:border-[#111A31]/10 prose-hr:my-12
        prose-table:border-collapse prose-table:w-full prose-table:my-8
        prose-th:bg-[#111A31]/5 prose-th:text-[#111A31] prose-th:font-bold prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:text-sm
        prose-td:border-t prose-td:border-[#111A31]/10 prose-td:px-4 prose-td:py-3 prose-td:text-sm prose-td:text-[#1F2A44]"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
