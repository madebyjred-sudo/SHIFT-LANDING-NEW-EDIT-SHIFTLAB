import Section from "@/components/common/Section";
import Image from "next/image";

const logos: { src: string; alt: string }[] = [
  { src: "/assets/png/awards/award-1.png", alt: "Effie Awards" },
  { src: "/assets/png/awards/award-2.png", alt: "The Sabre Awards" },
  { src: "/assets/png/awards/award-3.png", alt: "Cannes Lions" },
  { src: "/assets/png/awards/award-4.png", alt: "FIAP" },
  { src: "/assets/png/awards/award-5.png", alt: "PRWeek Global Awards" },
  { src: "/assets/png/awards/award-6.png", alt: "Clio Awards" },
];

export default function AwardsLogoStrip() {
  return (
    <Section className="py-4! md:py-12! lg:py-22! lg:pt-4! lg:px-0!">
      <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-8 lg:grid-cols-6 lg:gap-x-3 lg:gap-y-0">
        {logos.map(({ src, alt }) => (
          <div
            key={src}
            className="flex shrink-0 items-center justify-center"
          >
            <Image
              src={src}
              alt={alt}
              width={180}
              height={90}
              className=" h-auto object-contain w-[min(33vw,134px)] sm:w-[134px]"
            />
          </div>
        ))}
      </div>
    </Section>
  );
}
