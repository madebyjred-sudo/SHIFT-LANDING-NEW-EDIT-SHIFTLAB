import type { Metadata } from "next";
import SectorsHeroSection from "@/app/newsroom/_/SectorsHeroSection";
import SectorsNewsSection from "@/app/newsroom/_/SectorsNewsSection";
import SectorsEstudiosSection from "@/app/newsroom/_/SectorsEstudiosSection";
import SectorsNewsSection2 from "@/app/newsroom/_/SectorsNewsSection2";
import { createPageMetadata, createWebPageSchema } from "@/app/seo";

const PAGE_TITLE = "Newsroom";
const PAGE_DESCRIPTION =
  "Explora noticias, perspectivas y contenido editorial de Shift Latam.";

export const metadata: Metadata = createPageMetadata({
  pathname: "/newsroom",
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: ["newsroom", "noticias", "insights", "comunicacion"],
});

export default function NewsroomPage() {
  const webPageSchema = createWebPageSchema({
    pathname: "/newsroom",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  });

  return (
    <>
      {" "}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <main className="overflow-x-hidden">
        <SectorsHeroSection />
        {/* <div className="md:hidden">
          <PageAspectBanner imageAlt="Banner de la página Newsroom de Shift Latam" imageSrc="/assets/png/sectors/sectors-banner.png" sectionClassName="bg-white pt-4 md:pt-8 lg:pt-16" />
        </div> */}
        <SectorsNewsSection />
        {/* <div className="md:hidden">
          <SectorsEstudiosSection2 />
        </div> */}
        <SectorsEstudiosSection />
        <SectorsNewsSection2 />
        <div className="hidden md:block h-16"></div>
      </main>
    </>
  );
}
