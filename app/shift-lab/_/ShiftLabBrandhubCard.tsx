"use client";

import { useEffect, useRef } from "react";

/**
 * Brandhub — guiño CTA dentro de Shift Lab, hermano del card de Eco.
 * A diferencia del resto de la landing, usa el SISTEMA VISUAL de la app
 * Brandhub (navy profundo, glass con trazo azul, azul royal + magenta,
 * la marca de círculos): se siente el salto a la plataforma. Autocontenido,
 * todo prefijado .bh-cta para no chocar con el sitio anfitrión.
 *
 * ENFOQUE: el cliente CREA su propio brandhub y lo anuncia como comunicación
 * interna. El panel derecho es una mini-captura fiel de la app (ventana de
 * navegador + sidebar + assets de una marca ficticia "Acme" en paleta coral/
 * ámbar, distinta a la de Shift) para que alguien que no sabe nada entienda
 * al instante "es un portal privado donde vive la marca de una empresa".
 *
 * NOTA: el CTA queda como botón sin destino todavía (aún no hay dosier).
 */
const CARD_HTML = `<style>
  .bh-cta, .bh-cta * { box-sizing: border-box; }
  .bh-cta {
    --bh-bg: #0a0e27;
    --bh-bg-2: #121b4a;
    --bh-bg-3: #19235c;
    --bh-outline: #26356e;
    --bh-ink: #edf0fe;
    --bh-ink-2: #aeb6d9;
    --bh-ink-3: #8a93bf;
    --bh-blue: #1534dc;
    --bh-blue-2: #3c55d8;
    --bh-magenta: #f540ff;
    --bh-amethyst: #9244d8;
    --bh-display: 'Figtree', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
    --bh-body: 'Fira Sans', ui-sans-serif, system-ui, -apple-system, sans-serif;

    position: relative;
    width: 100%; max-width: 100%;
    background:
      radial-gradient(120% 90% at -10% -20%, rgba(21,52,220,0.28), transparent 55%),
      radial-gradient(120% 90% at 115% 120%, rgba(245,64,255,0.18), transparent 55%),
      var(--bh-bg);
    border: 1px solid var(--bh-outline);
    border-radius: 26px;
    box-shadow:
      0 1px 0 rgba(255,255,255,0.06) inset,
      0 40px 90px -50px rgba(3,6,23,0.9),
      0 14px 40px -22px rgba(21,52,220,0.5);
    overflow: hidden;
    color: var(--bh-ink);
    font-family: var(--bh-body);
    height: 100%;
    display: flex; flex-direction: column;
    transition: transform 0.4s cubic-bezier(0.2,0.7,0.2,1), box-shadow 0.4s ease;
  }
  .bh-cta:hover { transform: translateY(-3px); box-shadow: 0 1px 0 rgba(255,255,255,0.08) inset, 0 48px 100px -50px rgba(3,6,23,0.95), 0 18px 46px -22px rgba(21,52,220,0.6); }

  /* header meta */
  .bh-cta__meta { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 24px 0; }
  .bh-cta__tag { font-family:var(--bh-display); font-size:11px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--bh-magenta); }
  .bh-cta__meta-r { font-family:ui-monospace, 'Fira Mono', monospace; font-size:11px; color:var(--bh-ink-3); letter-spacing:.02em; }

  .bh-cta__grid { flex:1; display:grid; grid-template-columns: 1.05fr .95fr; gap:26px; padding:22px 24px 26px; align-items:stretch; }
  @media (max-width: 760px){ .bh-cta__grid { grid-template-columns:1fr; gap:24px; } }

  /* left: pitch */
  /* marca de agua: el icono de Brandhub (tres círculos) en grande, muy tenue (~6%) */
  .bh-cta__wm { position:absolute; top:-170px; right:-150px; width:600px; height:600px; opacity:.035; pointer-events:none; z-index:0; }
  .bh-cta__wm circle { fill:none; stroke:#c9d3ff; stroke-width:3.2; }
  .bh-cta__meta, .bh-cta__grid { position:relative; z-index:1; }

  .bh-cta__pitch { position:relative; padding-right:2px; min-width:0; display:flex; flex-direction:column; }
  .bh-cta__brand, .bh-cta__hook, .bh-cta__desc, .bh-cta__checks, .bh-cta__cta-row, .bh-cta__family { position:relative; z-index:1; }

  .bh-cta__brand { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
  .bh-cta__mark { width:40px; height:40px; flex:none; filter: drop-shadow(0 2px 10px rgba(111,139,255,.35)); }
  .bh-cta__mark circle { fill:none; stroke-width:6.5; }
  .bh-cta__mark .m-a { stroke:#c9d3ff; opacity:.9; }
  .bh-cta__mark .m-b { stroke:#8ea3ff; opacity:.9; }
  .bh-cta__mark .m-c { stroke:#6f8bff; }
  /* logo adaptado a fondo oscuro: "Brand" casi-blanco, "hub" magenta */
  .bh-cta__word { font-family:var(--bh-display); font-weight:800; font-size:26px; letter-spacing:-.5px; line-height:1; }
  .bh-cta__word b { color:var(--bh-ink); font-weight:800; }
  .bh-cta__word span { color:var(--bh-magenta); font-weight:600; }

  .bh-cta__hook { font-family:var(--bh-display); font-weight:800; font-size:clamp(23px,2.5vw,31px); line-height:1.08; letter-spacing:-.6px; margin:0 0 13px; color:var(--bh-ink); }
  .bh-cta__hook b { color:var(--bh-magenta); }
  .bh-cta__desc { font-size:14.5px; line-height:1.55; color:var(--bh-ink-2); margin:0 0 18px; max-width:40ch; }
  .bh-cta__desc b { color:var(--bh-ink); font-weight:600; }

  .bh-cta__checks { list-style:none; margin:0 0 22px; padding:0; display:flex; flex-direction:column; gap:10px; }
  .bh-cta__checks li { display:flex; align-items:flex-start; gap:10px; font-size:13px; line-height:1.4; color:var(--bh-ink-2); }
  .bh-cta__checks li b { color:var(--bh-ink); font-weight:600; }
  .bh-cta__checks-ic { flex:none; width:18px; height:18px; margin-top:1px; border-radius:50%; display:grid; place-items:center; background:rgba(111,139,255,.16); color:#9db0ff; }
  .bh-cta__checks-ic svg { width:11px; height:11px; }
  .bh-cta__checks li.is-ai .bh-cta__checks-ic { background:rgba(245,64,255,.16); color:#f9a6ff; }

  .bh-cta__cta-row { margin-top:auto; }
  .bh-cta__btn { display:inline-flex; align-items:center; gap:9px; font-family:var(--bh-display); font-weight:700; font-size:14.5px; color:#fff; background:linear-gradient(90deg,var(--bh-blue),var(--bh-blue-2)); border:none; border-radius:14px; padding:13px 22px; cursor:pointer; text-decoration:none; box-shadow:0 10px 26px -12px rgba(21,52,220,.8); transition:transform .18s ease, box-shadow .18s ease, filter .18s ease; }
  .bh-cta__btn:hover { transform:translateY(-1px); filter:brightness(1.06); box-shadow:0 14px 32px -12px rgba(245,64,255,.5), 0 10px 26px -12px rgba(21,52,220,.9); }
  .bh-cta__btn-arrow { transition:transform .2s ease; }
  .bh-cta__btn:hover .bh-cta__btn-arrow { transform:translateX(3px); }

  .bh-cta__family { display:flex; align-items:center; gap:10px; margin-top:20px; }
  .bh-cta__fdots { display:inline-flex; gap:5px; }
  .bh-cta__fdots i { width:7px; height:7px; border-radius:50%; background:var(--bh-outline); display:block; }
  .bh-cta__fdots i.is-on { background:var(--bh-magenta); box-shadow:0 0 8px var(--bh-magenta); }
  .bh-cta__family-label { font-size:12px; color:var(--bh-ink-3); }

  /* right: mini-captura del portal real (ventana de navegador) */
  .bh-cta__app { display:block; padding:0; background:none; border:0; box-shadow:none; overflow:visible; align-self:center; width:100%; }
  .bh-cta__win { width:100%; border-radius:15px; overflow:hidden; background:linear-gradient(180deg,var(--bh-bg-2),var(--bh-bg)); border:1px solid var(--bh-outline); box-shadow:0 26px 64px -30px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.06); font-family:var(--bh-body); }

  /* browser chrome */
  .bh-cta__chrome { display:flex; align-items:center; gap:9px; padding:9px 11px; background:rgba(255,255,255,.03); border-bottom:1px solid var(--bh-outline); }
  .bh-cta__wdots { display:flex; gap:5px; flex:none; }
  .bh-cta__wdots i { width:7px; height:7px; border-radius:50%; display:block; }
  .bh-cta__wdots i:nth-child(1){ background:#f76c6c; }
  .bh-cta__wdots i:nth-child(2){ background:#f7b955; }
  .bh-cta__wdots i:nth-child(3){ background:#57c877; }
  .bh-cta__url { flex:1; min-width:0; display:flex; align-items:center; gap:5px; height:21px; padding:0 9px; background:var(--bh-bg); border:1px solid var(--bh-outline); border-radius:999px; color:var(--bh-ink-3); font-size:10.5px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
  .bh-cta__url svg { flex:none; color:#57c877; }
  .bh-cta__url b { color:var(--bh-ink); font-weight:600; }

  /* window body */
  .bh-cta__wbody { display:flex; min-height:250px; }

  /* left sidebar */
  .bh-cta__side { flex:none; width:96px; display:flex; flex-direction:column; gap:11px; padding:11px 7px; background:rgba(0,0,0,.20); border-right:1px solid var(--bh-outline); }
  .bh-cta__brandrow { display:flex; align-items:center; gap:6px; padding:0 3px 2px; }
  .bh-cta__brandmark { width:19px; height:19px; border-radius:6px; flex:none; display:grid; place-items:center; font-family:var(--bh-display); font-weight:800; font-size:11px; color:#2a1206; background:linear-gradient(150deg,#ff8a5b,#ff5a2c); box-shadow:0 2px 9px -2px rgba(255,90,44,.6); }
  .bh-cta__brandname { font-family:var(--bh-display); font-weight:700; font-size:12px; color:var(--bh-ink); }
  .bh-cta__nav { display:flex; flex-direction:column; gap:3px; }
  .bh-cta__nav a { display:flex; align-items:center; gap:6px; padding:5px 6px; border-radius:7px; font-size:10.5px; color:var(--bh-ink-3); white-space:nowrap; }
  .bh-cta__nav a svg { flex:none; opacity:.85; }
  .bh-cta__nav a.is-active { background:linear-gradient(90deg,rgba(60,85,216,.34),rgba(60,85,216,.10)); color:var(--bh-ink); box-shadow:inset 0 0 0 1px rgba(110,139,255,.28); }
  .bh-cta__nav a.is-active svg { opacity:1; color:#9db0ff; }
  .bh-cta__sidebtn { margin-top:auto; display:flex; align-items:center; justify-content:center; gap:6px; padding:7px 8px; border-radius:9px; font-family:var(--bh-display); font-weight:600; font-size:10.5px; color:var(--bh-ink); cursor:default; background:linear-gradient(90deg,rgba(245,64,255,.18),rgba(146,68,216,.16)); border:1px solid rgba(245,64,255,.45); box-shadow:0 0 18px -7px rgba(245,64,255,.7); }
  .bh-cta__sidebtn .spark { width:6px; height:6px; border-radius:50%; flex:none; background:var(--bh-magenta); box-shadow:0 0 9px 1px var(--bh-magenta); }

  /* main area */
  .bh-cta__wmain { flex:1; min-width:0; display:flex; flex-direction:column; gap:10px; padding:11px 12px; }
  .bh-cta__wtop { display:flex; align-items:center; justify-content:space-between; gap:6px; }
  .bh-cta__crumb { font-family:var(--bh-display); font-weight:600; font-size:11.5px; color:var(--bh-ink); }
  .bh-cta__live { display:inline-flex; align-items:center; gap:4px; font-size:9.5px; color:#93e7b3; padding:2px 7px; border-radius:999px; background:rgba(87,200,120,.10); border:1px solid rgba(87,200,120,.30); }
  .bh-cta__live i { width:5px; height:5px; border-radius:50%; background:#57c877; box-shadow:0 0 7px 1px rgba(87,200,120,.85); }

  .bh-cta__assets { display:grid; grid-template-columns:1fr 1fr; gap:9px; }
  .bh-cta__asset { display:flex; flex-direction:column; gap:5px; }
  .bh-cta__preview { height:58px; border-radius:9px; overflow:hidden; border:1px solid var(--bh-outline); display:grid; place-items:center; }
  .bh-cta__preview--logo { background:linear-gradient(180deg,#f8f4ef,#e9e1d4); }
  .bh-cta__preview--palette { background:var(--bh-bg); padding:8px; }
  .bh-cta__preview--type { background:linear-gradient(180deg,#151f52,#0d1330); }
  .bh-cta__preview--tpl { background:#f4efe8; }
  .bh-cta__logolockup { display:flex; align-items:center; gap:5px; }
  .bh-cta__logolockup span { font-family:var(--bh-display); font-weight:800; font-size:13px; letter-spacing:-.02em; color:#20140c; }
  .bh-cta__swatches { display:grid; grid-template-columns:1fr 1fr; gap:5px; width:100%; height:100%; }
  .bh-cta__swatches i { border-radius:5px; display:block; box-shadow:inset 0 0 0 1px rgba(255,255,255,.06); }
  .bh-cta__typo { display:flex; align-items:baseline; gap:4px; }
  .bh-cta__typo b { font-family:var(--bh-display); font-weight:800; font-size:24px; color:#ff8a5b; line-height:1; }
  .bh-cta__typo span { font-family:var(--bh-body); font-size:9.5px; color:var(--bh-ink-3); }
  .bh-cta__tpl { width:40px; height:48px; border-radius:3px; background:#fff; box-shadow:0 3px 8px -3px rgba(0,0,0,.5); overflow:hidden; display:flex; flex-direction:column; }
  .bh-cta__tpl-band { height:18px; background:linear-gradient(120deg,#ff5a2c,#ffb43d); }
  .bh-cta__tpl-lines { padding:5px; display:flex; flex-direction:column; gap:3px; }
  .bh-cta__tpl-lines i { height:3px; border-radius:2px; background:#d9cfc0; display:block; }
  .bh-cta__tpl-lines i:nth-child(1){ width:85%; }
  .bh-cta__tpl-lines i:nth-child(2){ width:60%; }
  .bh-cta__assetcap { display:flex; align-items:center; justify-content:space-between; gap:4px; }
  .bh-cta__assetname { font-size:10px; color:var(--bh-ink-2); }
  .bh-cta__assetmeta { font-size:8.5px; letter-spacing:.04em; color:var(--bh-ink-3); }

  /* barra de veredicto de Shifty, anclada a un asset concreto */
  .bh-cta__shiftybar { display:flex; align-items:center; gap:7px; margin-top:2px; padding:7px 9px; border-radius:9px; background:linear-gradient(90deg,rgba(245,64,255,.12),rgba(146,68,216,.08)); border:1px solid rgba(245,64,255,.30); }
  .bh-cta__shiftybar-ic { flex:none; display:grid; place-items:center; width:18px; height:18px; border-radius:6px; color:#f9a6ff; background:rgba(245,64,255,.16); }
  .bh-cta__shiftybar-tx { flex:1; min-width:0; font-size:10.5px; line-height:1.25; color:var(--bh-ink-2); }
  .bh-cta__shiftybar-tx b { color:var(--bh-ink); font-weight:600; }
  .bh-cta__shiftybar-chk { flex:none; display:grid; place-items:center; width:16px; height:16px; border-radius:50%; color:#0a0e27; background:#57c877; box-shadow:0 0 9px -1px rgba(87,200,120,.8); }

  /* reveal */
  .bh-cta .bh-cta__pitch > *, .bh-cta__app { opacity:0; transform:translateY(10px); }
  .bh-cta.is-drawn .bh-cta__pitch > * { opacity:1; transform:none; transition:opacity .5s ease, transform .5s cubic-bezier(.2,.7,.2,1); }
  .bh-cta.is-drawn .bh-cta__pitch > *:nth-child(2){ transition-delay:.06s } .bh-cta.is-drawn .bh-cta__pitch > *:nth-child(3){ transition-delay:.12s } .bh-cta.is-drawn .bh-cta__pitch > *:nth-child(4){ transition-delay:.18s } .bh-cta.is-drawn .bh-cta__pitch > *:nth-child(5){ transition-delay:.24s } .bh-cta.is-drawn .bh-cta__pitch > *:nth-child(6){ transition-delay:.3s } .bh-cta.is-drawn .bh-cta__pitch > *:nth-child(7){ transition-delay:.36s }
  .bh-cta.is-drawn .bh-cta__app { opacity:1; transform:none; transition:opacity .6s ease .2s, transform .6s cubic-bezier(.2,.7,.2,1) .2s; }
  @media (prefers-reduced-motion: reduce){ .bh-cta .bh-cta__pitch > *, .bh-cta__app { opacity:1 !important; transform:none !important; } }
</style>
<section class="bh-cta" aria-label="Brandhub — creá el portal de marca de tu empresa">
  <svg class="bh-cta__wm" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="38" cy="36" r="26"/>
    <circle cx="62" cy="36" r="26"/>
    <circle cx="46" cy="60" r="30"/>
  </svg>
  <div class="bh-cta__meta">
    <span class="bh-cta__tag">Comunicación interna</span>
    <span class="bh-cta__meta-r">brandhub.shiftlatam.agency</span>
  </div>

  <div class="bh-cta__grid">
    <div class="bh-cta__pitch">
      <div class="bh-cta__brand">
        <svg class="bh-cta__mark" viewBox="0 0 100 100" aria-hidden="true">
          <circle class="m-a" cx="38" cy="36" r="26"/>
          <circle class="m-b" cx="62" cy="36" r="26"/>
          <circle class="m-c" cx="46" cy="60" r="30"/>
        </svg>
        <span class="bh-cta__word"><b>Brand</b><span>hub</span></span>
      </div>

      <h2 class="bh-cta__hook">Creá el brandhub de <b>tu marca</b>.</h2>
      <p class="bh-cta__desc">
        Cuando la marca vive suelta en drives, mails y chats, cada quien agarra una versión
        distinta y la marca se desarma. Brandhub la ordena en <b>una sola fuente viva</b>: la
        versión correcta, igual para todo el equipo y siempre al día.
      </p>

      <ul class="bh-cta__checks">
        <li>
          <span class="bh-cta__checks-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>
          <span><b>Logos, colores, tipografías, guías y plantillas</b>, todo en un lugar</span>
        </li>
        <li>
          <span class="bh-cta__checks-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>
          <span>Descargas listas para el equipo, sin pedirle nada a diseño</span>
        </li>
        <li class="is-ai">
          <span class="bh-cta__checks-ic"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6-5.6-1.9 5.6-1.9z"/></svg></span>
          <span><b>Shifty</b>, la IA que revisa que cada pieza sea on-brand</span>
        </li>
      </ul>

      <div class="bh-cta__cta-row">
        <a class="bh-cta__btn" href="https://brandhub.shiftlatam.agency/dossier" target="_blank" rel="noopener">
          Creá tu brandhub
          <span class="bh-cta__btn-arrow" aria-hidden="true">→</span>
        </a>
      </div>

      <div class="bh-cta__family">
        <span class="bh-cta__fdots" aria-hidden="true"><i></i><i class="is-on"></i><i></i></span>
        <span class="bh-cta__family-label">Brandhub · el portal vivo de tu marca, para todo el equipo</span>
      </div>
    </div>

    <div class="bh-cta__app">
      <div class="bh-cta__win" role="img" aria-label="Vista del portal de marca Brandhub de una empresa ficticia llamada Acme: barra de navegador con la dirección acme.brandhub.app, menú lateral con Inicio, Logos, Plantillas y Guías más el asistente Shifty, y en el área principal el logotipo, la paleta, las tipografías y una plantilla de Acme, marcados como al día.">
        <div class="bh-cta__chrome">
          <div class="bh-cta__wdots" aria-hidden="true"><i></i><i></i><i></i></div>
          <div class="bh-cta__url">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2"/></svg>
            <span><b>acme</b>.brandhub.app</span>
          </div>
        </div>

        <div class="bh-cta__wbody">
          <aside class="bh-cta__side">
            <div class="bh-cta__brandrow">
              <span class="bh-cta__brandmark">A</span>
              <span class="bh-cta__brandname">Acme</span>
            </div>
            <nav class="bh-cta__nav">
              <a class="is-active"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg><span>Inicio</span></a>
              <a><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M4 17l5-5 4 4 3-3 4 4"/><circle cx="8.5" cy="9" r="1.4" fill="currentColor" stroke="none"/></svg><span>Logos</span></a>
              <a><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg><span>Plantillas</span></a>
              <a><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 0 2 2h13"/></svg><span>Guías</span></a>
            </nav>
            <button class="bh-cta__sidebtn" type="button" tabindex="-1"><span class="spark"></span><span>Shifty</span></button>
          </aside>

          <main class="bh-cta__wmain">
            <div class="bh-cta__wtop">
              <span class="bh-cta__crumb">Marca Acme</span>
              <span class="bh-cta__live"><i></i>al día</span>
            </div>

            <div class="bh-cta__assets">
              <div class="bh-cta__asset">
                <div class="bh-cta__preview bh-cta__preview--logo">
                  <div class="bh-cta__logolockup">
                    <svg width="26" height="17" viewBox="0 0 46 30" aria-hidden="true"><circle cx="17" cy="15" r="12" fill="#ff5a2c"/><circle cx="29" cy="15" r="12" fill="#ffb43d" style="mix-blend-mode:multiply"/></svg>
                    <span>acme</span>
                  </div>
                </div>
                <div class="bh-cta__assetcap"><span class="bh-cta__assetname">Logotipo</span><span class="bh-cta__assetmeta">SVG</span></div>
              </div>

              <div class="bh-cta__asset">
                <div class="bh-cta__preview bh-cta__preview--palette">
                  <div class="bh-cta__swatches"><i style="background:#ff5a2c"></i><i style="background:#ffb43d"></i><i style="background:#14213d"></i><i style="background:#16b8a6"></i></div>
                </div>
                <div class="bh-cta__assetcap"><span class="bh-cta__assetname">Paleta</span><span class="bh-cta__assetmeta">HEX</span></div>
              </div>

              <div class="bh-cta__asset">
                <div class="bh-cta__preview bh-cta__preview--type">
                  <div class="bh-cta__typo"><b>Aa</b><span>Grotesk</span></div>
                </div>
                <div class="bh-cta__assetcap"><span class="bh-cta__assetname">Tipografías</span><span class="bh-cta__assetmeta">TTF</span></div>
              </div>

              <div class="bh-cta__asset">
                <div class="bh-cta__preview bh-cta__preview--tpl">
                  <div class="bh-cta__tpl"><div class="bh-cta__tpl-band"></div><div class="bh-cta__tpl-lines"><i></i><i></i></div></div>
                </div>
                <div class="bh-cta__assetcap"><span class="bh-cta__assetname">Plantilla</span><span class="bh-cta__assetmeta">1080²</span></div>
              </div>
            </div>

            <div class="bh-cta__shiftybar">
              <span class="bh-cta__shiftybar-ic"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6-5.6-1.9 5.6-1.9z"/></svg></span>
              <span class="bh-cta__shiftybar-tx">Shifty revisó esta pieza: <b>on-brand</b></span>
              <span class="bh-cta__shiftybar-chk"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></span>
            </div>
          </main>
        </div>
      </div>
    </div>
  </div>
</section>`;

export default function ShiftLabBrandhubCard() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const card = root.querySelector<HTMLElement>(".bh-cta");
    if (!card) return;

    const cleanups: Array<() => void> = [];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      card.classList.add("is-drawn");
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              card.classList.add("is-drawn");
              io.disconnect();
            }
          });
        },
        { threshold: 0.3 },
      );
      io.observe(card);
      const t = window.setTimeout(() => card.classList.add("is-drawn"), 900);
      cleanups.push(() => {
        io.disconnect();
        window.clearTimeout(t);
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return <div ref={ref} style={{ height: "100%" }} dangerouslySetInnerHTML={{ __html: CARD_HTML }} />;
}
