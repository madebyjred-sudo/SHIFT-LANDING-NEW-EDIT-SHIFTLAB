import type { Metadata } from "next";
import PageFullWidthVideoBanner from "@/components/common/PageFullWidthVideoBanner";
import PurposeHeroSection from "@/app/purpose/_/PurposeHeroSection";
import PurposeImpactSection from "@/app/purpose/_/PurposeImpactSection";
import { createPageMetadata, createWebPageSchema } from "@/app/seo";

const PAGE_TITLE = "Propósito";
const PAGE_DESCRIPTION =
  "Descubre el propósito de Shift Latam y cómo se traduce en impacto para marcas y comunidades.";

export const metadata: Metadata = createPageMetadata({
  pathname: "/purpose",
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: ["proposito", "impacto", "comunicacion con proposito"],
});

export default function PurposePage() {
  const webPageSchema = createWebPageSchema({
    pathname: "/purpose",
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
      <div className="overflow-x-clip">
        <PurposeHeroSection />
        <PageFullWidthVideoBanner
          src="/assets/videos/purpose/purpose-banner.mp4"
          sectionClassName="bg-white pt-4 md:pt-8 lg:pt-16"
          ariaLabel="Banner de la página Propósito de Shift Latam"
        />
        <PurposeImpactSection />
      </div>
    </>
  );
}
