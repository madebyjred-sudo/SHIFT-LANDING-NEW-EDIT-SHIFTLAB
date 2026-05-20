import Section from "@/components/common/Section";
import { ReactNode } from "react";

interface HeaderSectionProps {
  backgroundColourClassName?: string;
  paddingClassName?: string;
  headingText: ReactNode;
  subheadingText: ReactNode;
}

export default function HeaderSection({
  backgroundColourClassName = "bg-[#0E1745]",
  paddingClassName = "py-24 md:py-32 min-h-[min(60vh,52rem)] md:min-h-[min(92vh,56rem)] ",
  headingText,
  subheadingText,
}: HeaderSectionProps) {
  return (
    <Section
      className={`max-w-none! mx-0 flex w-full flex-col items-center justify-center overflow-hidden! ${backgroundColourClassName} ${paddingClassName}`}
    >
      <div className="relative z-10 flex  flex-col items-center px-4 text-center">
          {headingText}
          {subheadingText}
      </div>
    </Section>
  );
}

