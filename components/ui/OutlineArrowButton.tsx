import Image from "next/image";
import Link from "next/link";

type OutlineArrowButtonProps = {
  label: string | React.ReactNode;
  href?: string;
  buttonClassName?: string;
  iconWrapperClassName?: string;
  iconClassName?: string;
  labelClassName?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

const outlineArrowButtonClassName =
  "group inline-flex touch-manipulation items-center gap-3 rounded-full border border-[#1534DC] bg-transparent py-1.5 pl-4 pr-2 text-base font-semibold leading-none text-[#1534DC] transition-[padding-right] duration-500 ease-out hover:pr-10 active:pr-10 sm:gap-[37.5px] sm:py-3 sm:pl-7 sm:pr-2 sm:text-2xl md:text-[28px] sm:hover:pr-12 sm:active:pr-12 max-h-[63px] disabled:hover:pr-2 disabled:active:pr-2 disabled:sm:hover:pr-12 disabled:sm:active:pr-12";

export default function OutlineArrowButton({
  label,
  href,
  labelClassName = "",
  buttonClassName = "",
  iconWrapperClassName = "",
  iconClassName = "",
  type = "button",
  disabled = false,
}: OutlineArrowButtonProps) {
  const className = `${outlineArrowButtonClassName} ${buttonClassName} cursor-pointer`;

  const content = (
    <>
      <span className={labelClassName}>{label}</span>
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full border border-[#1534DC] transition-all duration-500 ease-out group-hover:translate-x-7 group-active:translate-x-7 sm:h-12 sm:w-12 sm:group-hover:translate-x-10 sm:group-active:translate-x-10 ${iconWrapperClassName}`}
      >
        <Image
          src="/assets/svg/right-arrow.svg"
          alt={`Flecha — ${label}`}
          width={20}
          height={12}
          aria-hidden
          className={`h-auto w-3 transition-all duration-300 ease-out sm:w-5 ${iconClassName}`}
        />
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} className={className}>
      {content}
    </button>
  );
}
