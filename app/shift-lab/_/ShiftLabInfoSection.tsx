import Image from "next/image";
import TextSection from "@/components/common/TextSection";

export default function ShiftLabInfoSection() {

  const backgroundImage = <>
  
  <Image
    src="/assets/svg/spring.svg"
    alt="Elemento gráfico decorativo azul — Shift Lab"
    aria-hidden="true"
    width={849}
    height={728}
    className="block sm:hidden pointer-events-none absolute -right-10 lg:right-40 top-[0%] md:scale-[110%] lg:scale-[180%] xl:scale-[220%] z-[1] h-full w-auto "
  />
   <Image
    src="/assets/svg/spring-blue-2.svg"
    alt="Elemento gráfico decorativo azul — Shift Lab"
    aria-hidden="true"
    width={849}
    height={728}
    className="hidden sm:block pointer-events-none absolute -right-10 lg:right-40 top-[0%] md:scale-[110%] lg:scale-[180%] xl:scale-[220%] z-[1] h-full w-auto "
  />
  </>

  const mainText = <p className="w-full font-bold sm:font-normal [font-family:var(--font-fira-sans)] max-w-[380px] pt-4 md:pt-1 text-base leading-tight text-[#F540FF] sm:text-[#111A31] sm:text-lg">
    <span>
      <strong>
        Shift Lab es nuestra unidad de innovación estratégica e inteligencia artificial aplicada a comunicación y reputación.
      </strong>{" "}
      Diseñamos soluciones que integran tecnología, creatividad y negocio para generar eficiencia, profundidad estratégica y ventaja competitiva.
    </span>
  </p>

  return (
    <div className="relative z-10 py-10">
      <TextSection
        backgroundImage={backgroundImage}
        mainText={mainText}
        subText={<></>}
      />
      <div className="hidden lg:block h-35 xl:h-50"></div>
    </div>
  );
}
