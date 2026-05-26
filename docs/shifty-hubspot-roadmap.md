# Shifty ↔ HubSpot Integration · Roadmap

Estado al 2026-05-26. Actualizar cuando se completen fases adicionales o cambien decisiones.

---

## ✅ Vivo en producción

### Phase 0 — Persistence layer
- Postgres 16 en VPS Boston (`localhost:5432`, no expuesto)
- 3 tablas: `conversations`, `extractions`, `hubspot_syncs` + view `v_latest_extractions`
- Session ID generado client-side, persistido en `sessionStorage` (key: `shifty-session-id`)
- SSE tee del stream de Cerebro → chunks al cliente + acumulación para logging
- `logTurn` transactional (user+assistant en una sola tx)
- Files: `lib/db/{client,conversations}.ts`, `lib/db/migrations/001_initial.sql`

### Phase 1 — LLM extractor
- Modelo: `google/gemini-2.0-flash` vía Cerebro Gateway
- JSON response_format + prompt estructurado → extrae: email, name, company, country, intent (8 cats), tier (green/yellow/red), sentiment, summary
- Normalize layer defensivo (catch variantes "info_gathering"→"info-gathering", "hot"→"green")
- Trigger: post-stream, solo si `user_turn_count >= 2` Y regex no atrapó este turno
- Costo: ~$0.0001/turno (~$1/mes a 10K turnos)
- File: `lib/agent/extract-lead-llm.ts`

### Phase 2 — Slack hot lead notifications  ⚠ **wired pero no-op hasta `SLACK_WEBHOOK_URL`**
- Webhook con Block Kit formatted (header + fields + button "Ver en HubSpot")
- Solo fire en `tier=green`
- Graceful no-op si env var no seteado
- File: `lib/slack/notify-lead.ts`

### Phase 3 — HubSpot context enrichment
- Lookup contact existente cuando user comparte email
- Pasa info SAFE a Cerebro (firstname/lastname/company/lifecycle/lastmodified)
- NO pasa: owner emails, deals, notas internas (privacy: si LLM los leaka al user, queda expuesto)
- Cache per-session TTL 5min — primera vez paga el lookup (~100-300ms), después free
- Files: `lib/hubspot/lookup-contact.ts`, `lib/agent/contact-context-cache.ts`

### Core HubSpot upsert (pre-existing, ahora cableado)
- `upsertContactWithNote()` — idempotente por email, crea Contact + Note adjunta
- Triggered desde regex extractor (eager) Y LLM extractor (post-stream, si regex no atrapó)
- Source tagged `shifty-chat`
- File: `lib/hubspot/upsert-contact.ts`

---

## ⏸ Pausado · Phase 4 — Meeting booking

Pausado hasta que cada hub owner tenga su Meeting Scheduler page configurada en HubSpot Settings → Meetings.

### Pre-requisitos antes de retomar
1. **Cada hub owner debe crear su scheduling page en HubSpot:**
   - Settings → Meetings → Create scheduling page
   - Configurar duración (15min discovery / 30min demo)
   - Sync calendar (Google Cal o Outlook)
   - Confirmar timezone correcto del hub
2. **Mapeo país → meeting URL** debe vivir en código (similar a `HUB_EMAILS` en `lib/contact-routing.ts`):
   - CR → Oscar's meeting URL
   - GT → ...
   - SV → ...
   - etc

### Decisión técnica pendiente (al retomar)

| Opción | Esfuerzo | UX | Recomendación |
|---|---|---|---|
| **A — Link directo** | 1 hora | Saca user del chat | Solo si urge |
| **B — Iframe embedded** | 1-2 días | Queda en chat (iframe) | Si no querés invertir en custom |
| **C — Custom inline UI** | 3-4 días | Brand-native, mobile-first | ⭐ Recomendado long-term |

### Lo que YA tenemos de gratis (gracias a Phases 0-3)
Cuando se implemente Phase 4, el meeting se crea pre-poblado con:
- Nombre + email del visitor
- Empresa (del LLM extractor)
- País / Hub asignado
- Intent + tier
- Transcript completo de la conversación como agenda/notes
- Page de origen

→ Oscar abre el evento y ve TODO el contexto antes del primer call.

### Métricas que Phase 4 desbloqueará
- Conversion rate: Shifty conv → meeting agendada
- Time-to-booking (latencia desde primer msg → click)
- Show-up rate (asistencia real vs no-show)
- Meeting → cliente (tracked en HubSpot deals downstream)

---

