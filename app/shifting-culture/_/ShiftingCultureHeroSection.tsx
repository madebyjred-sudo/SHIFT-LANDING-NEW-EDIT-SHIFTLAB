import HeaderSection from "@/components/common/HeaderSection";

export default function ShiftingCultureHeroSection() {

  const headingText =
    <h1 className="text-5xl font-glitz  text-[#FFFFFF] md:text-6xl lg:text-[128px]">
      Shifting
      <br className="sm:hidden" />
      <span className="inline-block pl-1 bg-black sm:hidden"></span>
      {" "}Culture
      <span className="inline-block align-top text-sm leading-none md:text-md lg:text-[48px]">®</span>
    </h1>

  const subheadingText = <p className="mt-2 mx-auto max-w-[280px] sm:max-w-3xl text-center text-lg md:text-[35px] font-semibold not-italic leading-[100%] tracking-[0] text-[#F540FF] [leading-trim:none] [font-family:var(--font-figtree)]">
    Comunicación Estratégica Basada en Cultura
  </p>

  return (
    <HeaderSection
      backgroundColourClassName="bg-[#1534DC]"
      headingText={headingText}
      subheadingText={subheadingText}
    />
  );
}
