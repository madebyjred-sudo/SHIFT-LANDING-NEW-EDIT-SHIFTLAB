#!/usr/bin/env bash
# ----------------------------------------------------------------------
# build-cpanel.sh
# ----------------------------------------------------------------------
# Genera un bundle standalone listo para subir a cPanel.
#
# Uso:
#   ./scripts/build-cpanel.sh
#
# Output:
#   dist/cpanel-bundle.tar.gz   ← subí este archivo a tu cPanel
#
# Lo que arma:
#   - .next/standalone/   (servidor Node + deps mínimas)
#   - .next/standalone/.next/static/   (CSS/JS chunks que Next sirve)
#   - .next/standalone/public/   (favicons, videos, imágenes)
#
# Notas:
#   - Requiere Next.js con `output: "standalone"` en next.config.ts.
#   - Después de subir el bundle al servidor, ejecutás `tar xzf
#     cpanel-bundle.tar.gz` en la carpeta del Node App y reiniciás.
# ----------------------------------------------------------------------

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "→ Limpiando build anterior..."
rm -rf .next dist
mkdir -p dist

echo "→ Instalando deps (production-grade, lockfile)..."
npm ci --no-audit --no-fund

echo "→ Build de Next.js..."
NODE_ENV=production npm run build

echo "→ Copiando assets estáticos al standalone..."
# Next.js no copia automáticamente .next/static ni public/ al standalone.
# Lo hacemos manualmente.
cp -r .next/static .next/standalone/.next/static
if [ -d public ]; then
  cp -r public .next/standalone/public
fi

echo "→ Empaquetando..."
cd .next/standalone
tar czf "$ROOT/dist/cpanel-bundle.tar.gz" .
cd "$ROOT"

SIZE=$(du -h dist/cpanel-bundle.tar.gz | cut -f1)
echo ""
echo "✓ Listo. Bundle: dist/cpanel-bundle.tar.gz ($SIZE)"
echo ""
echo "Próximos pasos:"
echo "  1. Subí dist/cpanel-bundle.tar.gz a cPanel (File Manager o SFTP)."
echo "  2. En la carpeta del Node App: tar xzf cpanel-bundle.tar.gz"
echo "  3. Reiniciá el Node App desde cPanel."
echo "  4. Verifica logs."
