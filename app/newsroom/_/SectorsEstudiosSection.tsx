import Image from "next/image";
import Link from "next/link";

import Section from "@/components/common/Section";
import OutlineArrowButton from "@/components/ui/OutlineArrowButton";

const ESTUDIOS = [
  {
    src: "/assets/png/sectors/estudio-1.png",
    alt: "Salud y Life Sciences",
    date: "00/mes/0000",
    title: "<span>Salud y </br> Life Sciences</span>",
    description:
      "Comunicación científica, manejo regulatorio, reputación médica y estrategia institucional.",
  },
  {
    src: "/assets/png/sectors/estudio-2.png",
    alt: "Finanzas y Servicios",
    date: "00/mes/0000",
    title: "<span>Finanzas y </br> Servicios</span>",
    description:
      "Narrativa financiera, reputación corporativa, crisis y asuntos públicos.",
  },
  {
    src: "/assets/png/sectors/estudio-3.png",
    alt: "Gobierno y Asuntos Públicos",
    date: "00/mes/0000",
    title: "<span>Gobierno y </br> Asuntos Públicos</span>",
    description:
      "Gestión de agenda pública, narrativa institucional y comunicación estratégica.",
  },
] as const;

function getPlainText(html: string) {
  return html.replace(/<[^>]*>/g, "").trim();
}

function EstudioCard({
  src,
  alt,
  date,
  title,
  description,
}: (typeof ESTUDIOS)[number]) {
  return (
    <article className="flex flex-col gap-4 rounded-[25px] border border-[#1534DC] bg-[#EDF0FE] p-4 sm:flex-row sm:items-start sm:gap-5  md:gap-6 ">
      <div className="relative mx-auto aspect-video md:aspect-square w-full max-w-full shrink-0 overflow-hidden rounded-xl sm:mx-0 sm:h-32 sm:w-32 sm:max-w-none md:h-36 md:w-36 lg:h-[267px] lg:w-[267px]">
        <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 640px) 200px, 160px" />
      </div>
      <div className="flex lg:h-[267px] lg:justify-between min-w-0  min-h-full flex-1 flex-col gap-2 sm:gap-2.5 sm:pt-0.5">
        <span className="text-sm [font-family:var(--font-fira-sans)] font-normal text-[#0E1745] md:text-base lg:text-lg" >
          {date}
        </span>
        <div>
          <h3
            className="text-lg font-semibold lg:leading-[40px] [font-family:var(--font-figtree)] text-[#0E1745] md:text-xl lg:text-[40px]"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <p className="text-sm lg:max-w-[480px] [font-family:var(--font-fira-sans)] leading-relaxed text-[#0E1745] md:text-base lg:text-lg lg:leading-[23px] mt-3 sm:mt-4 md:mt-5 lg:mt-7">{description}</p>
        </div>
      </div>
      <div className="flex justify-end sm:shrink-0 sm:self-start sm:pt-0.5">
        <Link
          href="/newsroom/1"
          className="group flex h-10 w-10 items-center justify-center rounded-full border border-[#1534DC] -white transition-[transform,background-color,border-color]  hover:border-[#F540FF] hover:bg-[#F540FF] md:h-11 md:w-11 lg:h-16 lg:w-16"
          aria-label={`Ver más sobre ${getPlainText(title)}`}
        >
          <Image
            src="/assets/svg/right-arrow.svg"
            alt={`Flecha — ver estudio: ${getPlainText(title)}`}
            width={20}
            height={12}
            className="h-auto w-3 transition-[filter] duration-100 group-hover:brightness-0 group-hover:invert md:w-4 lg:w-6"
            aria-hidden
          />
        </Link>
      </div>
    </article>
  );
}

export default function SectorsEstudiosSection() {
  return (
    <Section className="relative py-0! md:py-0! lg:py-5!">
      <p className="text-3xl font-glitz sm:text-4xl lg:text-[50px]">Estudios</p>
      <div className="mt-8 flex flex-col gap-6 lg:mt-12 lg:gap-8">
        {ESTUDIOS.map((item) => (
          <EstudioCard key={item.title} {...item} />
        ))}
      </div>
    </Section>
  );
}
