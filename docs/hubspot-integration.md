# HubSpot integration — plan

Plan para conectar el sitio (Shifty + form de contacto) al CRM de
HubSpot. Lo escribo como ruta práctica, no como spec — para que tu
equipo y/o el siguiente agente lo pueda ejecutar.

---

## Lo que queremos conectar

| Source | Qué se manda a HubSpot | Prioridad |
|---|---|---|
| **Shifty handoff** (el último turno con nombre + email + brief) | Crea/actualiza Contact + Note con el contexto | **P1** — el más urgente |
| **Form `/contact`** (página de contacto actual) | Crea/actualiza Contact + Note + asigna a hub regional | **P1** — ya existe el plumbing, solo cambia el sink |
| **Transcript completo de la conversación** | Adjuntar como Note timeline en el Contact | **P2** — bonus para sales |
| **Lead scoring por intent** (premio/servicios/precio/contacto) | Set custom property `shifty_intent` para que sales priorice | **P2** |
| **Notificación al equipo** | Workflow de HubSpot manda Slack + email cuando entra lead nuevo | **P3** — lo configura tu Ops |

---

## Approach técnico — Private App + Contacts API

**Por qué Private App:** te da un access token estable, no expira sin
notificar, y es el patrón oficial de HubSpot para integraciones
server-to-server (Forms API es más limitado).

### Lo que necesitamos de tu lado (5 min en HubSpot UI)

1. Crear una **Private App** en `Settings → Integrations → Private Apps`.
2. Darle nombre: `Shifty + Web Site → CRM`.
3. Scopes mínimos:
   - `crm.objects.contacts.read` + `crm.objects.contacts.write`
   - `crm.objects.notes.write`
   - (opcional P2) `crm.schemas.contacts.write` para crear custom properties
4. Copiar el **Access Token** que genera. Guardarlo como
   `HUBSPOT_TOKEN` en Vercel env vars (production + preview + dev).
5. Copiar el **Portal ID** (visible en el URL del portal), guardarlo
   como `HUBSPOT_PORTAL_ID`.

### Lo que hago del lado del código

```
app/api/agent/route.ts      ← yá existe, agrega llamada a HubSpot
app/api/contact/route.ts    ← yá existe, ídem
lib/hubspot/
  ├── client.ts             ← fetch helper con auth + retry
  ├── upsert-contact.ts     ← create-or-update por email
  ├── add-note.ts           ← append transcript / brief al contact
  └── types.ts              ← shapes de HubSpot API
```

### El flow en runtime

Cuando Shifty detecta el handoff (`matchScript(text)` toca el caso
"contacto" o el usuario manda nombre+email+brief):

```typescript
// 1. Upsert contact por email
const contactId = await upsertContact({
  email: payload.email,
  firstname: payload.nombre,
  lifecyclestage: "lead",
  hs_lead_status: "NEW",
  // custom properties (creadas via API en P2)
  shifty_intent: detectedIntent,        // "servicios" | "premios" | etc
  shifty_source: "website-chat",
  shifty_first_msg: firstUserMessage.slice(0, 500),
});

// 2. Adjuntar el brief como Note
await addNoteToContact(contactId, {
  body: formatTranscriptAsNote(conversationHistory),
  ownerId: hubOwnerIdByCountry(payload.country), // opcional
});
```

Para el form `/contact`, la lógica es idéntica — el payload viene del
form en lugar del agente, pero el sink es el mismo.

---

## Field mapping recomendado

| HubSpot property | Source de Shifty / Form | Notas |
|---|---|---|
| `email` | input del usuario | Required, dedupe key |
| `firstname` | input del usuario | Required |
| `lastname` | input del usuario (si lo da) | Optional |
| `phone` | input del form (no Shifty por ahora) | Optional |
| `company` | input del usuario | Optional, pero útil para sales |
| `country` | hub seleccionado (form) o detectado (Shifty) | Maps a Owner |
| `lifecyclestage` | siempre `"lead"` al entrar | HubSpot built-in |
| `hs_lead_status` | siempre `"NEW"` | HubSpot built-in |
| `shifty_intent` *(custom)* | premios / servicios / lab / contacto / precio | Para que sales filtre |
| `shifty_source` *(custom)* | `"website-chat"` o `"contact-form"` | Distingue origen |
| `shifty_first_msg` *(custom, text 500)* | primer mensaje del usuario | Hook para conversación |

