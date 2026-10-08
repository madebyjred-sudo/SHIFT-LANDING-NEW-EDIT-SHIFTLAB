# Lecturas recomendadas — canon de marca / creatividad / estrategia
_Curado por Jred · verificado contra la biblioteca de los agentes el 2026-07-03_

> **Realidad de la biblioteca:** los agentes leen de **Project Gutenberg** (`librarian.py` → gutendex), que es **dominio público** (obras pre-~1929). Verificado uno por uno: **0 de los 93 títulos modernos de abajo están disponibles ahí** — son obras con copyright (1981–2026). Para que un agente lea uno de esos hay que **aprovisionar el texto**: dejar el `.txt` en `avatars/<agente>/library/` y `agent-read.sh` lo toma solo (lee por pasajes, cosecha citas, y al terminar escribe su síntesis).
>
> Mientras tanto, la **sección A** son clásicos de dominio público —los ancestros de este canon— que SÍ pueden leer hoy mismo.

---

## A. Léibles YA (Project Gutenberg · dominio público) — los ancestros del canon
> **✅ SEMBRADOS el 2026-07-03** en las bibliotecas — `agent-read` los va leyendo solo. Shifter: Crystallizing Public Opinion, Public Opinion, The Crowd, Art of Controversy (+ Propaganda ya leído). Luna: Poetics, Philosophy of Composition, Art of Public Speaking.

| Clásico | Autor | Búsqueda para `librarian.py` | Alimenta |
|---|---|---|---|
| Propaganda | Bernays | `Propaganda Bernays` | RRPP / persuasión _(Shifter ya lo leyó)_ |
| Crystallizing Public Opinion | Bernays | `Crystallizing Public Opinion` | RRPP — el libro que fundó las relaciones públicas |
| Public Opinion | Lippmann | `Public Opinion Lippmann` | RRPP / opinión pública / encuadre |
| The Crowd: A Study of the Popular Mind | Le Bon | `The Crowd Le Bon` | Psicología del consumidor / masas |
| The Poetics | Aristóteles | `Poetics Aristotle` | Storytelling / estructura dramática |
| The Philosophy of Composition | Poe | `Philosophy of Composition Poe` | Creatividad / oficio de escribir |
| The Art of Controversy | Schopenhauer | `Art of Controversy Schopenhauer` | Retórica / persuasión / debate |
| The Art of Public Speaking | Esenwein | `Art of Public Speaking` | Comunicación / persuasión |
| The Principles of Psychology | William James | `Principles of Psychology James` | Psicología (base) — denso/largo |

_Reparto sugerido:_ **Shifter** (publicista/PR) → Crystallizing, Public Opinion, The Crowd, Art of Controversy. **Luna** (voz/creatividad) → Poetics, Philosophy of Composition, Art of Public Speaking.

---

## B. Canon curado moderno — pendiente de aprovisionar texto (NO en dominio público)

### Creatividad
Ogilvy on Advertising · Hey Whipple, Squeeze This · The Copy Book · The Advertising Concept Book · A Technique for Producing Ideas · Creativity, Inc. · Creative Confidence · Creative Acts for Curious People · The Creative Act · Steal Like an Artist · Show Your Work! · Keep Going · Think Like The Minimalist · The Artist's Way · Creativity: A Short and Cheerful Guide

### Planning estratégico
Good Strategy Bad Strategy · Playing to Win · The Long and the Short of It · How Not to Plan · Alchemy · Eat Your Greens · Creative Strategy · Consumer.ology · No Bullsh*t Strategy · Chaz's 100 Things a Planner Should Know · How Big Things Get Done

### Branding y gestión de marca
Positioning · Building Strong Brands · Aaker on Branding · Brand Leadership · The New Strategic Brand Management · Strategic Brand Management · Branding That Means Business · How Brands Grow · How Brands Grow Part 2 · Building Distinctive Brand Assets · Better Brand Health · Designing Brand Identity · Universal Principles of Branding · Identity Designed · Brand Atlas · Brand New · On Brand · How Brands Become Icons · The Brand Gap · Zag · The Brand Flip · The Brand Vortex · The Sage Handbook of Brand Management

### Marketing moderno
Quantum Marketing · Marketing 7.0 · Marketing 6.0 · This Is Marketing · Marketing Made Simple · Building a StoryBrand · Epic Content Marketing · They Ask, You Answer · Obviously Awesome · Obviously Awesome GTM

### Relaciones públicas y reputación
The New Rules of Marketing and PR · Spin Sucks · Trust Me, I'm Lying · Strategic Planning for Public Relations · Public Relations Planning · Introduction to Public Relations · The Rules of Public Relations · Cases in Public Relations Management · The Practice of Public Relations · Corporate Reputation · The Reputation Game · The Cluetrain Manifesto · Absolute Essentials of Public Relations · Strategic CEO Communication

### Storytelling
Building a StoryBrand · Made to Stick · Storyworthy · The Hero and the Outlaw · Writing for Busy Readers · Everybody Writes · Very Good Copy

### Psicología del consumidor
Thinking, Fast and Slow · Influence · Pre-Suasion · Nudge · Predictably Irrational · Misbehaving · Contagious · The Catalyst

### Innovación
Blue Ocean Strategy · The Innovator's Dilemma · Sprint · The Lean Startup · Inspired

### IA para marketing y creatividad (2024–2026)
The AI Marketing Canvas

---
_Cómo aprovisionar un moderno:_ dejar `Título.txt` (texto plano, sin DRM) en `avatars/<agente>/library/`. `agent-read.sh` lo detecta (`open_next`), lo lee por pasajes y lo cosecha como cualquier otro. No hace falta que quepa en la ventana: para eso se construyó la lectura por pasajes + la repisa.
