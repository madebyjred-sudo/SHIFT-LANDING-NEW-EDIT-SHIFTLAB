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
    value: "camera=(), microphone=(), geolocation=()",
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
        // Asegura que el SSE de Shifty no se bufferee en el reverse
        // proxy de cPanel (Apache/LiteSpeed). Sin esto, el stream
        // llega de un solo golpe al final y la UI se siente rota.
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
