import HeaderSection from "@/components/common/HeaderSection";
import GradientText from "@/components/ui/GradientText";

export default function ShiftLabHeroSection() {

    const headingText =
        <h1 className="text-2xl max-w-[200px] min-[420px]:max-w-full font-glitz tracking-wide leading-[1.05]  md:text-4xl lg:text-[50px]">
            <GradientText text="No usamos IA como tendencia" />
        </h1>

    const subheadingText = (
        <p
            className="mt-2 max-w-4xl text-center text-lg md:text-[28px] font-semibold not-italic leading-[100%] tracking-[0] text-[#0E1745] [font-family:var(--font-figtree)] [leading-trim:none]"
        >
            La integramos como flujo operativo para mejorar análisis, acelerar decisiones y potenciar criterio humano.
        </p>
    );

    return (
        <HeaderSection
            paddingClassName="py-10 md:py-20"
            backgroundColourClassName="bg-[#EDF0FE]"
            headingText={headingText}
            subheadingText={subheadingText}
        />
    );
}
