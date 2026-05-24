import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    // microphone=(self) → permite que el propio site pida mic (necesario
    // para el dictado de Shifty via Web Speech API). camera/geolocation
    // se mantienen disabled porque nada del sitio los necesita.
    // Si en algún momento se quiere fully disable mic again, cambiar a
    // microphone=() y desactivar el voice feature en agent UI.
    value: "camera=(), microphone=(self), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  // Standalone output: produce un bundle auto-contenido en
  // `.next/standalone/` que incluye node_modules necesarios y un
  // `server.js` ejecutable. Esto es lo que subimos a cPanel — evita
  // tener que correr `npm install` en el servidor (que rara vez tiene
  // suficiente memoria) y evita el `next start` que requiere el repo
  // completo.
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // HTML pages: no browser cache (siempre revalidar via etag).
        // El bundle JS/CSS de /_next/static/* lleva hashes en el
        // filename → ese se cachea forever. Pero el HTML que los
        // referencia debe estar siempre fresco para que próximos
        // deploys aterricen sin necesidad de hard refresh.
        source: "/:path((?!_next|api|assets).*)",
        headers: [
          { key: "Cache-Control", value: "no-cache, must-revalidate" },
        ],
      },
      {
        // SSE de Shifty no se buferea en nginx — chunks llegan vivos.
        source: "/api/agent/:path*",
        headers: [
          { key: "X-Accel-Buffering", value: "no" },
          { key: "Cache-Control", value: "no-cache, no-transform" },
        ],
      },
    ];
  },
};

export default nextConfig;
