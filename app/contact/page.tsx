import type { Metadata } from "next";
import ContactDetailsSection from "@/app/contact/_/ContactDetailsSection";
import ContactGatewaySection from "@/app/contact/_/ContactGatewaySection";
import RegionalPresenceSection from "@/app/about-us/_/AboutUsOurRegionalSection";
import { createPageMetadata, createWebPageSchema } from "@/app/seo";

const PAGE_TITLE = "Contacto";
const PAGE_DESCRIPTION =
  "Contacta a Shift Latam para desarrollar estrategias de comunicación, reputación y cultura para tu organización.";

export const metadata: Metadata = createPageMetadata({
  pathname: "/contact",
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: ["contacto", "consultoria", "comunicacion regional"],
});

export default function ContactPage() {
  const webPageSchema = createWebPageSchema({
    pathname: "/contact",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <ContactGatewaySection />
      <ContactDetailsSection />
      <RegionalPresenceSection
        title={"Puntos de contacto\nen la región"}
        subtitle="Si busca el contacto local, puede verlo en la tarjeta de su ubicación respectiva."
      />
    </>
  );
}
