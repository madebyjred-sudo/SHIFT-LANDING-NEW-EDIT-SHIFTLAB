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
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

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

// Mozilla Text Bold — used as headline font on the /shift-lab page.
const mozillaText = localFont({
  src: [{ path: "./fonts/MozillaText-Bold.ttf", weight: "700", style: "normal" }],
  variable: "--font-zilla-slab",
  display: "swap",
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
    locale: "es_419",
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
      lang="es-419"
      className={`${firaSans.variable} ${firaMono.variable} ${figtree.variable} ${glitz.variable} ${mozillaText.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics ga_id="G-J0597B4QEQ" />
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
              "@id": `${SITE_URL}/#organization`,
              name: SITE_NAME,
              alternateName: "Shift Latam",
              url: SITE_URL,
              logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/assets/svg/nav-logo.svg`,
              },
              description:
                "Red de comunicación estratégica y relaciones públicas en América Latina. Reputación corporativa, comunicación de liderazgo y análisis de conversación digital para marcas, instituciones y líderes.",
              areaServed: [
                "Costa Rica",
                "Guatemala",
                "El Salvador",
                "Honduras",
                "Nicaragua",
                "Panamá",
                "Colombia",
                "Ecuador",
                "Venezuela",
                "República Dominicana",
              ],
              knowsAbout: [
                "Comunicación estratégica",
                "Reputación corporativa",
                "Relaciones públicas",
                "Marca personal de liderazgo",
                "Análisis de conversación digital",
                "Comunicación de crisis",
              ],
              sameAs: [
                "https://www.facebook.com/cacporternovelli/",
                "https://www.instagram.com/shiftlatampn/",
                "https://www.linkedin.com/company/shiftlatamporternovelli/",
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
