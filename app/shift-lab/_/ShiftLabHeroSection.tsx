import HeaderSection from "@/components/common/HeaderSection";
import Image from "next/image";

export default function ShiftLabHeroSection() {
  const headingText = (
    <Image
      src="/assets/images/shift-lab/shift-lab.svg"
      alt="Shift Lab Logo"
      width={476}
      height={124}
      className="h-auto w-[200px] md:w-[476px]"
      priority
    />
  );

  const subheadingText = <p className="mt-6 md:mt-10 max-w-2xl text-base font-semibold leading-[1.05] text-[#F540FF] md:text-lg lg:text-[35px]">
    Innovación e Inteligencia Artificial <br /> Aplicada a Comunicación
  </p>

  return (
    <HeaderSection
      headingText={headingText}
      subheadingText={subheadingText}
    />
  );
}
