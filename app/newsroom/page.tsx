import { Metadata } from "next";
import directus, { readItems, getDirectusImageUrl, type NewsArticle, type NewsCategory } from "@/lib/directus";
import NewsroomGrid from "@/components/newsroom/NewsroomGrid";
import type { NewsCardArticle } from "@/components/newsroom/NewsCard";

export const metadata: Metadata = {
  title: "Newsroom | Shift Latam",
  description:
    "El pulso de Shift Latam. Últimas noticias, insights estratégicos, casos de éxito y reflexiones sobre comunicación, IA y transformación digital en América Latina.",
};

export const revalidate = 60;

// ─── MOCK DATA ───────────────────────────────────────────────
const MOCK_CATEGORIES = [
  { id: "cat-1", name: "Noticias", slug: "noticias" },
  { id: "cat-2", name: "Insights", slug: "insights" },
  { id: "cat-3", name: "Casos de Éxito", slug: "casos-de-exito" },
  { id: "cat-4", name: "Cultura", slug: "cultura" },
  { id: "cat-5", name: "Eventos", slug: "eventos" },
  { id: "cat-6", name: "Innovación", slug: "innovacion" },
];

const MOCK_ARTICLES: NewsCardArticle[] = [
  {
    id: "m1",
    slug: "futuro-comunicacion-ia-generativa",
    title: "El futuro de la comunicación estratégica en la era de la inteligencia artificial generativa",
    excerpt: "Cómo los LLMs y los agentes autónomos están redefiniendo el landscape del PR corporativo, la gestión de crisis en tiempo real y la creación de narrativas a escala regional.",
    date_published: "2026-05-28T10:00:00Z",
    cover_image: "/assets/images/shift-lab/shift-lab-banner-desktop.png",
    category_name: "Innovación",
    category_slug: "innovacion",
    read_time: 8,
    author: "Equipo Shift LAB",
    isMock: true,
  },
  {
    id: "m2",
    slug: "shift-omnicom-alianza-regional",
    title: "Shift Latam y Omnicom PR Group consolidan alianza estratégica en la región",
    excerpt: "Un nuevo capítulo en nuestra expansión regional fortalece las operaciones en Centroamérica, Caribe y el mercado US Hispanic con capacidades globales.",
    date_published: "2026-05-26T14:30:00Z",
    cover_image: "/assets/png/sectors/newsroom-banner.png",
    category_name: "Noticias",
    category_slug: "noticias",
    read_time: 5,
    author: "Comunicaciones Shift",
    isMock: true,
  },
  {
    id: "m3",
    slug: "radiografia-consumidor-2026",
    title: "Radiografía del Consumidor 2026: Cultura, Propósito y Acción",
    excerpt: "Descubre las macrotendencias que guiarán el consumo este año según nuestro más reciente estudio de Shifting Culture® aplicado a 6 mercados de América Latina.",
    date_published: "2026-05-24T09:15:00Z",
    cover_image: "/assets/png/shifting-culture/shifting-culture-banner.png",
    category_name: "Insights",
    category_slug: "insights",
    read_time: 12,
    author: "Research & Insights",
    isMock: true,
  },
  {
    id: "m4",
    slug: "campana-transformacion-digital",
    title: "Caso Grupo Centennial: De la transformación digital a la reputación corporativa",
    excerpt: "Cómo diseñamos una estrategia integral de comunicación que posicionó a un conglomerado regional como referente en innovación empresarial.",
    date_published: "2026-05-22T11:00:00Z",
    cover_image: "/assets/png/sectors/estudio-1.png",
    category_name: "Casos de Éxito",
    category_slug: "casos-de-exito",
    read_time: 7,
    author: "Cuentas Estratégicas",
    isMock: true,
  },
  {
    id: "m5",
    slug: "shift-day-2026-nueve-paises",
    title: "Así vivimos el Shift Day 2026: 200 personas conectadas desde 9 países",
    excerpt: "Nuestro encuentro anual reunió a todo el equipo regional para co-crear la visión estratégica del próximo año, celebrar logros y reforzar la cultura Shift.",
    date_published: "2026-05-20T16:45:00Z",
    cover_image: "/assets/png/sectors/sectors-banner.png",
    category_name: "Cultura",
    category_slug: "cultura",
    read_time: 6,
    author: "People & Culture",
    isMock: true,
  },
  {
    id: "m6",
    slug: "fiap-2026-paneles-ia-pr",
    title: "Shift presente en FIAP 2026: 3 paneles sobre IA aplicada a la comunicación",
    excerpt: "Nuestros líderes compartieron escenario con ejecutivos de Google, Meta y WPP para debatir el futuro del earned media.",
    date_published: "2026-05-18T20:00:00Z",
    cover_image: "/assets/png/sectors/sectors-news-1.png",
    category_name: "Eventos",
    category_slug: "eventos",
    read_time: 4,
    author: "Marketing Shift",
    isMock: true,
  },
  {
    id: "m7",
    slug: "cerebro-motor-analisis-predictivo",
    title: "Cerebro: Nuestro motor propietario de análisis predictivo ya opera en 6 mercados",
    excerpt: "El sistema de inteligencia artificial desarrollado por Shift LAB procesa más de 50,000 menciones diarias para anticipar tendencias y gestionar reputación.",
    date_published: "2026-05-15T08:30:00Z",
    cover_image: "/assets/png/sectors/estudio-2.png",
    category_name: "Innovación",
    category_slug: "innovacion",
    read_time: 9,
    author: "Equipo Shift LAB",
    isMock: true,
  },
  {
    id: "m8",
    slug: "apertura-oficinas-miami",
    title: "Shift abre oficinas en Miami para atender el mercado US Hispanic",
    excerpt: "La expansión al mercado estadounidense consolida nuestra presencia en el corredor de comunicación más dinámico de las Américas.",
    date_published: "2026-05-12T12:00:00Z",
    cover_image: "/assets/png/sectors/newsroom-inner-1.png",
    category_name: "Noticias",
    category_slug: "noticias",
    read_time: 4,
    author: "Comunicaciones Shift",
    isMock: true,
  },
  {
    id: "m9",
    slug: "tendencias-earned-media-2027",
    title: "5 tendencias que definirán el earned media en 2027",
    excerpt: "Desde la fragmentación de audiencias hasta el auge del contenido generado por IA, estas son las fuerzas que transformarán nuestra industria.",
    date_published: "2026-05-10T09:00:00Z",
    cover_image: "/assets/png/sectors/newsroom-inner-2.png",
    category_name: "Insights",
    category_slug: "insights",
    read_time: 10,
    author: "Research & Insights",
    isMock: true,
  },
  {
    id: "m10",
    slug: "crisis-a-oportunidad-reputacion",
    title: "De crisis a oportunidad: Gestión de reputación en América Latina",
    excerpt: "Un análisis de los 10 casos más relevantes de gestión de crisis corporativa en la región durante el último año.",
    date_published: "2026-05-08T14:00:00Z",
    cover_image: "/assets/png/sectors/estudio-3.png",
    category_name: "Casos de Éxito",
    category_slug: "casos-de-exito",
    read_time: 11,
    author: "Cuentas Estratégicas",
    isMock: true,
  },
  {
    id: "m11",
    slug: "diversidad-inclusion-compromiso",
    title: "Diversidad e inclusión: Nuestro compromiso regional con datos concretos",
    excerpt: "Publicamos nuestro primer reporte de diversidad con métricas transparentes sobre género, edad y representación en los 9 países donde operamos.",
    date_published: "2026-05-05T10:00:00Z",
    cover_image: "/assets/png/sectors/sectors-news-2.png",
    category_name: "Cultura",
    category_slug: "cultura",
    read_time: 6,
    author: "People & Culture",
    isMock: true,
  },
  {
    id: "m12",
    slug: "workshop-comunicacion-proposito",
    title: "Workshop: Comunicación con propósito en la era digital — Resumen",
    excerpt: "Más de 120 profesionales de la comunicación participaron en nuestro taller sobre cómo integrar propósito en estrategias de marca.",
    date_published: "2026-05-02T16:00:00Z",
    cover_image: "/assets/png/sectors/sectors-news-3.png",
    category_name: "Eventos",
    category_slug: "eventos",
    read_time: 5,
    author: "Marketing Shift",
    isMock: true,
  },
];

