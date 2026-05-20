import Image from "next/image";

import Section from "@/components/common/Section";

const paragraphClassName = "text-base leading-[1.25] text-[#0E1745] md:text-[26px] [font-family:var(--font-fira-sans)]";
const boldClassName = "font-semibold";

export default function SectorsNewsroomInnerSection() {
  return (
    <Section className="py-10 md:py-12 lg:py-16">
      <h1 className="text-[38px] font-glitz leading-none text-[#0E1745] sm:text-[52px] lg:text-[96px]">
        Titular de la noticia
      </h1>

      <div className="mt-8 grid gap-6 md:mt-10 lg:mt-12 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-6">
        <div className="space-y-6">
          <p className={paragraphClassName}>
            Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" 
            <span className={boldClassName}>{" "}(The Extremes of Good and Evil){" "}</span>
             by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.
          </p>
          <p className={`${paragraphClassName} ${boldClassName}`}>
            The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
          </p>
          <Image
            src="/assets/png/sectors/newsroom-inner-2.png"
            alt="Paisaje montañoso con carretera junto al agua"
            width={675}
            height={443}
            className="h-auto w-full rounded-[24px] object-cover"
            sizes="(max-width: 1024px) 100vw, 46vw"
          />
          <p className={`${paragraphClassName}`}>
          The standard chunk of Lorem Ipsum used since
          <span className={boldClassName}>{" "}the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33  from "de Finibus {" "}</span>Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative aspect-647/760 overflow-hidden rounded-[24px]">
            <Image
              src="/assets/png/sectors/newsroom-inner-1.png"
              alt="Fotografo tomando una imagen en exteriores"
              fill
              className="object-contain w-full h-auto"
              sizes="(max-width: 1024px) 100vw, 52vw"
              priority
            />
          </div>
          <p className={paragraphClassName}>
          Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. <span className={boldClassName}>{" "}Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on.{" "}</span>
          </p>
          <p className={paragraphClassName}>
          Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at <span className={boldClassName}>{" "}Hampden-Sydney College in Virginia, looked up one{" "}</span> of the more obscure Latin words, consectetur, from a Lorem Ipsum passage,
          </p>
        </div>
      </div>
    </Section>
  );
}