## ⏳ Pendientes inmediatos (no son fases nuevas, son completar lo existente)

### 1. Setear `SLACK_WEBHOOK_URL` en VPS env (~5 min)
Sin esto, Phase 2 está cableado pero silent. Steps:
1. Crear Slack app en `api.slack.com/apps` → "Incoming Webhooks" → Add to workspace → seleccionar canal (ej. `#leads-hot`)
2. Copiar webhook URL (formato `https://hooks.slack.com/services/T.../B.../...`)
3. `ssh root@2.25.128.2`
4. `echo "URL_AQUI" > /root/.shifty-slack-webhook && chmod 600 /root/.shifty-slack-webhook`
5. Editar `/var/www/shiftlatam-web/ecosystem.config.js` → agregar `SLACK_WEBHOOK_URL: readSecret('/root/.shifty-slack-webhook')`
6. `pm2 delete shiftlatam-web && pm2 start ecosystem.config.js && pm2 save`

### 2. Setear `SMTP_*` para form de Contacto clásico
Separado de Shifty. Necesario para que el form `/contact` mande emails al hub correspondiente.
Vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`. Mismo patrón de archivo + ecosystem.

### 3. Rotación del HubSpot token leaked
- Token actual `pat-na1-6c436603-efc7-4f0c-a294-c37cae0a0cb8` está leaked en chat history
- Bug abierto: `SHIFTY-HUBSPOT-TOKEN-LEAKED-CHAT` en `bugs.json`
- Steps: HubSpot Settings → Integrations → Private Apps → Shifty app → Rotate access token → actualizar `/root/.shifty-hubspot-token` + PM2 restart

### 4. Cleanup del contact de prueba
- ID `223779549521` — "Juan Test" creado durante el E2E test
- URL: https://app.hubspot.com/contacts/51487142/record/0-1/223779549521
- Borrar manualmente si querés CRM limpio para producción

---

## Ideas para fases futuras (no priorizadas)

- **Phase 5 — HubSpot Webhooks inbound:** cuando un contact cambia en HubSpot (lifecycle promoted, owner asignado, deal won), refrescar el cache de session contexts y notificar a Shifty para que actualice tono
- **Phase 6 — Custom HubSpot Timeline Event type:** reemplazar las plain Notes con un "Shifty Conversation" event type estructurado. Visualización mucho mejor en HubSpot UI.
- **Phase 7 — Dashboard interno en `/admin/shifty`:** métricas en vivo (sessions/día, tier breakdown, conversion funnel) consumiendo desde la DB local Postgres
- **Phase 8 — Cerebro-side tool calling:** Shifty puede leer/escribir HubSpot directamente desde el modelo (function calling). Requiere mod en Cerebro Gateway.

---

## Env vars status (al 2026-05-26)

| Var | Status | Notas |
|---|---|---|
| `CEREBRO_API_KEY` | ✅ Active | Rotada 2026-05-25, vive en `/root/.shifty-cerebro-key` |
| `DATABASE_URL` | ✅ Active | Postgres localhost VPS Boston |
| `HUBSPOT_TOKEN` | ✅ Active | ⚠ Leaked en chat, pendiente rotar |
| `HUBSPOT_PORTAL_ID` | ✅ Active | `51487142` |
| `SLACK_WEBHOOK_URL` | ❌ Missing | Phase 2 silent hasta setearlo |
| `SMTP_HOST/PORT/USER/PASS` | ❌ Missing | Form clásico de Contacto no manda emails |

Todos los secrets en producción viven en `/root/.shifty-*` (chmod 600) y son leídos por `ecosystem.config.js` via `readSecret()`. NO en git, NO en ecosystem hardcoded.

---

## Infra context

- **VPS:** Hostinger US East — `2.25.128.2` — Ubuntu 24.04 LTS / 2 vCPU / 7.8 GB RAM
- **Web app:** `/var/www/shiftlatam-web/` (Next.js standalone, PM2 cluster, port 3002)
- **Postgres:** `localhost:5432`, DB `shifty_conversations`, user `shifty`
- **nginx:** reverse proxy + Let's Encrypt SSL para `shiftlatam.agency` + `www.`
- **Cerebro Gateway:** Railway-hosted, OAI-compat — `https://shift-cerebro-production.up.railway.app`
- **Brazil VPS legacy:** `187.127.11.223` — caído, no se está usando

VPS de Brasil aún no está borrado/cancelado (puede contener el otro repo mencionado por el cliente). Decidir en algún momento si recuperar y migrar o liberar.
