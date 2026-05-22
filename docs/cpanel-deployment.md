# Deploy a cPanel — guía paso a paso

Guía para subir el sitio a cPanel. Si tu cPanel tiene **Node.js Selector**
(la mayoría hoy lo tienen), seguís esto y queda andando. Tiempo estimado:
**30-45 min** la primera vez, 5-10 min los redeploys.

> **Decisión:** Vercel queda como **staging** (auto-deploy de `dev`).
> cPanel es producción. Si querés cambiar después, los dos sources son
> el mismo repo.

---

## Pre-requisitos — chequeá antes de arrancar

Hablá con tu hosting / IT para confirmar:

- [ ] cPanel tiene **Setup Node.js App** (suele aparecer bajo "Software").
- [ ] **Node 20.x o 22.x** disponible en el selector.
- [ ] **SSH** o SFTP habilitado (sin esto el deploy es 3x más doloroso).
- [ ] El plan permite **persistent processes** (procesos Node corriendo). En shared hosting económico a veces los matan después de N minutos sin tráfico — preguntá.
- [ ] **Memoria mínima 512MB** para el proceso Node. Mejor 1GB.
- [ ] **Dominio o subdominio** ya creado y apuntando al servidor (DNS A record).
- [ ] **SSL** disponible via Let's Encrypt (cPanel suele tener "AutoSSL").

Si alguno de estos no se cumple, avisame para ajustar el plan.

---

## Paso 1 · Build local del bundle

En tu Mac, en la carpeta del repo:

```bash
./scripts/build-cpanel.sh
```

Esto:
- Limpia builds anteriores
- Corre `npm ci` + `next build` con `output: "standalone"`
- Empaqueta todo en `dist/cpanel-bundle.tar.gz`

Si todo va bien vas a ver:

```
✓ Listo. Bundle: dist/cpanel-bundle.tar.gz (~80MB aprox)
```

> Si el build falla, lo más común es **memoria insuficiente** (Next.js
> 16 quiere ~2GB para builds grandes). Cerrá Chrome, otros editores,
> y volvé a intentar.

---

## Paso 2 · Crear el Node App en cPanel

1. Login a cPanel.
2. Buscá **"Setup Node.js App"** (sección Software).
3. Click **"Create Application"** arriba a la derecha.
4. Configurá:

   | Campo | Valor |
   |---|---|
   | Node.js version | **20.x o 22.x** (la última estable disponible) |
   | Application mode | **Production** |
   | Application root | `shiftpn-web` (se crea automáticamente bajo `/home/USUARIO/`) |
   | Application URL | `shiftpn.com` o el subdominio que vayan a usar |
   | Application startup file | `server.js` |
   | Passenger log file | dejar default |

5. Click **"Create"**. cPanel te muestra el path completo del root
   (algo como `/home/shiftpn/shiftpn-web/`). Anotalo.

> **Importante:** NO toques "Run NPM Install" todavía. Nuestro bundle
> trae las deps ya empaquetadas — el `npm install` en cPanel suele
> fallar por memoria.

---

## Paso 3 · Subir el bundle

Tres opciones, de mejor a peor:

### Opción A · SFTP (recomendado)

```bash
# Reemplazá USUARIO, HOST, y el path del root con los datos de cPanel
sftp USUARIO@HOST
put dist/cpanel-bundle.tar.gz /home/USUARIO/shiftpn-web/
exit
```

### Opción B · cPanel File Manager

1. cPanel → File Manager → navegá a `/home/USUARIO/shiftpn-web/`.
2. Botón **"Upload"** arriba → subí `dist/cpanel-bundle.tar.gz`.
3. Esperá a que termine (puede tardar varios min para ~80MB).

### Opción C · SCP desde terminal

```bash
scp dist/cpanel-bundle.tar.gz USUARIO@HOST:/home/USUARIO/shiftpn-web/
```

---

## Paso 4 · Extraer en el servidor

Necesitás SSH. Si no tenés SSH, usá la **Terminal** de cPanel
(suele estar bajo "Advanced").

```bash
ssh USUARIO@HOST
cd /home/USUARIO/shiftpn-web
tar xzf cpanel-bundle.tar.gz
rm cpanel-bundle.tar.gz
ls
```

Deberías ver:
- `server.js`        ← el entry point
- `.next/`           ← static + chunks
- `public/`          ← assets
- `node_modules/`    ← deps embebidas
- `package.json`

---

## Paso 5 · Variables de entorno

Volvé a cPanel → **Setup Node.js App** → click el ícono **edit** (lápiz)
del app que creaste.

Scrolleá hasta **"Environment Variables"** y agregá las siguientes
(una por una, click **"Add Variable"** después de cada par):

### Obligatorias

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | (lo que te asigne cPanel, usualmente lo gestiona Passenger) |
| `CEREBRO_BASE_URL` | `https://shift-cerebro-production.up.railway.app` |
| `CEREBRO_API_KEY` | (el token de Cerebro Gateway que ya usás) |

### Para Shifty (HubSpot)

| Key | Value |
|---|---|
| `HUBSPOT_TOKEN` | el `pat-na1-...` que generaste en HubSpot |
| `HUBSPOT_PORTAL_ID` | `51487142` |

### Para el form de contacto (email)

| Key | Value |
|---|---|
| `SMTP_HOST` | el host SMTP que ya usás |
| `SMTP_PORT` | `587` (o 465 según el proveedor) |
| `SMTP_USER` | usuario SMTP |
| `SMTP_PASS` | password SMTP |

> Una vez agregadas todas, hacé click **"Save"** arriba.

---

