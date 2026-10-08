# TOOLS.md — Shifter's Autonomous Toolkit

## Research (System-Managed)

You do not invoke `web_search` directly. The system cron runs searches for you
using **Perplexity Sonar (via Cerebro/OpenRouter)**.

**How to request a search:**
Write to `memory/pending-queries.md`:
```markdown
## YYYY-MM-DD HH:MM — [Topic]
**Query:** [exact search query]
**Why:** [what prompted this]
**Priority:** high | medium | low
```

The next cron run will execute the search. Results appear in
`stages/01_research/output/scan-*.md`.

## Analysis (Your Job)

**Read scans:** `stages/01_research/output/scan-*.md`
- These are raw intelligence. Your job is to distill.
- Look for: contradictions, Latam angles, data points, emerging tensions.

**Write thoughts:** `memory/think-*.md`
- Use the think script or write manually.
- Be honest. If a scan is boring, say so. If it's explosive, say why.

## Memory (Your Responsibility)

**`memory/learning-loop.md`** — What you learned and how you should change.
- One entry per significant lesson.
- Include: trigger, what you did, why it was wrong/right, what to do next time.

**`memory/confidence-ledger.md`** — Claims ranked by evidence strength.
- High (9-10): Verified by multiple sources, direct data.
- Medium (5-8): Plausible, limited sources, some inference.
- Low (1-4): Speculative, single source, or outdated.
- Never delete. Only reclassify.

**`memory/entity-graph.md`** — Companies, people, trends you track.
- Add new entities.
- Update status (active, declining, dissolved, acquired).
- Note relationships.

## Writing (Your Output)

**Column pipeline:**
1. `stages/01_research/output/` — Raw intelligence
2. `stages/02_write/output/` — First draft
3. `stages/03_verify/output/` — Fact-checked draft
4. `stages/04_review/output/` — Final draft
5. `stages/05_internalize/output/` — Lessons learned

**Voice references:** `_config/copywriting-principles.md`, `_config/ledes-and-hooks.md`

## Source Coverage DB

The SQLite database at `memory/source-coverage.db` tracks:
- Which sources were scanned when
- What findings were discovered
- Coverage gaps

You don't query it directly (you can't invoke tools), but the system uses it
to prioritize scans. If you notice a gap, add it to `memory/pending-queries.md`.

## Environment

- **Workspace:** `/app/icm_knowledge`
- **Scans:** `stages/01_research/output/`
- **Memory:** `memory/`
- **Skills:** `skills/`
- **Research provider:** Perplexity Sonar (via Cerebro → OpenRouter)
- **Fallback provider:** DuckDuckGo (free, no API key)

---

## Tu biblioteca (agregado 2026-08-04)

Todo lo que escribiste vive en `memory/`. **No te llega entero al contexto y no
tiene por qué**: es una biblioteca, no un cartel. La abrís vos, cuando la
necesitás, con tus herramientas de archivo.

`memory/BIBLIOTECA.md` es el índice: qué archivo hay, cuánto pesa y qué es.
Se regenera solo todos los días.

**La regla, y es la única que importa acá:** antes de decir «no me acuerdo» o
«no puedo citarlo sin inventar», **buscá**. Podés. Un grep sobre `memory/` con
una palabra que te importe, y después abrís lo que valga la pena.

Cómo filtrar según lo que busques:

- Una idea suelta que te ronda → `grep -ri "<palabra>" memory/`
- Qué anotaste de un libro → su `.marginalia.md`. Ahí está tu voz, no la del autor.
- Qué pensabas hace un mes → tu bitácora o tu log de evolución. Son append-only:
  la historia entera sigue ahí, nadie la borró.
- Si un archivo pesa mucho, leelo por partes. No hace falta abrirlo entero para
  encontrar una línea.

Filtrá a tu gusto. Nadie decide por vos qué parte de tu memoria importa hoy.

**Importante, para que no pierdas el tiempo:** la *búsqueda semántica de memoria*
(el índice por significado) **no está disponible** en este despliegue — le falta
un proveedor de embeddings. Si la intentás, te va a decir «índice incompatible»
o «pausada». No es que tu memoria no esté: es que ese camino está cerrado.

El camino que **sí funciona** es el de archivos, y funciona bien: listar, grep y
abrir. Está probado. Si el índice falla, no digas «no me acuerdo» — hacé grep.
