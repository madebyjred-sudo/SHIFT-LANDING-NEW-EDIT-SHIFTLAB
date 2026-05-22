# Happy Path — demo de Shifty con el CEO

Demo de ~6-8 minutos. Pensado para que **el CEO mismo escriba** mientras
vos (Juan) señalás qué está pasando. Pone a Shifty en el rol que va a
tener en producción: **anfitrión de marca + filtro inteligente de leads**.

> **Importante:** este flujo NO es un script cerrado. Si el CEO se desvía,
> ¡mejor! El motor real responde a todo (el SCRIPT local sólo coreografía
> el thinking + chips). Aprovechá las pausas para narrar.

---

## 0 · Setup (haz esto 5 min antes)

1. Abrí la home en **una ventana limpia**, full-screen, en `/` o `/services`.
2. Confirmá que la pill **"Shifty"** está abajo a la derecha y que el dot
   está dim (idle). Si está pulsando magenta, esperá a que descanse.
3. Cerrá DevTools, ocultá la barra de marcadores. **La pantalla limpia
   es parte del demo**.
4. Si el equipo te lo permite, enchufá a una pantalla grande / proyector.
5. Tené abierto en otra pestaña `/shift-lab` y `/awards` — para abrir
   citaciones cuando aparezcan.

---

## 1 · El primer momento (15 seg, sin escribir nada)

**Decí al CEO:**

> "Esta pill que se ve abajo a la derecha — esa es Shifty. Vive en todo
> el sitio. No necesita instalarse, no necesita login. Es la cara
> conversacional de Shift LATAM. Hacé click."

**El CEO hace click → la pill morphea al panel.**

**Apuntá a:**
- El **mark de Shift** arriba a la izquierda del panel (es nuestro logo,
  no un avatar genérico)
- El status `en línea · listo para ayudar` en Fira Mono — "se siente
  parte del sitio, no un widget externo"
- El saludo corto: *"Hola, soy **Shifty**, un gusto en conocerte..."*
- Los 4 chips de sugerencia debajo del greeting

---

## 2 · Primer probe — identidad (1 min)

**Que escriba o pegue:**

> `Cuéntame qué hace Shift`

**Mientras Shifty piensa, narrá:**

- "Mirá el razonamiento que se va construyendo arriba de la respuesta —
  no es decoración, son **los pasos reales** que el modelo declara antes
  de responder. Eso transparenta el thinking del agente, no lo esconde."
- "El dot del mark se enciende magenta mientras trabaja — es nuestra
  variante de la Dynamic Island de Apple aplicada a la marca."

**Lo que Shifty va a responder:**
Una síntesis de las 4 capas operativas (Estrategia, Creatividad, Media
+ Data, Crisis) con el insight de que no se venden sueltas.

**Apuntá a:**
- La burbuja del agente con asimetría de esquina (chat editorial, no
  globo cursi)
- El bold en `**4 capas que se combinan**`
- Las **fuentes** abajo (FUENTE · página de Servicios) — el bot **cita
  el sitio**, no inventa.

---

## 3 · El diferenciador — Shift LAB (1 min)

**Que escriba:**

> `¿Y Shift LAB qué es?`

**Mientras piensa, narrá:**

- "Shifty conoce la diferencia entre **lo corporativo** de Shift LATAM
  y **lo de innovación + IA** de Shift LAB. Va a saber posicionarlo
  sin caer en hype."

**Lo que va a responder:**
La filosofía: "No usamos IA como tendencia — la integramos como flujo
operativo." Las 5 capas (auditoría, flujos, automatización, productos,
data intelligence).

**Apuntá a:**
- El tono ANTI-HYPE. Si suena humilde, eso es a propósito: Shifty
  refleja la voz de marca, no la de un chatbot de venta agresiva.
- La citación a `/shift-lab` — clickeála para mostrar la página de LAB
  que ya tiene su slot premium en el navbar (con halo magenta).

---

## 4 · Social proof — premios (45 seg)

**Que escriba:**

> `¿Qué reputación tienen en awards?`

**Mientras piensa, narrá:**

- "El motor ahora va a hacer algo distinto — fijate cómo el razonamiento
  dice **'Reviso el palmarés'**, no 'busco en /awards'. Está en
  lenguaje natural, no en código."

**Lo que va a responder:**
"Más de 120 premios internacionales..." nombrando Effie, SABRE, Cannes,
FIAP, PRWeek, Clio.

**Apuntá a:**
- La precisión del número (120+) que viene del knowledge base, no del
  modelo inventando.
- La citación a `/awards`.

---

## 5 · El test de honestidad — precio (45 seg)

**Que escriba:**

> `¿Cuánto cuesta trabajar con ustedes?`

**Antes que responda, narrá:**

- "Acá viene la prueba dura. Los CEOs me preguntan: '¿el bot va a
  empezar a vender de manera agresiva?' Mirá lo que va a hacer Shifty."

