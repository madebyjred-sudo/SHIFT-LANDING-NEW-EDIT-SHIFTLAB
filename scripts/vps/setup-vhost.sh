#!/usr/bin/env bash
# scripts/vps/setup-vhost.sh
# Corré esto en la Mac. Sube el vhost al VPS, lo activa, recarga
# nginx y prueba con curl + Host header.
#
# Pre-requisitos:
#   - Site corriendo en pm2 como `shiftlatam-web` en :3001
#   - SSH key autorizada (shiftpn_cpanel_ed25519)

set -euo pipefail

VPS_HOST="187.127.11.223"
SSH_KEY="$HOME/.ssh/id_ed25519"
DOMAIN="shiftlatam.agency"
LOCAL_CONF="$(dirname "$0")/${DOMAIN}.nginx.conf"

echo "→ Copiando vhost al VPS..."
scp -i "$SSH_KEY" "$LOCAL_CONF" \
    "root@${VPS_HOST}:/etc/nginx/sites-available/${DOMAIN}"

echo "→ Activando, validando y recargando nginx..."
ssh -i "$SSH_KEY" "root@${VPS_HOST}" bash <<EOF
set -e
mkdir -p /var/www/certbot
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/${DOMAIN}
nginx -t
systemctl reload nginx
echo "✓ nginx recargado"
EOF

echo "→ Smoke test local con Host header..."
ssh -i "$SSH_KEY" "root@${VPS_HOST}" \
    "curl -sI -H 'Host: ${DOMAIN}' -o /dev/null -w 'HTTP %{http_code} | %{time_total}s\n' http://127.0.0.1/"

echo ""
echo "✅ Vhost listo en VPS para ${DOMAIN} → 127.0.0.1:3001"
echo ""
echo "Próximos pasos manuales:"
echo "  1. DNS: Network Solutions → A record ${DOMAIN} y www → 187.127.11.223"
echo "  2. Esperar propagación (verificar con dig @8.8.8.8 ${DOMAIN})"
echo "  3. SSL:  ssh root@${VPS_HOST} 'certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}'"
echo "  4. Env vars faltantes en PM2:"
echo "     - CEREBRO_API_KEY  (chat de Shifty)"
echo "     - SMTP_PASS        (form de contacto)"
