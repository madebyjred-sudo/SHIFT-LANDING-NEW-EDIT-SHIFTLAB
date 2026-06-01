import Link from "next/link";
import Image from "next/image";
import type { NewsCardArticle } from "./NewsCard";

interface RelatedArticlesProps {
  articles: NewsCardArticle[];
  currentSlug: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function RelatedArticles({ articles, currentSlug }: RelatedArticlesProps) {
  const related = articles.filter((a) => a.slug !== currentSlug).slice(0, 3);
  if (related.length === 0) return null;

  return (
    <section className="mt-20 pt-16 border-t border-[#111A31]/10">
      <h2 className="text-2xl md:text-3xl font-bold text-[#111A31] [font-family:var(--font-figtree)] mb-10 tracking-tight">
        Artículos <span className="text-[#1534DC]">relacionados</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {related.map((article) => (
          <Link
            key={article.id}
            href={article.isMock ? "#" : `/newsroom/${article.slug}`}
            className="group block"
          >
            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden mb-4 bg-[#111A31]/5">
              {article.cover_image ? (
                <Image
                  src={article.cover_image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1534DC]/10 to-[#F540FF]/10" />
              )}
            </div>
            <h3 className="text-base md:text-lg font-bold text-[#111A31] [font-family:var(--font-figtree)] leading-snug group-hover:text-[#1534DC] transition-colors line-clamp-2">
              {article.title}
            </h3>
            <div className="flex items-center gap-2 text-[12px] text-[#111A31]/40 [font-family:var(--font-fira-sans)] mt-2">
              {article.date_published && <span>{formatDate(article.date_published)}</span>}
              {article.read_time && (
                <>
                  <span>·</span>
                  <span>{article.read_time} min</span>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
