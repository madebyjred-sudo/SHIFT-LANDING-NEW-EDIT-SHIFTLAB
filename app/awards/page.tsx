import type { Metadata } from "next";
import AwardsHeroSection from "@/app/awards/_/AwardsHeroSection";
import AwardsLogoStrip from "@/app/awards/_/AwardsLogoStrip";
import AwardsCarouselSection from "@/app/awards/_/AwardsCarouselSection";
import AwardsVideoManifesto from "@/app/awards/_/AwardsVideoManifesto";
import ContactPrimaryFormSection from "../contact/_/ContactPrimaryFormSection";
import { createPageMetadata, createWebPageSchema } from "@/app/seo";

const PAGE_TITLE = "Premios";
const PAGE_DESCRIPTION =
  "Conoce los premios y reconocimientos que respaldan el trabajo regional de Shift Latam.";

export const metadata: Metadata = createPageMetadata({
  pathname: "/awards",
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: ["premios", "reconocimientos", "casos de exito"],
});

export default function AwardsPage() {
  const webPageSchema = createWebPageSchema({
    pathname: "/awards",
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
        <AwardsHeroSection />
        <AwardsLogoStrip />
        <div className="h-10 md:h-14 lg:hidden"></div>
        <AwardsVideoManifesto />
        <AwardsCarouselSection />
        <ContactPrimaryFormSection />
      </main>
    </>
  );
}
