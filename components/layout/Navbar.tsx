"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    { label: "Nosotros", href: "/about-us" },
    { label: "Servicios", href: "/services" },
    { label: "Shifting Culture®", href: "/shifting-culture" },
    { label: "Shift LAB", href: "/shift-lab" },
    // { label: "Newsroom", href: "/newsroom" },
    { label: "Premios", href: "/awards" },
    { label: "Propósito", href: "/purpose" },
];

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const isMobile = window.matchMedia("(max-width: 767px)").matches;

        if (menuOpen && isMobile) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    return (
        <header className="sticky top-0 z-50 w-full bg-white">
            <div className="mx-auto flex max-w-[1512px] items-center justify-between p-5">
                <Link href="/" className="flex items-center ml-4 sm:ml-7">
                    <Image
                        src="/assets/svg/nav-logo.svg"
                        alt="Shift Latam — inicio"
                        width={98}
                        height={37}
                        priority
                    />
                </Link>

                <div className="flex items-center gap-8 sm:gap-16 text-md sm:text-xl sm:mr-7 font-semibold tracking-wide text-[#1534DC]">
                    <Link
                        href="/contact"
                        className="uppercase align-middle text-center text-base sm:text-[20px] leading-[100%] tracking-[0] font-semibold transition-colors hover:text-[#F540FF] [font-family:var(--font-figtree)]"
                    >
                        Contacto
                    </Link>
                    <button
                        type="button"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className={`uppercase cursor-pointer [font-family:var(--font-figtree)] lg:hidden ${menuOpen ? "text-[#F540FF]" : "text-[#1534DC]"
                            }`}
                        aria-expanded={menuOpen}
                        aria-controls="top-nav-menu"
                    >
                        Menú
                    </button>
                </div>
            </div>
            <div
                id="top-nav-menu"
                className={`overflow-hidden bg-[#EDF0FE] transition-[max-height] duration-300 ${menuOpen
                    ? "max-h-[calc(100vh-77px)] md:max-h-[360px] lg:max-h-32"
                    : "max-h-0 lg:max-h-32"
                    }`}
            >
                <nav aria-label="Navegacion principal" className="mx-auto max-w-[1512px]">
                    <ul
                        className={`text-[#1534DC] font-semibold ${menuOpen
                            ? "flex min-h-[calc(100dvh-77px)] flex-col justify-start gap-6 px-10 pt-20 pb-10 text-xl font-semibold leading-none md:min-h-0 md:flex-row md:flex-wrap md:justify-center md:gap-x-15 md:gap-y-6 md:px-8 md:pt-6 md:pb-6 lg:text-2xl  "
                            : "flex h-0 lg:h-auto lg:flex-row lg:flex-wrap lg:justify-center lg:gap-x-15 lg:gap-y-6 lg:px-8 lg:pt-3.5 lg:p-3.5 lg:text-2xl"
                            }`}
                    >
                        {menuItems.map((item) => (
                            <li key={item.label}>
                                {(() => {
                                    const isActive =
                                        pathname === item.href || pathname.startsWith(`${item.href}/`);
                                    return (
                                <Link
                                    href={item.href}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`whitespace-nowrap text-[24px] leading-[100%] tracking-[0] font-medium transition-colors [font-family:var(--font-figtree)] ${
                                        isActive ? "text-[#F540FF]" : "hover:text-[#F540FF]"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                                    );
                                })()}
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    );
}