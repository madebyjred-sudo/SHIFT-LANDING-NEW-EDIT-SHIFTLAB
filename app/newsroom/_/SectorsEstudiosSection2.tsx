import Image from "next/image";
import Link from "next/link";

import Section from "@/components/common/Section";

const ESTUDIOS = [
    {
        index: 0,
        src: "/assets/png/sectors/estudio-1.png",
        alt: "Salud y Life Sciences",
        date: "00/mes/0000",
        title: "<span>Salud y </br> Life Sciences</span>",
        description:
            "Comunicación científica, manejo regulatorio, reputación médica y estrategia institucional.",
    },
    {
        index: 1,
        src: "/assets/png/sectors/estudio-2.png",
        alt: "Finanzas y Servicios",
        date: "00/mes/0000",
        title: "<span>Finanzas y </br> Servicios</span>",
        description:
            "Narrativa financiera, reputación corporativa, crisis y asuntos públicos.",
    },
    {
        index: 2,
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
    index,
    src,
    alt,
    date,
    title,
    description,
}: (typeof ESTUDIOS)[number]) {
    return (
        <>
            <article className="flex relative  gap-4 flex-row items-start sm:gap-5  md:gap-6 ">
                <div className="relative mx-auto aspect-square max-w-[200px] shrink-0 overflow-hidden sm:mx-0 h-[33dvw] w-[33dvw] sm:h-[200px] sm:w-[200px] sm:max-w-none  lg:h-[267px] lg:w-[267px]">
                    <Image src={src} alt={alt} fill className="object-cover scale-110" sizes="(max-width: 640px) 200px, 160px" />
                </div>
                <div className="flex h-[33dvw] sm:h-[200px] lg:h-[267px] justify-between min-w-0  min-h-full flex-1 flex-col gap-2 sm:gap-2.5 sm:pt-0.5">
                    <span className="text-sm [font-family:var(--font-fira-sans)] font-normal text-[#0E1745] md:text-base lg:text-lg" >
                        {date}
                    </span>
                    <div>
                        <h3
                            className="text-lg font-semibold leading-[1.2] lg:leading-[40px] [font-family:var(--font-figtree)] text-[#0E1745] md:text-xl lg:text-[40px]"
                            dangerouslySetInnerHTML={{ __html: title }}
                        />
                        <p className="text-sm line-clamp-3 leading-[1.1] lg:max-w-[480px] [font-family:var(--font-fira-sans)] sm:leading-relaxed text-[#0E1745] md:text-base lg:text-lg lg:leading-[23px] mt-2 min-[400px]:mt-3 sm:mt-4 md:mt-5 lg:mt-7">{description}</p>
                    </div>
                </div>
                <div className="absolute right-0 top-0 flex justify-end sm:shrink-0 sm:self-start sm:pt-0.5">
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
            {index < ESTUDIOS.length - 1 ? (index == 1
                ? <div className={`bg-[#D1D8FB] h-px w-full  relative right-0 md:right-[2px]`}></div>
                : <div className={`bg-[#D1D8FB] h-px w-full  relative right-0 md:right-[-2px] lg:right-[7px]`} ></div>) : <></>}
        </>
    );
}

export default function SectorsEstudiosSection() {
    return (
        <Section className="relative pt-0! md:pt-0! lg:pt-10! ">
            <div className="h-10"></div>
            <div className="grid grid-cols-1 min-[574]:grid-cols-6 md:grid-cols-10">
                {/* Item 1 */}
                <div className="col-span-1 min-[574]:col-span-2 md:col-span-10">
                    <p className="text-3xl font-glitz sm:text-4xl lg:text-[50px] mb-6 md:mb-14 lg:mb-20">Noticias</p>
                </div>
                {/* Item 2 */}
                <div className="col-span-1 min-[574]:col-span-4 md:col-span-4 mb-6 sm:mb-10 md:mb-0">
                    <div className="flex flex-wrap gap-x-3.5 md:block">
                        {
                            ['Salud y life sciences', 'Finanzas y servicios', 'Gobierno y asuntos públicos', 'Industria y manufactura', 'Tecnología y digital'].map((item) => (
                                <div key={item} className="mb-3.5 text-[16px] lg:text-[20px]">
                                    <span className="bg-[#D1D8FB] hover:bg-[#1534DC] transition-all duration-100 ease-out hover:text-white rounded-[10px] text-[#1534DC] inline-block p-2 md:p-2.5">{item}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
                {/* Item 3 */}
                <div className="col-span-1 min-[574]:col-span-6 md:col-span-6">
                    <div className=" flex flex-col gap-6 lg:gap-13">
                        {ESTUDIOS.map((item) => (
                            <EstudioCard key={item.title} {...item} />
                        ))}
                    </div>

                </div>
            </div>
            <div className="absolute right-0 left-0 md:left-[-52%] -z-1 bottom-auto w-full h-full scale-160 md:scale-130 top-[-53%] md:top-[20px]" >
                <Image
                    src={"/assets/svg/newsroom-vector.svg"}
                    width={1514}
                    height={1445}
                    alt={"newroom vector image"}
                    className="w-full h-full object-contain"
                />

            </div>
        </Section>
    );
}
