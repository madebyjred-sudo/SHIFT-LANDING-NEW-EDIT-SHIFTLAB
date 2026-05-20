import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/seo";

const ROUTES = [
  "",
  "/about-us",
  "/services",
  "/shifting-culture",
  "/shift-lab",
  "/newsroom",
  "/awards",
  "/purpose",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
