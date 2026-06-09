# Shift Latam — Session Context

## PROYECTO
- **Repo:** `feat/shiftbot-engine` en `https://github.com/madebyjred-sudo/SHIFT-LANDING-NEW-EDIT-SHIFTLAB.git`
- **Stack:** Next.js 16.2.4 + Tailwind CSS 4 + TypeScript
- **Deploy:** VPS `2.25.128.2` vía rsync + pm2 (`shiftlatam-web`)
- **Reglas CRÍTICAS:**
  - ❌ NO shadcn/ui
  - ❌ NO lucide-react
  - ✅ SVGs inline únicamente
  - ✅ Tailwind CSS para todo
  - ✅ Inline styles solo cuando Tailwind no alcance

## MARCA — Tokens Shift Latam
| Token | Valor |
|---|---|
| Navy | `#111A31` |
| Blue (Primary) | `#1534DC` |
| Pink (Accent) | `#F540FF` |
| Slate | `#1F2A44` |
| Background light | `#FFFFFF` |

## BACKENDS
- **Directus CMS:** `http://2.25.128.2:8055` (admin: `admin@shiftlatam.agency` / `admin`)
- **Supabase Auth:** `lqrrtyqhlpupmjzydbck` (anon key en `.env.local`)
- **Directus auth en APIs:** Usa `lib/directus-auth.ts` (login dinámico con admin credentials)

## TAREA PRINCIPAL — SKEUOMORPHISM DESIGN SYSTEM

### Fuente de verdad
**Figma:** `https://www.figma.com/design/SVR8HM7xWmnXgKmKhGao2W/Noora-Design-System--Community-?node-id=3020-6923&m=dev`

Este es el **Noora Design System** (Community, open source). Usa estilo **skeuomorphism** (no neumorphism). Debes:

1. **Conectarte a Figma vía MCP** (`mcpServers.Figma.url: https://mcp.figma.com/mcp`)
2. **Extraer tokens exactos:** colores, tipografía, sombras, bordes, gradientes
3. **Adaptar los tokens a la marca Shift Latam:**
   - Reemplazar colores genéricos por los tokens de Shift (navy, blue, pink)
   - Mantener la física de sombras, relieves, texturas del skeuomorphism
4. **Implementar en el proyecto:**
   - Navbar con estilo skeuomorphism
   - Botones (primario, secundario, ghost)
   - Inputs, toggles, cards
   - Aplicar donde sea coherente en la landing + newsroom

### ⚠️ CRÍTICO
- **NO inventes diseños.** Si Figma no carga, pide al usuario que describa o que verifique la conexión MCP.
- **NO uses neumorphism.** El usuario rechazó 2 intentos de neumorphism. Quiere **skeuomorphism** (estilo iOS 6, texturas reales, sombras profundas, metales, cristal).
- **Preview primero:** Muestra capturas/descripciones antes de implementar masivo.

## ESTADO ACTUAL DEL NEWSROOM

### Funciona ✅
- Supabase auth (login/register)
- Crear/editar artículos con TipTap editor
- Admin panel (`/newsroom/admin`) con roles (author/editor/admin)
- Dashboard escritorio (`/newsroom/escritorio`)
- Upload de imágenes a Directus
- Redirección `shiftpn.com` → `shiftlatam.agency`

### Usuario admin en Directus
- **guptogether** (id: 4, role: `admin`, user_id: `25214ccc-daf8-4942-8e99-057d4374079b`)

### Schema Directus
- `authors`: id(int), name, slug, bio, avatar, role, social_links, user_id
- `news_articles`: id(uuid), title, slug, excerpt, content, category, layout_preset, cover_image, gallery_images, status, author_id(int), date_published
- `news_categories`: id, name, slug

### APIs
- `POST /api/newsroom/articles` — crea artículo (genera UUID para id)
- `PATCH /api/newsroom/articles/[slug]` — edita
- `GET /api/newsroom/articles` — lista (filtra por author, admin ve todo)
- `DELETE /api/newsroom/articles/[slug]` — eliminar (admin only)
- `POST /api/newsroom/upload` — sube imagen a Directus
- `POST /api/newsroom/authors/ensure` — crea author si no existe

## ARCHIVOS CLAVE
| Archivo | Propósito |
|---|---|
| `lib/directus-auth.ts` | Login dinámico a Directus |
| `lib/auth.ts` | Roles y permisos |
| `components/RichTextEditor.tsx` | TipTap editor |
| `components/PasswordInput.tsx` | Toggle ojito SVG |
| `app/newsroom/escritorio/page.tsx` | Dashboard autor |
| `app/newsroom/admin/page.tsx` | Panel admin |
| `app/newsroom/escritorio/nuevo/page.tsx` | Crear artículo |
| `app/newsroom/escritorio/[slug]/editar/page.tsx` | Editar artículo |

## MCP CONFIG
```json
{
  "mcpServers": {
    "Figma": {
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

Si no carga Figma MCP al iniciar sesión, verifica:
1. Que `~/.kimi-code/mcp.json` o `<cwd>/.kimi-code/mcp.json` exista
2. Que el servidor Figma esté en `needs-auth` y usar `mcp__Figma__authenticate`

## DEPLOY
```bash
rsync -avz --exclude node_modules --exclude .next --exclude .git ./ root@2.25.128.2:/var/www/shiftlatam-web/
# Luego en VPS:
cd /var/www/shiftlatam-web && npm install && npm run build && pm2 restart shiftlatam-web
```

## .env.local VPS (variables críticas)
```
NEXT_PUBLIC_SUPABASE_URL=https://lqrrtyqhlpupmjzydbck.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
DIRECTUS_ADMIN_EMAIL=admin@shiftlatam.agency
DIRECTUS_ADMIN_PASSWORD=admin
NEXT_PUBLIC_DIRECTUS_URL=http://2.25.128.2:8055
```
