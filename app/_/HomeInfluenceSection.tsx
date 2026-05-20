import HomeInfluenceBackgroundVideo from "@/app/_/HomeInfluenceBackgroundVideo";

export default function HomeInfluenceSection() {
  return (
    <section className="relative">
      <div className="relative px-5 pt-12 pb-12 sm:px-10 sm:pt-20 sm:pb-16 aspect-400/600 min-[400px]:aspect-400/500 min-[500px]:aspect-1815/1160 md:px-14 md:pt-24 lg:px-20 lg:pt-32">
        <HomeInfluenceBackgroundVideo />

        <div
          className="absolute inset-0 h-[535px] bg-[linear-gradient(180deg,_#1534DC_-9.73%,_rgba(21,52,220,0)_93.76%)]"
          aria-hidden
        />

        {/* <div className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-0" style={{ backgroundImage: "url('/assets/images/influence/banner.svg')" }} aria-hidden /> */}

        <div className="relative z-10 mx-auto w-full max-w-[720px] text-center text-white">
          <h2 className="text-center text-[28px] font-semibold leading-[1.15] tracking-normal [font-family:var(--font-figtree)] sm:text-[34px] md:text-[40px] md:leading-[40px]">
            Integramos estrategia, creatividad, data e inteligencia artificial
          </h2>
          <p className="mx-auto mt-6 max-w-[700px] text-center text-[15px] leading-[1.45] font-normal tracking-normal [font-family:var(--font-fira-sans)] sm:mt-8 sm:text-[16px] md:mt-10 md:text-[18px] md:leading-[20px]">
            Para construir sistemas de influencia sostenibles. No hacemos campañas aisladas: desarrollamos plataformas que generan conversación, confianza y resultados medibles.
          </p>
        </div>

        <div
          className="pointer-events-none absolute bottom-0 right-0 z-20 hidden lg:block"
          aria-hidden
        >
          <img
            src="/assets/png/Vector.png"
            alt=""
            className="block h-auto w-[min(56vw,640px)] max-w-none origin-bottom-right translate-y-[22%] object-contain sm:translate-y-[28%] lg:w-[min(58vw,680px)] lg:translate-y-[32%] lg:pr-[min(5vw,79px)] xl:w-[min(60vw,720px)]"
          />
        </div>
      </div>
    </section>
  );
}
