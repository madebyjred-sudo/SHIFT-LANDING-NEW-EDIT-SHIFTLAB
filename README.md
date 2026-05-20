# Loymark (Shift Latam)

Marketing site built with [Next.js](https://nextjs.org) (App Router), React 19, Tailwind CSS v4, Framer Motion, GSAP, and Lenis.

## Requirements

- Node.js 20.9 or newer (see `engines` in `package.json`)

## Local development

```bash
npm ci
cp .env.example .env.local
# Edit .env.local: set NEXT_PUBLIC_SITE_URL and SMTP_* if you need the contact form.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server (after `build`) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript without emit |

## Environment variables

Copy `.env.example` to `.env.local`. Never commit real secrets.

- **NEXT_PUBLIC_SITE_URL** — Canonical site origin without a trailing slash (sitemap, `metadataBase`, Open Graph). For production, set this to your real domain.
- **NEXT_PUBLIC_SITE_NAME** — Brand string used in metadata (default: Shift Latam).
- **SMTP_*** — Required for `POST /api/contact` to send mail via Nodemailer (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).

On Vercel, if `NEXT_PUBLIC_SITE_URL` is unset, the app uses `https://${VERCEL_URL}` during build/runtime so previews still get correct absolute URLs.

## Production checklist

1. Set `NEXT_PUBLIC_SITE_URL` to the live HTTPS origin.
2. Configure SMTP (or replace the contact integration with your provider).
3. Run `npm run lint`, `npm run typecheck`, and `npm run build` before deploy.
4. Optional: point uptime checks to `GET /api/health` (returns JSON `{ "ok": true }`, no cache).
5. Contact form uses a honeypot field and a per-IP rate limit in memory; for strict global limits behind many instances, add an edge/WAF or Redis-based limiter.

## Deploy

Compatible with any Node host or [Vercel](https://vercel.com). Build output is the standard Next.js production server (`next build` then `next start`).

## CI

GitHub Actions runs lint, typecheck, and build on pushes and pull requests to `main`/`master` (see `.github/workflows/ci.yml`).
