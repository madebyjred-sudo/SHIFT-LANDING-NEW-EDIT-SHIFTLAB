import { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
  className?: string;
};

export default function Section({ children, className = "" }: SectionProps) {
  return <section className={`relative overflow-visible max-w-[1380px] mx-auto px-6 py-16 md:px-12 md:py-20 lg:py-28 lg:px-16 ${className}`}>{children}</section>;
}
