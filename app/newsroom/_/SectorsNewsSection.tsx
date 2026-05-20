import NewsSection from "@/components/common/NewsSection";

export default function SectorsNewsSection() {
  return (
    <NewsSection
      title="Noticias"
      newsItems={[
        {
          src: "/assets/png/sectors/sectors-news-1.png",
          alt: "Noticia destacada",
          title: "Noticia número uno con un descriptor.",
          description:
            "Esto es un texto descriptor del último post de noticias publicadas en el sitio web.",
        },
        {
          src: "/assets/png/sectors/sectors-news-2.png",
          alt: "Noticia dos",
          title: "Noticia número dos de las nuevas.",
        },
        {
          src: "/assets/png/sectors/sectors-news-3.png",
          alt: "Noticia tres",
          title: "Noticia número tres de las nuevas.",
        },
      ]}
    />
  );
}
