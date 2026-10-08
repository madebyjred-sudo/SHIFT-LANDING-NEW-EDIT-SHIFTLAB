import type { Metadata } from "next";
import ShiftingCultureHeroSection from "./_/ShiftingCultureHeroSection";
import ShiftingCultureInfoSection from "./_/ShiftingCultureInfoSection";
// import ShiftingCultureAIPhilosophySection from "./_/ShiftingCultureAIPhilosophySection";
// import ShiftingCultureServiceSection from "./_/ShiftingCultureServiceSection";
import WhyDifferent from "./_/WhyDifferent";
import ShiftingCultureModelSection from "./_/ShiftingCultureModelSection";
import CultureProcessSection from "@/components/common/CultureProcessSection";
import { createPageMetadata, createWebPageSchema } from "@/app/seo";
import PageFullWidthVideoBanner from "@/components/common/PageFullWidthVideoBanner";

const PAGE_TITLE = "Shifting Culture";
const PAGE_DESCRIPTION =
  "Descubre la metodología Shifting Culture para alinear cultura, reputación y resultados de negocio.";

export const metadata: Metadata = createPageMetadata({
  pathname: "/shifting-culture",
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: ["shifting culture", "cultura organizacional", "reputacion"],
});

export default function ShiftingCulturePage() {
  const webPageSchema = createWebPageSchema({
    pathname: "/shifting-culture",
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
      <div className="overflow-hidden">
        <ShiftingCultureHeroSection />
        <ShiftingCultureInfoSection />
        {/* <PageAspectBanner
          sectionClassName="relative z-0 bg-white"
          imageSrc="/assets/png/shifting-culture/shifting-culture-banner.png"
          imageAlt="Banner de la metodología Shifting Culture de Shift Latam"
        /> */}
        <PageFullWidthVideoBanner
          src="/assets/videos/shifting/VIDEO_SHIFT_FINAL.mp4"
          sectionClassName="relative z-0 bg-white"
          ariaLabel="Banner visual de la sección Premios de Shift Latam"
          audioEnabled
          showPlayerControls
        />
        <ShiftingCultureModelSection />
        <CultureProcessSection />
        {/* <ShiftingCultureAIPhilosophySection /> */}
        {/* <ShiftingCultureServiceSection /> */}
        <WhyDifferent />
      </div>
    </>
  );
}
