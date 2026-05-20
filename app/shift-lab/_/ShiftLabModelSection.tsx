import Section from "@/components/common/Section";

export default function ShiftLabModelSection() {
  return (
      <Section className="max-w-none! py-12 md:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1240px]">
          <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-start md:justify-between md:gap-12 md:text-left">
            <h2 className="max-w-[18rem] text-[2.15rem] font-glitz leading-[0.95] tracking-[-0.02em] text-[#1534DC] md:max-w-84 md:text-3xl lg:text-5xl">
              ¿Cómo funciona el modelo?
            </h2>

            <p className="max-w-184 text-lg leading-tight text-[#111A31] md:pt-2 md:text-2xl lg:text-[2rem]">
              Nuestro modelo identifica tensiones culturales relevantes,
              traduce datos en narrativas estratégicas y convierte conversaciones
              en influencia sostenible. No diseñamos campañas aisladas;
              diseñamos movimientos que impactan mercados y comunidades.
            </p>
          </div>

          <div className="mt-10 h-px w-full bg-[#A6B6FF] md:mt-14" />
        </div>
      </Section>
  );
}
