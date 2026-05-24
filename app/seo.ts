import type { Metadata } from "next";

function resolveSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const vercel = process.env.VERCEL_URL?.replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // Self-hosted o CI build sin env: fallback al dominio canónico de
  // producción (shiftlatam.agency). Si se requiere apuntar a staging
  // o preview, settear NEXT_PUBLIC_SITE_URL en el runtime (PM2
  // ecosystem, .env.production, etc).
  return "https://shiftlatam.agency";
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Shift Latam";
export const DEFAULT_LOCALE = "es_CR";

export function absoluteUrl(pathname: string): string {
  if (!pathname || pathname === "/") return SITE_URL;
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

type PageSeoInput = {
  pathname: string;
  title: string;
  description: string;
  keywords?: string[];
};

export function createPageMetadata({
  pathname,
  title,
  description,
  keywords = [],
}: PageSeoInput): Metadata {
  const url = absoluteUrl(pathname);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: DEFAULT_LOCALE,
      url,
      title,
      description,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

type WebPageSchemaInput = {
  pathname: string;
  title: string;
  description: string;
};

export function createWebPageSchema({
  pathname,
  title,
  description,
}: WebPageSchemaInput) {
  const url = absoluteUrl(pathname);

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    inLanguage: "es",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
