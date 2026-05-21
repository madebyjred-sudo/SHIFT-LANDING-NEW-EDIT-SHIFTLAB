import type { Metadata } from "next";
import ShiftLabHeroSection from "@/app/shift-lab/_/ShiftLabHeroSection";
import ShiftLabInfoSection from "./_/ShiftLabInfoSection";
import ShiftLabBannerSection from "./_/ShiftLabBannerSection";
import ShiftLabAIPhilosophySection from "./_/ShiftLabAIPhilosophySection";
import ShiftLabServiceSection from "./_/ShiftLabServiceSection";
import ProblemWeSolveSection from "./_/ProblemWeSolveSection";
import { createPageMetadata, createWebPageSchema } from "@/app/seo";

const PAGE_TITLE = "Shift LAB";
const PAGE_DESCRIPTION =
  "Conoce Shift LAB, la unidad de innovación e inteligencia artificial de Shift Latam para resolver retos de comunicación.";

export const metadata: Metadata = createPageMetadata({
  pathname: "/shift-lab",
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: ["shift lab", "innovacion", "inteligencia artificial", "comunicacion"],
});

export default function ShiftLabPage() {
  const webPageSchema = createWebPageSchema({
    pathname: "/shift-lab",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      {/* Single dark canvas spans the full page — sections share a
          consistent navy background and the navbar reads it as "dark". */}
      <main className="overflow-x-clip bg-[#0A0E27]">
        <ShiftLabHeroSection />
        <ShiftLabInfoSection />
        <ShiftLabBannerSection />
        <ShiftLabAIPhilosophySection />
        <ShiftLabServiceSection />
        <ProblemWeSolveSection />
      </main>
    </>
  );
}
