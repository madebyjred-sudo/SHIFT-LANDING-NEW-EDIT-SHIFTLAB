import type { Metadata } from "next";
import ShiftLabHeroSection from "@/app/shift-lab/_/ShiftLabHeroSection";
import ShiftLabInfoSection from "./_/ShiftLabInfoSection";
import PageAspectBanner from "@/components/common/PageAspectBanner";
import ShiftLabAIPhilosophySection from "./_/ShiftLabAIPhilosophySection";
import ShiftLabServiceSection from "./_/ShiftLabServiceSection";
import ProblemWeSolveSection from "./_/ProblemWeSolveSection";
import { createPageMetadata, createWebPageSchema } from "@/app/seo";

const PAGE_TITLE = "Shift LAB";
const PAGE_DESCRIPTION =
  "Conoce Shift LAB, la propuesta de Shift Latam para resolver retos de comunicación con enfoque innovador.";

export const metadata: Metadata = createPageMetadata({
  pathname: "/shift-lab",
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: ["shift lab", "innovacion", "estrategia", "comunicacion"],
});

export default function ShiftLabPage() {
  const webPageSchema = createWebPageSchema({
    pathname: "/shift-lab",
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
      <main className="overflow-x-clip">
        <ShiftLabHeroSection />
        <ShiftLabInfoSection />
        <PageAspectBanner
          imageSrcMd="/assets/images/shift-lab/shift-lab-banner-desktop.png"
          imageSrc="/assets/images/shift-lab/shift-lab-banner-mobile.png"
          innerClassName="aspect-1094/1492! md:aspect-1512/865!"
          imageAlt="Banner de Shift Lab — innovación e IA aplicada a comunicación"
        />
        {/* <ShiftLabModelSection /> */}
        <ShiftLabAIPhilosophySection />
        <ShiftLabServiceSection />
        <ProblemWeSolveSection />
      </main>
    </>
  );
}
