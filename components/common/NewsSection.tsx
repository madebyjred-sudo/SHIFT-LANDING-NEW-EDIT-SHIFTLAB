import Image from "next/image";
import Link from "next/link";

import Section from "@/components/common/Section";
import OutlineArrowButton from "@/components/ui/OutlineArrowButton";

export type NewsItem = {
  src: string;
  alt: string;
  title: string;
  description?: string;
  buttonLabel?: string;
};

type NewsSectionProps = {
  title: string;
  newsItems: [NewsItem, NewsItem, NewsItem];
  className?: string;
};

function SecondaryNewsItem({ src, alt, title }: NewsItem) {
  return (
    <article className="flex w-full flex-col gap-3 lg:gap-7">
      <div className="relative w-full overflow-hidden rounded-[25px] aspect-339/234">
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>
      <h3 className="text-base min-[400px]:text-lg [font-family:var(--font-figtree)] font-semibold text-[#1534DC] md:leading-[31px] md:text-[32px]">{title}</h3>
    </article>
  );
}

export default function NewsSection({
  title,
  newsItems,
  className = "",
}: NewsSectionProps) {
  const [featured, second, third] = newsItems;

  return (
    <Section className={`relative overflow-hidden ${className}`}>
      <h2 className="relative text-3xl font-glitz sm:text-4xl lg:text-[50px]">
        {title}
      </h2>

      <div className="relative z-20 mt-8 grid grid-cols-2 gap-y-8 lg:mt-13 lg:grid-cols-10 md:gap-8 lg:gap-y-0">
        <article className="rounded-[25px] border border-[#1534DC] bg-[#EDF0FE] p-4 sm:p-5 col-span-2 lg:col-span-7">
          <div className="relative w-full overflow-hidden rounded-xl sm:rounded-[18px] aspect-878/345">
            <Image
              src={featured.src}
              alt={featured.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
          </div>
          <div className="pt-5 sm:pt-6 lg:pt-8 lg:pl-4 md:max-w-[80%]">
            <h3 className="font-glitz text-2xl md:leading-[100%] md:text-[50px] text-[#1534DC]">
              {featured.title}
            </h3>
            {featured.description && (
              <p className="mt-3 lg:mt-6 md:max-w-[80%] md:leading-relaxed text-[#1534DC] text-base md:text-xl">
                {featured.description}
              </p>
            )}
            <div className="mt-6 lg:mt-8">
              <Link href="/newsroom/1">
                <OutlineArrowButton label={featured.buttonLabel ?? "Ver más"} />
              </Link>
            </div>
          </div>
        </article>

        <div className="flex flex-row gap-6 lg:flex-col min-[400px]:gap-8 sm:justify-between lg:gap-8 lg:pt-0 col-span-2 lg:col-span-3">
          <SecondaryNewsItem {...second} />
          <SecondaryNewsItem {...third} />
        </div>
      </div>
    </Section>
  );
}
