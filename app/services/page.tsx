import type { Metadata } from "next";
import HomeIntroSection from "./_/HomeIntroSection";
import HomeServiciosSection from "./_/HomeServiciosSection";
import { createPageMetadata, createWebPageSchema } from "@/app/seo";

const PAGE_TITLE = "Servicios";
const PAGE_DESCRIPTION =
  "Explora los servicios regionales de comunicación, reputación y performance de Shift Latam.";

export const metadata: Metadata = createPageMetadata({
  pathname: "/services",
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: ["servicios de comunicacion", "relaciones publicas", "reputacion"],
});

export default function ServicesPage() {
  const webPageSchema = createWebPageSchema({
    pathname: "/services",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <HomeIntroSection />
      <HomeServiciosSection />
    </>
  );
}
