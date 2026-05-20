import { ReactNode } from "react";
import Section from "@/components/common/Section";

type TextSectionProps = {
  backgroundImage: ReactNode;
  mainText: ReactNode;
  subText: ReactNode;
  sectionClassname?: string;
};

export default function TextSection({
  backgroundImage,
  mainText,
  subText,
  sectionClassname,
}: TextSectionProps) {
  return (
    <Section className={sectionClassname}>
      {backgroundImage}
      <div className="relative z-20 flex flex-col md:flex-row justify-between">
        <div className="flex-1">{mainText}</div>
        <div className="flex-1">{subText}</div>
      </div>
    </Section>
  );
}
