import Section from "@/components/common/Section";
import AwardCard, { AwardCounts } from "./AwardCard";

type AwardData = {
  id: string;
  name: string;
  svgPath: string;
  counts?: AwardCounts;
  customTexts?: string[];
};

const AWARDS_DATA: AwardData[] = [
  {
    id: "effie",
    name: "Effie Awards",
    svgPath: "/assets/svg/awards/EFFIE.svg",
    counts: { grandPrix: 2, gold: 11, silver: 9 } // Combinando CR y LATAM
  },
  {
    id: "sabre",
    name: "SABRE Awards",
    svgPath: "/assets/svg/awards/SABRE.svg",
    counts: { grandPrix: 3, gold: 29, silver: 13 } // 45 total (LATAM + Global)
  },
  {
    id: "prweek",
    name: "PRWeek Global",
    svgPath: "/assets/svg/awards/GLOBAL-AWARDS.svg",
    counts: { grandPrix: 2, gold: 4 }
  },
  {
    id: "cannes",
    name: "Cannes Lions",
    svgPath: "/assets/svg/awards/CANNES.svg",
    counts: { silver: 1, bronze: 3 } // Glass Lion agrupado como bronce
  },
  {
    id: "ojoibero",
    name: "Ojo de Iberoamérica",
    svgPath: "/assets/svg/awards/OJOIBERO.svg",
    counts: { gold: 4, silver: 2 }
  },
  {
    id: "effie-index",
    name: "Effie Index",
    svgPath: "/assets/svg/awards/EFFIE.svg",
    customTexts: [
      "TOP 3 COSTA RICA EFFIE INDEX GLOBAL 2021-2022",
      "TOP 4 COSTA RICA EFFIE INDEX GLOBAL 2022-2023",
      "TOP 2 COSTA RICA EFFIE INDEX GLOBAL 2023-2024",
      "TOP 2 COSTA RICA EFFIE INDEX GLOBAL 2024-2025"
    ]
  },
  {
    id: "fiap",
    name: "FIAP",
    svgPath: "/assets/svg/awards/FIAP.svg",
    counts: { gold: 1 }
  },
  {
    id: "prplatinum",
    name: "PR Platinum",
    svgPath: "/assets/svg/awards/PR-PLATINUM.svg",
    counts: { gold: 6, silver: 10 }
  },
  {
    id: "volcan",
    name: "Volcán Festival",
    svgPath: "/assets/svg/awards/VOLCAN.svg",
    counts: { gold: 2, silver: 1 }
  },
  {
    id: "antigua",
    name: "Antigua Festival",
    svgPath: "/assets/svg/awards/ANTIGUA.svg",
    counts: { gold: 1 }
  }
];

export default function AwardsLogoStrip() {
  return (
    <Section className="py-8! md:py-16! lg:py-24! lg:pt-8! lg:px-0!">
      <div className="grid grid-cols-2 justify-items-center gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5 lg:gap-8 px-4 xl:px-0 max-w-7xl mx-auto">
        {AWARDS_DATA.map((award) => (
          <AwardCard
            key={award.id}
            name={award.name}
            svgPath={award.svgPath}
            counts={award.counts}
            customTexts={award.customTexts}
          />
        ))}
      </div>
    </Section>
  );
}
