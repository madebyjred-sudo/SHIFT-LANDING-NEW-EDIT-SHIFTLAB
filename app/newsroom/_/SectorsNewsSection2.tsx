import NewsSection from "@/components/common/NewsSection";

export default function SectorsNewsSection2() {
  return (
    <NewsSection
      title="Artículos"
      newsItems={[
        {
          src: "/assets/png/sectors/sectors-news-4.png",
          alt: "Noticia destacada",
          title: "Artículo número uno con un descriptor.",
          description:
            "Esto es un texto descriptor del último post de noticias publicadas en el sitio web.",
        },
        {
          src: "/assets/png/sectors/sectors-news-5.png",
          alt: "Noticia dos",
          title: "Artículo número dos de las nuevas.",
        },
        {
          src: "/assets/png/sectors/sectors-news-6.png",
          alt: "Noticia tres",
          title: "Artículo número dos de las nuevas.",
        },
      ]}
    />
  );
}
