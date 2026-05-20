import Image from "next/image";

type PageAspectBannerProps = {
  /** Default / mobile image (< md). */
  imageSrc: string;
  /** Optional wider image for tablet + desktop (md and up). When omitted, `imageSrc` is used at all breakpoints. */
  imageSrcMd?: string;
  /** Descriptive alt for SEO and accessibility (banner is meaningful content). */
  imageAlt: string;
  sectionClassName?: string;
  innerClassName?: string;
  /** Pass when the banner conveys meaning; decorative banners use false. */
  priority?: boolean;
};

const INNER =
  "relative mx-auto w-full aspect-square md:aspect-1573/688 overflow-hidden";

/**
 * Full-width responsive banner with fixed aspect ratio (used across inner pages).
 */
export default function PageAspectBanner({
  imageSrc,
  imageSrcMd,
  imageAlt,
  sectionClassName = "bg-white",
  priority = false,
  innerClassName = "",
}: PageAspectBannerProps) {
  const sharedImg =
    "object-cover object-center absolute inset-0 h-full w-full";

  return (
    <section className={sectionClassName}>
      <div className={INNER + " " + innerClassName}>
        {imageSrcMd ? (
          <>
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className={`${sharedImg} md:hidden`}
              sizes="100vw"
              priority={priority}
            />
            <Image
              src={imageSrcMd}
              alt={imageAlt}
              fill
              className={`${sharedImg} hidden md:block`}
              sizes="100vw"
              priority={priority}
            />
          </>
        ) : (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className={sharedImg}
            sizes="100vw"
            priority={priority}
          />
        )}
      </div>
    </section>
  );
}
