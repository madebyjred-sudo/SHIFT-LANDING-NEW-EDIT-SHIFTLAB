# Escucha gratis · plan de indexación, acceso y pauta

Rama `shiftlab/escucha-gratis`. Nada de esto está en producción.

## 1. Indexación: lo que ya quedó hecho

Que el formulario sea dinámico no estorba si el HTML trae el contenido. Eso es lo que hace esta rama:

- **Las landings completas van en el HTML del servidor.** Antes de lanzar la escucha, el resto de la página va plegado (altura 0, `inert`, `data-escucha="espera"`) y se despliega al terminar. Google indexa con peso completo el contenido plegado por UX (pestañas y acordeones, desde el índice móvil). El contenido que solo existe después de un clic no se indexa. Comprobado con curl: las 3 rutas traen las preguntas frecuentes y todas las secciones.
- **JSON-LD de herramienta** (`lib/escucha/seo.ts`), con estos nodos:
  - `WebPage`;
  - `WebApplication` (gratis, `BusinessApplication`, `featureList`);
  - `UseAction` con plantilla `?marca={marca}&pais={pais}`;
  - `FAQPage`, a partir de `lib/escucha/faq.ts` (las mismas preguntas que se ven en la página);
  - `BreadcrumbList` Shift LAB > herramienta.
- **sitemap.xml**: las 3 rutas.
- **llms.txt**: sección «Herramientas gratis (para personas y para agentes)», con enlaces profundos que corren solos. Un asistente de IA que lea el sitio puede mandar a su usuario directo al resultado.
- **Canonical** a la ruta limpia: `?marca=` no genera duplicados.

## 2. Indexación: lo que falta (en orden de impacto)

1. **Una URL por intención, no una por herramienta.** Hoy hay 3 páginas, y cada una puede rankear para su familia de búsqueda:
   - **Eco**: «qué dice ChatGPT de mi marca», «visibilidad en IA», «GEO».
   - **Sentinel**: «escucha social gratis», «monitoreo de marca», «menciones en redes».
   - **Integral**: «reputación digital gratis».

   No hay que fusionarlas: una sola landing diluye las tres intenciones.
2. **Blog por herramienta, como clúster.** Usar el newsroom que ya existe (Directus) con dos colecciones: «IA y marcas» (Eco) y «Conversación y reputación» (Sentinel). Cada artículo enlaza a su herramienta y la herramienta enlaza a sus 3-5 artículos. Es el patrón de HubSpot con Website Grader: la herramienta convierte y el contenido trae el tráfico.
3. **Páginas por país** (`/shift-lab/escucha-digital/costa-rica`, etc.), con sus medios, su pico de conversación agregado y su FAQ local. Solo valen si cada una trae datos propios del país; si son plantillas iguales, Google las trata como contenido delgado.
4. **Resultados públicos: NO indexarlos.** El reporte de una marca vive en el navegador (localStorage), no en una URL. Así debe seguir, por privacidad, salvo que más adelante se publique un «índice de marcas» con permiso.

## 3. Pestaña Shift LAB y acceso

Hoy «Shift LAB» lleva a `/shift-lab`, y la escucha aparece como sección `#escucha-gratis` más abajo. Propuesta (sin construir):

- **Escritorio:** la pestaña Shift LAB abre un panel inline (nada de pop-ups) con dos columnas:
  - Herramientas gratis: Escucha integral, Eco · IA, Sentinel · redes y medios;
  - Plataformas: Eco, Sentinel, Pulse.

  El clic en «Shift LAB» sigue llevando a `/shift-lab`.
- **Móvil:** dentro de «Más», debajo de Shift LAB, los tres enlaces con sangría.
- En `/shift-lab`, la sección de escucha va en el segundo pantallazo, no al fondo.

## 4. Pauta

- Cada anuncio cae en su landing específica, nunca en `/shift-lab`.
- **UTM obligatorios.** El lead ya viaja a HubSpot por `/api/contact`; falta guardar `utm_source/medium/campaign` en el campo `idea` o en propiedades propias.
- **Enlace profundo por campaña:** `?pais=co` fija el país (y sus medios) desde el anuncio. `?marca=` solo sirve en correos o mensajes uno a uno, nunca en anuncios abiertos.
- **Retargeting:** quien lanzó la escucha y no pidió la demo es la audiencia más caliente. Para medirla falta el evento `escucha_lanzada` / `demo_pedida` en el píxel o GA.

## 5. Agentes de IA (propuesta, sin construir)

- Ya está: `llms.txt` con enlaces profundos.
- Lo siguiente es un endpoint para agentes con llave por socio, sin captcha, con tope diario y solo resultados en caché o agregados. El captcha es para navegadores; un agente se autentica con llave.
- Formato: MCP con dos herramientas (`escuchar_ia`, `escuchar_conversacion`) en el gateway que ya sirve el MCP de medios. La respuesta va en el idioma del agente; los datos son los mismos.

## 6. Pendientes técnicos

- **Turnstile:** el código está listo y abierto mientras no haya llaves. Falta crear el widget para `shiftlatam.agency` y cargar `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET`.
- **Equipo de Shift corriendo varias veces al día:**
  - La misma marca no gasta: hay caché de 24 h en el navegador y en el servidor.
  - Marcas distintas desde la misma IP chocan con el tope por IP de Eco (`/api/dossier/shot` devuelve 429 = «ya hiciste tu escucha de hoy»). Arreglarlo requiere una lista de IPs o una llave de equipo en Eco prod, y eso necesita OK.
- La burbuja «Hablemos.» de Shifty tapaba el formulario en móvil. En estas 3 rutas se oculta en pantallas de menos de 640 px; el botón sigue.