## Paso 6 · Restart + verificación

1. En la pantalla del Node App, click **"Restart"** (arriba a la derecha).
2. Click el link de "Application URL" — se abre el sitio.
3. Checklist de smoke test:

   - [ ] Home carga sin error.
   - [ ] Navbar funciona en todas las páginas.
   - [ ] Click en Shifty → se abre el panel.
   - [ ] Mandá un mensaje a Shifty → debería responder con SSE streaming
         (texto que va apareciendo letra por letra). **Si llega de
         golpe al final, el reverse proxy está bufferando** — saltá al
         paso 7.
   - [ ] Form `/contact` envía email correctamente.
   - [ ] Logo nuevo de Shift se ve en navbar y footer.
   - [ ] Page `/services` muestra las 4 cards sticky correctamente.

---

## Paso 7 · Fix de SSE buffering (si pasa)

Si Shifty responde de golpe en lugar de letra por letra, el reverse
proxy de cPanel está bufferando. Tres líneas de fix posibles, probá
en orden:

### 7a · Apache `.htaccess`

En `/home/USUARIO/shiftpn-web/public/.htaccess` (o si no existe, creálo
en el root del app), agregá:

```apache
<IfModule mod_proxy.c>
  SetEnv proxy-sendchunked 1
  SetEnv no-gzip 1
</IfModule>
<IfModule mod_deflate.c>
  SetEnvIfNoCase Request_URI ^/api/agent no-gzip
</IfModule>
```

### 7b · LiteSpeed (si tu cPanel usa LiteSpeed)

Hablá con tu hosting para que disable response buffering en el path
`/api/agent`. Ellos saben cómo.

### 7c · Confirmar headers

En DevTools (F12) → Network → mandá un mensaje a Shifty → click el
request `/api/agent` → tab Headers → confirmá que aparecen:

- `X-Accel-Buffering: no`
- `Cache-Control: no-cache, no-transform`

Si no aparecen, el proxy los está stripping — hablá con tu hosting.

---

## Paso 8 · DNS + SSL

### DNS

Si el dominio aún no apunta al cPanel:

1. cPanel → **"DNS Zone Editor"** (sección Domains).
2. O en tu registrar (GoDaddy, Namecheap, Cloudflare), apuntá un
   record **A** a la IP del cPanel.

Espera de propagación: 1-48h dependiendo del TTL.

### SSL

1. cPanel → **"SSL/TLS Status"** (sección Security).
2. Encontrá el dominio en la lista.
3. Click **"Run AutoSSL"** — instala Let's Encrypt automático.
4. Esperá ~5 min, refrescá.

Después del SSL, asegurate de que el **Application URL** del Node App
use `https://`.

---

## Re-deploys (cada vez que querés subir cambios nuevos)

Workflow corto:

```bash
# En tu Mac
git pull origin dev
./scripts/build-cpanel.sh

# Subí el bundle (mismo SFTP de antes)
scp dist/cpanel-bundle.tar.gz USUARIO@HOST:/home/USUARIO/shiftpn-web/

# En el servidor (SSH)
ssh USUARIO@HOST
cd shiftpn-web
tar xzf cpanel-bundle.tar.gz --overwrite
rm cpanel-bundle.tar.gz

# Volvé a cPanel → Node App → click Restart
```

Si lo hacés seguido, podés automatizar con un script local o setup de
deploy via Git en cPanel ("Git Version Control" → "Deploy HEAD
Commit"). Pero la primera vez recomendado hacerlo manual para
controlar todo.

---

## Troubleshooting

### "Application failed to start"

1. cPanel → Node App → click el path del **log file** abajo.
2. Errores comunes:
   - `Cannot find module 'X'` → el bundle se subió incompleto. Reextraé.
   - `Permission denied` → permisos de archivos. SSH: `chmod -R 755 ~/shiftpn-web`.
   - `EACCES` en port → Passenger maneja el port, no lo hardcodees.

### Shifty responde "Ups, tuve un problema técnico"

- Variable `CEREBRO_API_KEY` o `CEREBRO_BASE_URL` mal seteada o vacía.
- Cerebro Gateway de Railway pausado / sin crédito → checá Railway dashboard.
- Logs del Node App te muestran el error específico.

### Form `/contact` falla "El servidor de correo no está configurado"

- Faltan `SMTP_*` env vars. Verificá las 4 estén seteadas y reiniciá el app.

### El sitio se ve "roto" — CSS no carga

- El bundle se subió pero `.next/static` falta. Volvé a correr
  `./scripts/build-cpanel.sh` y re-subí.
- O el `Application URL` del Node App no coincide con el dominio real
  → los assets piden `/...` desde el dominio y caen.

### Memoria insuficiente al arrancar

- Subí el "Max old space size" en cPanel Node App settings (si está
  disponible), o pasá `--max-old-space-size=512` al startup.
- Si el shared hosting no permite procesos >256MB, considerá upgrade
  a VPS o quedar en Vercel.

---

## Checklist final post-deploy

- [ ] Bundle compilado y subido (`dist/cpanel-bundle.tar.gz`).
- [ ] Node App creado, modo Production, Node 20+.
- [ ] Env vars: NODE_ENV, CEREBRO_*, HUBSPOT_*, SMTP_*.
- [ ] App iniciado (status: Running).
- [ ] Sitio carga vía https en el dominio final.
- [ ] Shifty responde con streaming (no de golpe).
- [ ] Form `/contact` envía email.
- [ ] Compartiste el URL final al equipo de Shift.
- [ ] Anotaste credenciales de cPanel + paths en password manager
      compartido del equipo (no en este repo).
