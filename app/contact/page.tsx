import type { Metadata } from "next";
import ContactDetailsSection from "@/app/contact/_/ContactDetailsSection";
import ContactIntroSection from "@/app/contact/_/ContactIntroSection";
import ContactPrimaryFormSection from "@/app/contact/_/ContactPrimaryFormSection";
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
      <ContactIntroSection />
      <ContactPrimaryFormSection showFooterSpring={false} />
      <ContactDetailsSection />
    </>
  );
}
