import type { Metadata } from "next";
import HomeHeroSection from "@/app/_/HomeHeroSection";
import HomeIntroSection from "@/app/_/HomeIntroSection";
import PartnershipMarquee from "@/components/common/PartnershipMarquee";
import HomeInfluenceSection from "@/app/_/HomeInfluenceSection";
import HomeServiciosSection from "@/app/_/HomeServiciosSection";
import HomeShiftingCultureSection from "@/app/_/HomeShiftingCultureSection";
import ContactPrimaryFormSection from "./contact/_/ContactPrimaryFormSection";
import HomeRegionalCapabilitiesSection from "@/app/_/HomeRegionalCapabilitiesSection";
import FooterSpringRings from "@/components/ui/FooterSpringRings";
import CultureProcessSection from "@/components/common/CultureProcessSection";
import { createPageMetadata, createWebPageSchema } from "@/app/seo";

const PAGE_TITLE = "Inicio";
const PAGE_DESCRIPTION =
  "Descubre las capacidades regionales de Shift Latam en comunicación, reputación, cultura y performance.";

export const metadata: Metadata = createPageMetadata({
  pathname: "/",
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: ["agencia de comunicacion", "reputacion", "performance", "latam"],
});

export default function Home() {
  const webPageSchema = createWebPageSchema({
    pathname: "/",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <div className="home-page overflow-x-clip">
        <HomeHeroSection />
        <HomeIntroSection />
        <PartnershipMarquee />
        <HomeInfluenceSection />
        <HomeServiciosSection />
        <HomeShiftingCultureSection />
        <CultureProcessSection />
        <div className="overflow-hidden">
          <div className="relative z-40">
            <div className="pointer-events-none absolute z-40 bottom-0 right-0 hidden justify-end bottom-[-75px] -mr-35 md:flex">
              <div className="pointer-events-auto" style={{ marginRight: "-113px" }}>
                <FooterSpringRings />
              </div>
            </div>
            <HomeRegionalCapabilitiesSection />
          </div>
          <ContactPrimaryFormSection />
        </div>
      </div>
    </>
  );
}
