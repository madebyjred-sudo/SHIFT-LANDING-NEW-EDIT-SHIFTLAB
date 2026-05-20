import Link from "next/link";
import Image from "next/image";

type SocialLink = {
  name: string;
  href: string;
  icon: string;
  hoverIcon?: string;
};
type SocialLinksSize = "sm" | "lg";

function isExternalUrl(href: string): boolean {
  return /^https?:\/\//.test(href);
}

function SocialIconLink({
    social,
    sizeClasses,
    iconClasses,
    containerClassName,
    withHoverIcon = false,
  }: {
    social: SocialLink;
    sizeClasses: string;
    iconClasses: string;
    containerClassName: string;
    withHoverIcon?: boolean;
  }) {
    const external = isExternalUrl(social.href);

    return (
      <Link
        href={social.href}
        aria-label={social.name}
        className={`${containerClassName} ${sizeClasses}`}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        <Image
          src={social.icon}
          alt={`Icono de ${social.name}`}
          aria-hidden
          width={28}
          height={28}
          className={iconClasses}
        />
        {withHoverIcon && (
          <Image
            src={social.hoverIcon || ""}
            alt={`Icono de ${social.name} (estado hover)`}
            aria-hidden
            width={28}
            height={28}
            className="pointer-events-none absolute h-7 w-7 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
          />
        )}
      </Link>
    );
  }

export default function SocialLinks({
    socialLinks,
    size,
    containerClassName = "  ",
  }: {
    socialLinks: SocialLink[];
    size: SocialLinksSize;
    containerClassName?: string;
  }) {
    const stylesBySize: Record<
      SocialLinksSize,
      {
        sizeClasses: string;
        iconClasses: string;
        containerClassName: string;
        withHoverIcon?: boolean;
      }
    > = {
      sm: {
        sizeClasses: "h-11 w-11",
        iconClasses: "h-5 w-5",
        containerClassName:
          "flex items-center justify-center rounded-full border border-[#E7E8EE] transition-colors duration-100 hover:border-white",
      },
      lg: {
        sizeClasses: "h-16 w-16",
        iconClasses: "h-7 w-7 transition-opacity duration-100 group-hover:opacity-0",
        containerClassName:
          "group relative flex items-center justify-center rounded-full border border-[#FFFFFF] transition-colors duration-100 hover:border-[#1534DC] hover:bg-[#1534DC]",
        withHoverIcon: true,
      },
    };
  
    const styles = stylesBySize[size];
  
    return (
      <>
        {socialLinks.map((social) => (
          <SocialIconLink
            key={social.name}
            social={social}
            sizeClasses={styles.sizeClasses}
            iconClasses={styles.iconClasses}
            containerClassName={styles.containerClassName + " " + containerClassName}
            withHoverIcon={styles.withHoverIcon}
          />
        ))}
      </>
    );
  }