import type { Metadata } from "next";
import localFont from "next/font/local";
import { Figtree, Fira_Mono, Fira_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LenisProvider from "@/components/layout/LenisProvider";
import { LiquidGlassFilter } from "@/components/ui/liquid-glass";
import ShiftAgent from "@/components/agent/ShiftAgent";
import { SITE_NAME, SITE_URL } from "@/app/seo";

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Mozilla's monospaced sister font to Fira Sans — used in the Shift LAB
// page redesign for its tech / terminal aesthetic.
const firaMono = Fira_Mono({
  variable: "--font-fira-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["600"],
});

const glitz = localFont({
  src: [
    { path: "./fonts/glitz.otf", weight: "400", style: "normal" },
    { path: "./fonts/glitz.ttf", weight: "400", style: "normal" },
  ],
  variable: "--font-glitz-local",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Comunicación y reputación`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Agencia regional de comunicación, reputación y performance con presencia en Centroamérica, Caribe y Sudamérica.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_CR",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} | Comunicación y reputación`,
    description:
      "Agencia regional de comunicación, reputación y performance con presencia en Centroamérica, Caribe y Sudamérica.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Comunicación y reputación`,
    description:
      "Agencia regional de comunicación, reputación y performance con presencia en Centroamérica, Caribe y Sudamérica.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${firaSans.variable} ${firaMono.variable} ${figtree.variable} ${glitz.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LenisProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[9999] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-[#111F5C] focus:shadow"
          >
            Saltar al contenido principal
          </a>
          {/* SVG displacement filter that powers the Liquid Glass effect
              on the floating navbar. Mounted ONCE at the root so any
              child can reference `url(#shift-liquid-warp)`. */}
          <LiquidGlassFilter />
          <Navbar />
          <main id="main-content" className="min-h-0 flex-1 overflow-visible">
            {children}
          </main>
          {/* The Footer card has rounded top corners; wrap it in a dark
              parent so the curve reveals the same navy as the footer
              instead of body white (which would show as a seam on dark
              pages like /shift-lab). */}
          <div className="bg-[#0A0E27]">
            <Footer />
          </div>
          {/* Shift Agent — floating AI assistant. Persists across all
              pages. UI-only for now; the engine plugs in via
              `components/agent/agent-engine.ts`. */}
          <ShiftAgent />
        </LenisProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
              sameAs: [
                "https://www.facebook.com/cacporternovelli/?locale=es_LA",
                "https://www.instagram.com/shiftlatampn/",
                "https://cr.linkedin.com/company/shiftlatamporternovelli",
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