// ─── HELPERS ─────────────────────────────────────────────────

function mapDirectusArticle(article: NewsArticle): NewsCardArticle {
  const cat = article.category as NewsCategory | null;
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    date_published: article.date_published,
    cover_image: article.cover_image ? getDirectusImageUrl(article.cover_image) : null,
    category_name: cat?.name ?? null,
    category_slug: cat?.slug ?? null,
    read_time: article.read_time,
    author: article.author,
  };
}

// ─── PAGE ────────────────────────────────────────────────────

export default async function NewsroomPage() {
  // Fetch from Directus
  let articles: NewsCardArticle[] = [];
  let categories = MOCK_CATEGORIES;
  let isMock = true;

  try {
    const rawArticles = (await directus.request(
      readItems("news_articles", {
        filter: { status: { _eq: "published" } },
        sort: ["-date_published"],
        fields: ["*", { category: ["id", "name", "slug"] }],
        limit: 50,
      })
    )) as unknown as NewsArticle[];

    if (rawArticles.length > 0) {
      articles = rawArticles.map(mapDirectusArticle);
      isMock = false;

      // Fetch categories
      const rawCats = await directus.request(
        readItems("news_categories", { sort: ["name"], limit: 20 })
      );
      if (rawCats.length > 0) {
        categories = rawCats.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
      }
    }
  } catch {
    // Directus unavailable — fall through to mocks
  }

  if (isMock) {
    articles = MOCK_ARTICLES;
  }

  return (
    <main className="min-h-screen bg-white overflow-hidden selection:bg-[#F540FF] selection:text-white">
      {/* ── Editorial Header ── */}
      <section className="relative pt-[160px] pb-6 md:pt-[220px] md:pb-10 px-6">
        {/* Ambient glows — subtle brand colors on light bg */}
        <div className="absolute top-[-15%] left-[-5%] w-[600px] h-[600px] bg-[#1534DC] opacity-[0.06] blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-[10%] right-[-10%] w-[400px] h-[400px] bg-[#F540FF] opacity-[0.04] blur-[150px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-[1400px] mx-auto">
          {/* Top bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-normal [font-family:var(--font-glitz-local)] leading-[0.9] tracking-tight text-[#111A31]">
                News<span className="text-[#1534DC]">room</span>
              </h1>
              <p className="mt-4 max-w-xl text-base md:text-lg text-[#1F2A44] [font-family:var(--font-fira-sans)] font-light leading-relaxed">
                El pulso de Shift Latam. Últimas noticias, insights estratégicos y disrupción editorial.
              </p>
            </div>

            <div className="flex items-center gap-4 [font-family:var(--font-figtree)] text-[11px] font-bold tracking-[0.15em] uppercase">
              {isMock && (
                <span className="bg-[#F540FF]/10 text-[#F540FF] px-3 py-1.5 rounded-full border border-[#F540FF]/20">
                  Vista Preview
                </span>
              )}
              <span className="text-[#111A31]/30">
                {new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-gradient-to-r from-[#111A31]/10 via-[#111A31]/5 to-transparent" />
        </div>
      </section>

      {/* ── Grid Section ── */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-6 pb-40">
        <NewsroomGrid articles={articles} categories={categories} />
      </section>
    </main>
  );
}
