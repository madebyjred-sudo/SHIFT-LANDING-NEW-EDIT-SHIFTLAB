import Section from "@/components/common/Section";
import OutlineArrowButton from "@/components/ui/OutlineArrowButton";

export default function SectorsKeepReadingSection() {
  return (
    <div className="bg-[#EDF0FE]">
      <Section className="py-12 md:py-14 lg:py-16 ">
        <div className="rounded-[28px]  ">
          <div className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-center md:justify-between">
            <h2 className="font-glitz text-[36px] leading-[0.95] text-[#0E1745] sm:text-[46px] md:text-[50px]">
              <span className="rotate-180 inline-block">?</span>
              Querés seguir leyendo?
            </h2>
            <div className="md:shrink-0 md:w-[300px]">
              <OutlineArrowButton
                label="Ver más"
              />
            </div>
          </div>
        </div>
      </Section>
    </div>

  );
}
