import type { Metadata } from "next";
import localFont from "next/font/local";
import { Figtree, Fira_Sans, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LenisProvider from "@/components/layout/LenisProvider";
import { SITE_NAME, SITE_URL } from "@/app/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${firaSans.variable} ${figtree.variable} ${glitz.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LenisProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[9999] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-[#111F5C] focus:shadow"
          >
            Saltar al contenido principal
          </a>
          <Navbar />
          <main id="main-content" className="min-h-0 flex-1 overflow-visible">
            {children}
          </main>
          <Footer />
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
