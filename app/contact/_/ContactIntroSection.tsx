import Image from "next/image";
import GradientText from "@/components/ui/GradientText";

export default function ContactIntroSection() {
  return (
    <section className="bg-white -mt-5 md:mt-0">
      <div className="mx-auto w-full max-w-[1380px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
        <div>
          {/* Opaline envelope icon como accent thematico previo al
              headline. Más grande (80/96px) + halo magenta radial
              detrás — necesario porque los iconos opaline tienen
              edges semi-transparentes que se pierden contra el bg
              blanco. El halo le da presencia sin romper la limpieza
              del fondo. */}
          <div
            aria-hidden
            className="relative mb-5 inline-flex h-20 w-20 items-center justify-center md:mb-7 md:h-24 md:w-24"
          >
            <span className="absolute inset-0 rounded-full bg-[#F540FF] opacity-15 blur-2xl" />
            <Image
              src="/assets/icons/opaline/envelope.png"
              alt=""
              width={96}
              height={96}
              className="relative h-full w-full object-contain"
            />
          </div>
          <h1 className="text-3xl md:mt-2 font-semibold leading-[110%] text-[#1534DC] sm:text-4xl lg:text-5xl">
            <span className="sm:hidden font-glitz font-normal">
              <GradientText text="Conversemos sobre" className="inline" /><br />
              <GradientText text="tu Estrategia" className="inline" />
            </span>
            <GradientText text="Conversemos sobre tu Estrategia" className="hidden sm:inline [font-family:Glitz] font-normal [font-style:normal] sm:text-[50px] [leading-trim:none] sm:leading-[100%] tracking-[0]" />
          </h1>


          <p className="mt-6 max-w-[90%] text-[#0E1745] sm:max-w-full [font-family:'Fira_Sans'] font-normal [font-style:normal] text-[18px] [leading-trim:none] leading-[26px] tracking-[0]">
            Si buscas una agencia de comunicación estratégica con presencia regional en Latinoamérica, estamos listos para acompañarte.
          </p>
          <p className="mt-4 max-w-[90%] text-[#0E1745] sm:mt-0 sm:max-w-full [font-family:'Fira_Sans'] font-normal [font-style:normal] text-[18px] [leading-trim:none] leading-[26px] tracking-[0]">
            Cuéntanos tu desafío y diseñemos juntos una solución integrada que conecte reputación, cultura y negocio.
          </p>
        </div>
      </div>
    </section>
  );
}
