import { ReactNode } from "react";
import Image from "next/image";

type ImpactCardProps = {
  numberImageSrc: string;
  numberAlt: string;
  content: ReactNode;
  bgClass: string;
  alignClass: string;
  contentClass?: string;
};

export default function ImpactCard({
  numberImageSrc,
  numberAlt,
  content,
  bgClass,
  alignClass,
  contentClass,
}: ImpactCardProps) {
  return (
    <article
      className={`${alignClass} ${bgClass} relative flex aspect-786/351 w-full max-w-[786px] flex-col rounded-[20px] p-6 pb-10 md:p-10  md:pb-14 text-white`}
    >
      <Image
        src={numberImageSrc}
        alt={numberAlt}
        width={49}
        height={71}
        className="self-start h-[48px] w-auto sm:h-[86px]"
      />

      <p
        className={`${contentClass ?? ""} mt-4 mx-auto md:mt-8 md:mx-0 max-w-[480px] lg:ml-[30%] text-xl sm:text-3xl leading-[0.92] md:ml-auto md:text-4xl md:leading-[32px]`}
      >
        {content}
      </p>
    </article>
  );
}