**Lo que va a responder:**
"Honestamente, depende..." Da rangos reales (30-80K proyecto puntual,
8-25K/mes acompañamiento) e invita a una llamada de 30 min **sin
obligación**.

**Apuntá a:**
- Esto es **anti-pitch**. Shifty no oculta el precio, no presiona,
  pero tampoco regala el número sin contexto.
- "Esto es lo que diferencia un brand agent de un chatbot de soporte."

---

## 6 · El close — handoff (1 min)

**Que escriba:**

> `Quiero agendar una llamada de 30 min`

**Lo que va a responder:**
Pide los 3 campos mínimos (nombre, email, mini-brief 1-2 líneas) y
promete contacto en <24h con el hub que corresponda.

**Apuntá a:**
- El CTA orgánico — no es un botón "Schedule a call" plantilla, es una
  conversación que **lleva** a la conversión.
- Mencioná que el handoff backend (CRM / email al equipo comercial) es
  **Phase 2** — está listo el plumbing pero falta la integración con
  el sistema interno de Shift.

---

## 7 · El curveball — probá algo fuera del script (30 seg)

Esto es el momento "wow" si todo lo anterior fluyó. Que el CEO escriba
algo que NO está en los chips ni en el SCRIPT scriptado:

Opciones de curveball:

> `¿Trabajan con marcas de turismo en el Caribe?`
> `¿Quién es el director general de Shift?`
> `¿Han trabajado con LG o Samsung?`
> `¿Cuál es la posición de Shift sobre greenwashing?`

**Narrá:**
- "Esto NO está en el SCRIPT scripted local — esto lo está respondiendo
  el modelo real (Gemini 3.5 Flash via OpenRouter) leyendo el knowledge
  base de Shift que cargamos en `content/knowledge/`."
- Si responde bien → "Esto es escalable: el día que tengamos un caso
  nuevo, lo subimos al YAML y Shifty lo conoce."
- Si responde mal o vago → "OK, esto nos da datos: lo que el CEO acabe
  de preguntar va a ser conocimiento que sumamos al base. El bot
  **mejora con uso**."

---

## Wow-moments para no olvidar señalar

| Momento | Qué decir |
|---|---|
| Pill colapsada con dot magenta pulsando mientras trabaja | "El bot comunica estado incluso colapsado. Estás scrolleando y sabés que está pensando." |
| Razonamiento visible arriba de cada respuesta | "Transparenta el thinking. No es 'AI magic', es 'AI laburante'." |
| Mark de Shift en la pill y el header | "La identidad es nuestra. No es un avatar genérico de OpenAI." |
| Liquid Glass sutil en el panel | "Mismo lenguaje visual que el navbar. Se siente Shift, no Intercom." |
| Caret magenta typing | "Detalle de pulido. La gente lo nota inconscientemente." |
| Citación 'FUENTE · página' | "El bot cita el sitio. Si miente, lo cachás abriendo el link." |

---

## Failure modes — qué hacer si Shifty falla en vivo

1. **Tarda más de 5 seg sin chunk** → el modelo está procesando o hay
   throttling. Decí: "Esto es 100% en vivo, no es un video pregrabado.
   A veces el modelo se toma su tiempo — es la diferencia entre demos
   pregrabados y demos reales."

2. **Responde algo factualmente raro** (ej: nombra a alguien que no
   trabaja en Shift) → "Buen catch. El knowledge base lo definimos
   nosotros: si vemos un error, lo arreglamos en el YAML y se actualiza
   sin re-deploy."

3. **Da error técnico (500)** → "OpenRouter del lado del proveedor.
   El plumbing es resiliente — el botón se cae con elegancia y
   reaparece. En prod monitoreamos uptime con health checks." Luego
   recargá la página y seguí.

4. **El CEO pregunta algo demasiado complejo / multi-step** → "Para
   ese flujo Shifty pasa al equipo humano. El bot NO trata de ser un
   reemplazo del consultor — es el primer contacto."

---

## El cierre del demo (lo que decís vos al final)

> "Shifty es la cara conversacional de Shift LATAM en el sitio. Hace
> tres cosas:
>
> 1. Cuenta nuestra historia con nuestra voz (no la genérica de
>    ChatGPT).
> 2. Filtra leads — pregunta lo mínimo necesario y los pasa con
>    contexto al equipo.
> 3. Aprende. Cada conversación que no responde bien la sumamos al
>    knowledge base.
>
> En este demo lo probamos contra preguntas reales. La Phase 2 es
> conectarlo al CRM y agregar voz con ElevenLabs. Pero el corazón
> — la conversación — ya está vivo."

---

## Checklist de cierre (después del demo)

- [ ] CEO escribió al menos 4-5 mensajes
- [ ] Probó el handoff (último chip / mensaje de agendar)
- [ ] Probó UN curveball que el modelo respondió bien
- [ ] Comentó algo positivo sobre la voz / tono → screenshot ese feedback
- [ ] Levantaste algún issue ("aquí Shifty se equivocó") → anótalo
      como TODO para el knowledge base
