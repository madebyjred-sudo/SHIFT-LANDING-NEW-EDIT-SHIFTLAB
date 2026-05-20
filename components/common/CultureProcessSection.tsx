import HomeCultureProcessSection from "@/app/_/HomeCultureProcessSection";

export default function CultureProcessSection() {

  const CULTURE_STEPS = [
    {
      num: "01",
      title: "Detectamos tensiones culturales",
      imageSrc: "/assets/images/culture-process/step-04.png",
    },
    {
      num: "02",
      title: "Transformamos insights en ideas estratégicas",
      imageSrc: "/assets/images/culture-process/step-01.png",
    },
    {
      num: "03",
      title: "Activamos creatividad con medición",
      imageSrc: "/assets/images/culture-process/step-02.png",
    },
    {
      num: "04",
      title: "Generamos impacto real",
      imageSrc: "/assets/images/culture-process/step-03.png",
    },
  ] as const;

  const TABLET_CULTURE_STEPS_1 = [
    {
      num: "01",
      title: "Detectamos tensiones culturales",
      imageSrc: "/assets/images/culture-process/step-04.png",
    },
    {
      num: "02",
      title: "Transformamos insights en ideas estratégicas",
      imageSrc: "/assets/images/culture-process/step-01.png",
    }
  ] as const;

  const TABLET_CULTURE_STEPS_2 = [
    {
      num: "03",
      title: "Activamos creatividad con medición",
      imageSrc: "/assets/images/culture-process/step-02.png",
    },
    {
      num: "04",
      title: "Generamos impacto real",
      imageSrc: "/assets/images/culture-process/step-03.png",
    },
  ] as const;

  return (
    <>
      <div className="min-[500px]:hidden lg:block px-4 py-12 md:py-16 lg:py-20">
        <HomeCultureProcessSection steps={CULTURE_STEPS} />
      </div>
      <div className="hidden min-[500px]:block lg:hidden px-4 py-12 md:py-16 lg:py-20">
        <HomeCultureProcessSection steps={TABLET_CULTURE_STEPS_1} />
        <div className="h-5"></div>
        <HomeCultureProcessSection defaultActive={1} steps={TABLET_CULTURE_STEPS_2} />
      </div>
      <div className="hidden min-[500px]:block lg:hidden h-10"></div>
    </>
  );
}