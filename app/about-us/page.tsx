import type { Metadata } from "next";
import AboutUsHeroSection from "@/app/about-us/_/AboutUsHeroSection";
import AboutUsLeadershipSenioritySection from "@/app/about-us/_/AboutUsLeadershipSenioritySection";
import AboutUsOurRegionalSection from "./_/AboutUsOurRegionalSection";
import AboutUsBanner from "./_/AboutUsBanner";
import AboutUsMoveBanner from "./_/AboutUsMoveBanner";
import { createPageMetadata, createWebPageSchema } from "@/app/seo";

const PAGE_TITLE = "Nosotros";
const PAGE_DESCRIPTION =
  "Conoce al equipo, liderazgo y alcance regional de Shift Latam en Centroamérica, Caribe y Sudamérica.";

export const metadata: Metadata = createPageMetadata({
  pathname: "/about-us",
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: ["nosotros", "equipo", "liderazgo", "agencia regional"],
});

export default function Page() {
  const webPageSchema = createWebPageSchema({
    pathname: "/about-us",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <div className="home-page">
        <AboutUsHeroSection />
        <AboutUsBanner />
        <AboutUsOurRegionalSection />
        <AboutUsMoveBanner />
        <AboutUsLeadershipSenioritySection />
      </div>
    </>
  );
}