---

## Phasing

### Phase 1 — MVP (1 día de dev)
- Private app creada del lado de HubSpot.
- `lib/hubspot/` con `upsertContact` + `addNoteToContact`.
- `app/api/agent/route.ts` invoca al final del turno si el conversation
  state cruzó el threshold de handoff (heurística simple: payload tiene
  email válido).
- `app/api/contact/route.ts` también invoca (en paralelo al email
  existente, no en reemplazo — fail-safe).
- Custom properties NO se crean todavía — todo va en `lifecyclestage`
  + body de la Note.

**Output:** cada lead aparece en HubSpot Contacts con un Note con el
brief / transcript.

### Phase 2 — Custom properties + routing (1 día)
- Crear `shifty_intent`, `shifty_source`, `shifty_first_msg` via API
  (script one-shot).
- Mapear `country` → HubSpot Owner ID (uno por hub). Tabla en
  `lib/hubspot/owners.ts`.
- Set `hs_lead_status = "OPEN"` y asignar Owner al crear.

**Output:** sales recibe leads ya enrutados al hub correcto, con
contexto en las custom properties para filtrar/segmentar.

### Phase 3 — Workflows (lo configura Ops, no dev)
- En HubSpot UI, crear workflow: "Contact created with `shifty_source
  = website-chat`" → manda Slack a `#sales-latam` + email a Owner +
  task con due date +24h.
- Workflow #2: "Contact `shifty_intent = precio` AND no respondió en
  6h" → alerta a Ops.

**Output:** zero leads se pierden, response time medible.

### Phase 4 — Conversations API (opcional, P3)
HubSpot tiene un Conversations API que permite postear el chat
completo como historial visible en el Contact timeline. Es bonito pero
con la Note del Phase 1-2 ya tenés el contexto. Solo lo activamos si
el equipo lo pide.

---

## Cost / limits

| | |
|---|---|
| **API rate limit (HubSpot)** | 100 req/10s por private app — sobrado para nuestro tráfico |
| **Costo** | $0 — sale del plan de HubSpot que ya tenés |
| **Latencia que añade a Shifty** | <300ms (fire-and-forget desde el server side, no bloquea al usuario) |
| **Failure mode** | Si HubSpot falla, log el lead localmente + email backup. **Nunca perder un lead.** |

---

## Lo que necesito de vos para arrancar

- [ ] Acceso al portal HubSpot (o que crees vos la Private App con los
      scopes listados arriba).
- [ ] `HUBSPOT_TOKEN` y `HUBSPOT_PORTAL_ID` cargados en Vercel env vars.
- [ ] Lista de Owner IDs por hub regional (uno por país) — los tenés
      en HubSpot Settings → Users.
- [ ] Confirmación de que sales puede absorber los leads que vengan
      por este canal (no queremos crear el firehose y dejarlo solo).
- [ ] Decisión sobre el Phase 4 (transcript completo en HubSpot
      timeline) — yes/no.

Con eso arranco Phase 1 en una sesión.

---

## Alternativa más rápida (si querés probar HOY)

Si el equipo de marketing ya tiene un **HubSpot Form** público
configurado, lo más rápido es:

1. Tomar el `portalId` + `formGuid` del form.
2. `POST` a `https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}`
   con el payload del lead.

Cero token, cero scopes, cero private app. Limitado a los fields del
form, pero queda funcional en ~30 min de dev. Útil como bridge
mientras se monta la integración completa.

---

## Failure modes / cosas a anticipar

1. **Lead duplicado** — HubSpot dedupe por email automáticamente con
   el endpoint correcto. Usamos `crm/v3/objects/contacts` con `idProperty=email`.

2. **Email inválido o falso** — validar formato antes de POST. Si
   falla, guardar en log local + alertar (no crear contacto basura).

3. **HubSpot caído** — `try/catch` + log + email backup al hub
   regional. Reintento async opcional (queue).

4. **GDPR / consentimiento** — Shifty no necesita opt-in explícito
   porque el usuario INICIA la conversación. Pero el form de contacto
   sí debería tener checkbox de consent → property `hs_consent_to_communicate`.

5. **Propiedades custom no existen** — el primer deploy del Phase 2
   crea las propiedades. Idempotente: re-correr el script no rompe nada.
