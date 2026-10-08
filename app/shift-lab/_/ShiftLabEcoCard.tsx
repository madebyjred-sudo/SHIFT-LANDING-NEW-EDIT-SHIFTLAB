"use client";

import { useEffect, useRef } from "react";

/**
 * Shift Eco — guiño CTA (tema claro) dentro de Shift Lab.
 * Componente de Eco, con su propio sistema visual, a propósito distinto
 * al de la landing: se siente el salto entre plataformas. Autocontenido
 * (logos incrustados). Listo para volverse un carrusel de apps hermanas.
 */
const CARD_HTML = `<style>
  /* ============================================================
     Guiño de Eco — tarjeta CTA para la landing de Shift Latam.
     Todo prefijado .eco-cta / .eco-stage para no chocar con el
     sitio anfitrión. Tema claro a propósito: el contraste con la
     página oscura ES el mensaje. Lista para volverse carrusel.
     ============================================================ */

  /* ---- La tarjeta (tokens propios → se puede incrustar sola) ---- */
  .eco-cta, .eco-cta * { box-sizing: border-box; }
  .eco-cta {
    --eco-paper: #f6f7fb;
    --eco-paper-2: #edeffb;
    --eco-ink: #0e1745;
    --eco-ink-2: #4a5488;
    --eco-ink-3: #858eb4;
    --eco-electric: #1534dc;
    --eco-electric-2: #3450ff;
    --eco-magenta: #f540ff;
    --eco-rule: #e3e5f1;
    --eco-display: 'Figtree', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
    --eco-body: 'Fira Sans', ui-sans-serif, system-ui, -apple-system, sans-serif;
    --eco-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;

    position: relative;
    width: 100%; max-width: 100%;
    background: var(--eco-paper);
    border: 1px solid var(--eco-rule);
    border-radius: 26px;
    box-shadow:
      0 2px 0 rgba(255, 255, 255, 0.5) inset,
      0 40px 90px -50px rgba(6, 10, 40, 0.85),
      0 12px 34px -20px rgba(6, 10, 40, 0.6);
    overflow: hidden;
    color: var(--eco-ink);
    font-family: var(--eco-body);
    transition: transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1), box-shadow 0.4s ease;
  }
  .eco-cta:hover {
    transform: translateY(-3px);
    box-shadow:
      0 2px 0 rgba(255, 255, 255, 0.5) inset,
      0 52px 110px -50px rgba(6, 10, 40, 0.9),
      0 16px 40px -20px rgba(6, 10, 40, 0.6);
  }

  /* barra de meta superior */
  .eco-cta__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 15px clamp(20px, 3vw, 34px);
    border-bottom: 1px solid var(--eco-rule);
    font-family: var(--eco-mono);
    font-size: 11px;
    letter-spacing: 0.11em;
    text-transform: uppercase;
  }
  .eco-cta__tag { color: var(--eco-electric); font-weight: 600; }
  .eco-cta__meta-r { color: var(--eco-ink-3); text-transform: none; letter-spacing: 0.03em; }

  .eco-cta__grid {
    display: grid;
    grid-template-columns: 1.02fr 0.98fr;
  }

  /* ---- Columna izquierda: el pitch ---- */
  .eco-cta__pitch {
    position: relative;
    overflow: hidden;
    padding: clamp(26px, 3.4vw, 48px);
    display: flex;
    flex-direction: column;
    gap: clamp(14px, 1.6vw, 20px);
  }
  /* radar decorativo — el motivo de "eco" de la marca, en grande, detrás del
     contenido. Recortado por la columna (fina coquetería, no protagonista). */
  .eco-cta__radar {
    position: absolute;
    z-index: 0;
    pointer-events: none;
    /* el centro (el punto) cae en la esquina inferior derecha de la columna;
       de ahí emana un "ping" de sonar continuo, barriendo arriba-izquierda. */
    width: 92%;
    left: 54%;
    bottom: -52%;
    aspect-ratio: 384 / 401.52;
    overflow: visible;
    opacity: 0.12;
  }
  .eco-cta__radar-ring, .eco-cta__radar-dot {
    transform-box: view-box;
    transform-origin: 188.4px 196.89px;
    will-change: transform, opacity;
  }
  .eco-cta__radar-ring {
    fill: none;
    stroke: #f440ff;
    stroke-width: 17;
    stroke-miterlimit: 10;
    opacity: 0;
    animation: eco-radar-ping 4s ease-out infinite;
  }
  .eco-cta__radar-ring:nth-of-type(2) { animation-delay: 1.33s; }
  .eco-cta__radar-ring:nth-of-type(3) { animation-delay: 2.66s; }
  .eco-cta__radar-dot {
    fill: #f440ff;
    animation: eco-radar-dot 2.6s ease-in-out infinite;
  }
  @keyframes eco-radar-ping {
    0% { transform: scale(0.28); opacity: 0; }
    14% { opacity: 0.9; }
    100% { transform: scale(1.4); opacity: 0; }
  }
  @keyframes eco-radar-dot {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.16); }
  }
  .eco-cta__pitch > :not(.eco-cta__radar) { position: relative; z-index: 1; }
  .eco-cta__logo { height: 34px; width: auto; align-self: flex-start; }
  .eco-cta__hook {
    margin: 4px 0 0;
    font-family: var(--eco-display);
    font-weight: 700;
    letter-spacing: -0.032em;
    line-height: 0.98;
    font-size: clamp(30px, 3.4vw, 46px);
    text-wrap: balance;
    color: var(--eco-ink);
  }
  .eco-cta__hook b { color: var(--eco-electric); font-weight: 700; }
  .eco-cta__desc {
    margin: 0;
    max-width: 42ch;
    font-size: clamp(15px, 1.15vw, 17px);
    line-height: 1.55;
    color: var(--eco-ink-2);
  }
  .eco-cta__desc b { color: var(--eco-ink); font-weight: 600; }

  .eco-cta__btn {
    margin-top: 6px;
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 24px;
    border-radius: 12px;
    background: var(--eco-electric);
    color: #fff;
    font-family: var(--eco-display);
    font-weight: 600;
    font-size: 16px;
    text-decoration: none;
    letter-spacing: -0.01em;
    box-shadow: 0 12px 26px -12px rgba(21, 52, 220, 0.7);
    transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  }
  .eco-cta__btn:hover { background: var(--eco-electric-2); transform: translateY(-1px); }
  .eco-cta__btn:focus-visible { outline: 3px solid rgba(21, 52, 220, 0.35); outline-offset: 2px; }
  .eco-cta__btn-arrow { transition: transform 0.25s cubic-bezier(0.2, 0.7, 0.2, 1); }
  .eco-cta:hover .eco-cta__btn-arrow { transform: translateX(4px); }

  /* descriptor / anticipo del carrusel */
  .eco-cta__family {
    margin-top: auto;
    padding-top: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .eco-cta__dots { display: inline-flex; gap: 7px; flex: 0 0 auto; }
  .eco-cta__dots i { width: 7px; height: 7px; border-radius: 50%; background: var(--eco-rule); display: block; }
  .eco-cta__dots i.is-on { width: 22px; border-radius: 4px; background: var(--eco-electric); }
  .eco-cta__family-label {
    font-family: var(--eco-mono);
    font-size: 11px;
    letter-spacing: 0.03em;
    line-height: 1.4;
    color: var(--eco-ink-3);
  }

  /* ---- Columna derecha: la simulación de métrica ---- */
  .eco-cta__signal {
    position: relative;
    padding: clamp(26px, 3.4vw, 44px);
    display: flex;
    flex-direction: column;
    gap: 16px;
    background:
      radial-gradient(90% 70% at 90% 0%, rgba(245, 64, 255, 0.07), transparent 60%),
      radial-gradient(90% 80% at 0% 100%, rgba(21, 52, 220, 0.08), transparent 60%),
      var(--eco-paper-2);
    border-left: 1px solid var(--eco-rule);
  }
  .eco-cta__signal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .eco-cta__signal-label {
    font-family: var(--eco-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--eco-ink-3);
  }
  .eco-cta__help {
    flex: 0 0 auto;
    width: 24px; height: 24px;
    border-radius: 50%;
    border: 1px solid var(--eco-rule);
    background: #fff;
    color: var(--eco-ink-2);
    font-family: var(--eco-display); font-weight: 700; font-size: 13px;
    cursor: pointer; line-height: 1;
    transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.2s;
  }
  .eco-cta__help:hover { background: var(--eco-electric); color: #fff; border-color: var(--eco-electric); transform: scale(1.08); }
  .eco-cta__help:focus-visible { outline: 3px solid rgba(21, 52, 220, 0.35); outline-offset: 2px; }

  .eco-cta__pop {
    position: absolute;
    top: calc(clamp(26px, 3.4vw, 44px) + 30px);
    right: clamp(26px, 3.4vw, 44px);
    width: min(300px, 78%);
    z-index: 5;
    background: var(--eco-ink);
    color: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    padding: 14px 16px;
    font-family: var(--eco-body);
    font-size: 12.5px;
    line-height: 1.5;
    box-shadow: 0 20px 50px -20px rgba(6, 10, 40, 0.7);
  }
  .eco-cta__pop[hidden] { display: none; }
  .eco-cta__pop p { margin: 0; padding-right: 14px; }
  .eco-cta__pop b { color: #fff; font-weight: 600; }
  .eco-cta__pop-x {
    position: absolute; top: 8px; right: 10px;
    background: none; border: none; color: rgba(255, 255, 255, 0.5);
    cursor: pointer; font-size: 13px; line-height: 1;
  }
  .eco-cta__pop-x:hover { color: #fff; }

  /* gráfico: presencia por modelo */
  .eco-cta__chart { display: flex; flex-direction: column; gap: 11px; }
  .eco-cta__row {
    display: grid;
    grid-template-columns: 22px 76px 1fr 40px;
    align-items: center;
    gap: 10px;
  }
  .eco-cta__mchip {
    width: 22px; height: 22px; border-radius: 6px;
    display: grid; place-items: center; overflow: hidden;
    box-shadow: 0 1px 2px rgba(6, 10, 40, 0.12);
  }
  .eco-cta__mlogo { width: 62%; height: 62%; display: block; }
  .eco-cta__mname {
    font-family: var(--eco-mono); font-size: 11.5px; color: var(--eco-ink-2);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .eco-cta__bar { height: 8px; border-radius: 6px; background: rgba(14, 23, 69, 0.08); overflow: hidden; }
  .eco-cta__bar-fill {
    display: block; height: 100%; width: 0; border-radius: 6px;
    transition: width 0.95s cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  .eco-cta.is-drawn .eco-cta__bar-fill { width: var(--w); }
  .eco-cta__row:nth-child(1) .eco-cta__bar-fill { transition-delay: 0.05s; }
  .eco-cta__row:nth-child(2) .eco-cta__bar-fill { transition-delay: 0.12s; }
  .eco-cta__row:nth-child(3) .eco-cta__bar-fill { transition-delay: 0.19s; }
  .eco-cta__row:nth-child(4) .eco-cta__bar-fill { transition-delay: 0.26s; }
  .eco-cta__row:nth-child(5) .eco-cta__bar-fill { transition-delay: 0.33s; }
  .eco-cta__row:nth-child(6) .eco-cta__bar-fill { transition-delay: 0.40s; }
  .eco-cta__val {
    font-family: var(--eco-mono); font-size: 12px; font-weight: 600;
    color: var(--eco-ink); text-align: right; font-variant-numeric: tabular-nums;
  }
  .eco-cta__signal-foot {
    margin: auto 0 0;
    padding-top: 4px;
    max-width: 40ch;
    font-family: var(--eco-mono);
    font-size: 10.5px;
    letter-spacing: 0.04em;
    line-height: 1.55;
    color: var(--eco-ink-3);
  }

  @media (max-width: 760px) {
    .eco-cta { border-radius: 22px; }
    .eco-cta__grid { grid-template-columns: 1fr; }
    /* meta apilada, sin apretujar los dos rótulos en una fila */
    .eco-cta__meta { flex-direction: column; align-items: flex-start; gap: 4px; padding: 14px 22px; }
    .eco-cta__meta-r { font-size: 10.5px; }
    .eco-cta__pitch { padding: 28px 22px; gap: 15px; }
    .eco-cta__hook { font-size: clamp(29px, 8.6vw, 40px); }
    .eco-cta__signal { padding: 26px 22px; border-left: none; border-top: 1px solid var(--eco-rule); }
    /* radar en la esquina inferior derecha, más chico, para no competir con el texto */
    .eco-cta__radar { width: 64%; left: 72%; bottom: -26%; opacity: 0.12; }
    /* popover a ancho completo para que se lea cómodo en el teléfono */
    .eco-cta__pop { top: 62px; left: 16px; right: 16px; width: auto; }
  }
  @media (max-width: 380px) {
    /* pantallas muy chicas: aprieto valor y gap, el nombre queda entero */
    .eco-cta__row { grid-template-columns: 22px 76px 1fr 34px; gap: 8px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .eco-cta, .eco-cta__btn, .eco-cta__btn-arrow, .eco-cta__bar-fill { transition: none !important; }
    .eco-cta__bar-fill { width: var(--w); }
    /* sin movimiento: radar estático como anillos concéntricos */
    .eco-cta__radar-ring, .eco-cta__radar-dot { animation: none !important; }
    .eco-cta__radar-ring:nth-of-type(1) { transform: scale(0.55); opacity: 0.65; }
    .eco-cta__radar-ring:nth-of-type(2) { transform: scale(0.85); opacity: 0.4; }
    .eco-cta__radar-ring:nth-of-type(3) { transform: scale(1.1); opacity: 0.2; }
  }
</style>
<section class="eco-cta" aria-label="Shift Eco — mide qué dice la IA de tu marca">
    <div class="eco-cta__meta">
      <span class="eco-cta__tag">Medición de visibilidad en IA</span>
      <span class="eco-cta__meta-r">eco.shiftlabdev.space</span>
    </div>

    <div class="eco-cta__grid">
      <!-- Izquierda: el pitch -->
      <div class="eco-cta__pitch">
        <svg class="eco-cta__radar" viewBox="0 0 384 401.52" aria-hidden="true"><path class="eco-cta__radar-ring" d="M187.79,306.27c-20.62,0-38.79-4.67-54.53-14-15.74-9.33-28.07-22.21-36.98-38.65-8.92-16.43-13.37-35.37-13.37-56.83s4.39-40.39,13.16-56.83c8.78-16.43,21.03-29.31,36.77-38.65,15.73-9.33,33.77-14,54.11-14s38.37,4.67,54.11,14c15.73,9.34,27.99,22.22,36.77,38.65,8.77,16.44,13.16,35.38,13.16,56.83s-4.39,40.39-13.16,56.83c-8.78,16.44-20.96,29.32-36.56,38.65-15.6,9.33-33.43,14-53.48,14Z"/><path class="eco-cta__radar-ring" d="M187.79,306.27c-20.62,0-38.79-4.67-54.53-14-15.74-9.33-28.07-22.21-36.98-38.65-8.92-16.43-13.37-35.37-13.37-56.83s4.39-40.39,13.16-56.83c8.78-16.43,21.03-29.31,36.77-38.65,15.73-9.33,33.77-14,54.11-14s38.37,4.67,54.11,14c15.73,9.34,27.99,22.22,36.77,38.65,8.77,16.44,13.16,35.38,13.16,56.83s-4.39,40.39-13.16,56.83c-8.78,16.44-20.96,29.32-36.56,38.65-15.6,9.33-33.43,14-53.48,14Z"/><path class="eco-cta__radar-ring" d="M187.79,306.27c-20.62,0-38.79-4.67-54.53-14-15.74-9.33-28.07-22.21-36.98-38.65-8.92-16.43-13.37-35.37-13.37-56.83s4.39-40.39,13.16-56.83c8.78-16.43,21.03-29.31,36.77-38.65,15.73-9.33,33.77-14,54.11-14s38.37,4.67,54.11,14c15.73,9.34,27.99,22.22,36.77,38.65,8.77,16.44,13.16,35.38,13.16,56.83s-4.39,40.39-13.16,56.83c-8.78,16.44-20.96,29.32-36.56,38.65-15.6,9.33-33.43,14-53.48,14Z"/><circle class="eco-cta__radar-dot" cx="188.4" cy="196.89" r="22.98"/></svg>
        <img class="eco-cta__logo" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iQ2FwYV8yIiBkYXRhLW5hbWU9IkNhcGEgMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmlld0JveD0iMCAwIDExNDkuODEgMzcxLjI2Ij4KICA8ZGVmcz4KICAgIDxzdHlsZT4KICAgICAgLmNscy0xIHsKICAgICAgICBmaWx0ZXI6IHVybCgjZHJvcC1zaGFkb3ctMSk7CiAgICAgIH0KCiAgICAgIC5jbHMtMiwgLmNscy0zIHsKICAgICAgICBmaWxsOiBub25lOwogICAgICAgIHN0cm9rZTogI2Y0NDBmZjsKICAgICAgICBzdHJva2UtbWl0ZXJsaW1pdDogMTA7CiAgICAgICAgc3Ryb2tlLXdpZHRoOiAxN3B4OwogICAgICB9CgogICAgICAuY2xzLTIsIC5jbHMtNCB7CiAgICAgICAgb3BhY2l0eTogLjE1OwogICAgICB9CgogICAgICAuY2xzLTUsIC5jbHMtNCB7CiAgICAgICAgZmlsbDogI2Y0NDBmZjsKICAgICAgfQoKICAgICAgLmNscy0zIHsKICAgICAgICBvcGFjaXR5OiAuMTsKICAgICAgfQoKICAgICAgLmNscy02IHsKICAgICAgICBmaWxsOiAjMTUzNGRiOwogICAgICB9CiAgICA8L3N0eWxlPgogICAgPGZpbHRlciBpZD0iZHJvcC1zaGFkb3ctMSIgeD0iNjE3LjUzIiB5PSIxMDYiIHdpZHRoPSI0NDAiIGhlaWdodD0iMTY3IiBmaWx0ZXJVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8ZmVPZmZzZXQgZHg9IjUiIGR5PSI0Ii8+CiAgICAgIDxmZUdhdXNzaWFuQmx1ciByZXN1bHQ9ImJsdXIiIHN0ZERldmlhdGlvbj0iNSIvPgogICAgICA8ZmVGbG9vZCBmbG9vZC1jb2xvcj0iIzAwMCIgZmxvb2Qtb3BhY2l0eT0iLjEiLz4KICAgICAgPGZlQ29tcG9zaXRlIGluMj0iYmx1ciIgb3BlcmF0b3I9ImluIi8+CiAgICAgIDxmZUNvbXBvc2l0ZSBpbj0iU291cmNlR3JhcGhpYyIvPgogICAgPC9maWx0ZXI+CiAgPC9kZWZzPgogIDxnIGlkPSJDYXBhXzItMiIgZGF0YS1uYW1lPSJDYXBhIDIiPgogICAgPGc+CiAgICAgIDxnPgogICAgICAgIDxwYXRoIGNsYXNzPSJjbHMtNiIgZD0iTTUwLjkxLDc0LjgzYzAtMTYuODMsMTEuODYtMjQuODYsMjQuODYtMjQuODYsMTYuNDUsMCwyNC4xLDguOCwyNC4xLDMyLjUxaDQzLjIyYzIuMjktMzUuOTYtOS4xOC03NC41OS03MC03NC41OUMzNC44NCw3Ljg5LjA0LDMwLjg0LjA0LDc0LjgzLjA0LDE1My4yNSw5OS44NywxNDEuMzksMTA0Ljg0LDE4Ni45MWMxLjUzLDEzLjAxLTQuOTcsMjcuOTItMjkuMDcsMjcuOTItMTYuODMsMC0yNi43OC0xMi42Mi0yNi43OC00My4yM0guMDRjLTEuMTUsNjEuMiwyNS4yNSw4Mi42Miw3NS43NCw4Mi42Miw0NC4zNywwLDgxLjg2LTE5LjUxLDgxLjg2LTYzLjUsMC04My43Ny0xMDYuNzItNzAtMTA2LjcyLTExNS45WiIvPgogICAgICAgIDxwYXRoIGNsYXNzPSJjbHMtNiIgZD0iTTI2NC4yNCw3Mi45M2MtMzIuOTQsMC00MC4zNywyOS4xNi00MC4zNywyOS4xNlY3Ljg5aC00Ny40N3YyNDYuMzRoNDcuNDd2LTEyMS40OWMxLjEyLTEyLjM0LDguNi0yMy4xOCwyNS43OS0yMy4xOCwxOS4wNiwwLDI1Ljc5LDE0LjIxLDI2LjE3LDI3LjY2djExN2g0Ny4xdi0xMjYuMzVjMC0zNC4wMi0yNi45MS01NC45NS01OC42OS01NC45NVoiLz4KICAgICAgICA8cmVjdCBjbGFzcz0iY2xzLTYiIHg9IjM0Ny45NyIgeT0iNzguOTEiIHdpZHRoPSI0Ny4xIiBoZWlnaHQ9IjE3NS4zMiIvPgogICAgICAgIDxwYXRoIGNsYXNzPSJjbHMtNiIgZD0iTTM0Ny45Nyw3OC45MWMyNi4wMSwwLDQ3LjEtMy4yLDQ3LjEtMjkuMjFWOC45MmgtNDcuMXY2OS45OVoiLz4KICAgICAgICA8cGF0aCBjbGFzcz0iY2xzLTYiIGQ9Ik02MDcuMDIsMTIwLjc4di00MS44N2gtNjQuODdzMzQuOTYtNi41NSwzNC45Ni0yOS40MlY3Ljg5aC00Ny40N3Y3MS4wMmgtNTUuMzJ2LTEuMTJjMC0yMi44LDE0Ljk1LTIyLjgsMjkuOS0yMi44VjcuODloLTI5LjljLTM0LjM5LDAtNDcuNDcsMjkuMTYtNDcuNDcsNjAuOTN2MTAuMDloLTE0LjJ2NDEuODdoMTQuMnYxMzMuNDVoNDcuNDd2LTEwNi4zYzAtMjcuMTUtMzQuODMtMjcuMTUtMzQuODMtMjcuMTVoOTAuMTV2NzIuNTJjMCwzMS40LDEzLjA4LDYwLjkzLDQ3LjQ3LDYwLjkzaDI5Ljkxdi00Ny40N2MtMTQuOTUsMC0yOS45MSwwLTI5LjkxLTIyLjQzdi02My41NWgyOS45MVoiLz4KICAgICAgPC9nPgogICAgICA8ZyBjbGFzcz0iY2xzLTEiPgogICAgICAgIDxwYXRoIGNsYXNzPSJjbHMtNSIgZD0iTTY5Mi4wMSwyNTMuMjljLTEyLjU3LDAtMjMuNjctMi44OS0zMy4zMS04LjY1LTkuNjQtNS43Ny0xNy4xNy0xMy43My0yMi42LTIzLjg5LTUuNDItMTAuMTYtOC4xMy0yMS44Ni04LjEzLTM1LjEyczIuNzEtMjQuOTYsOC4xMy0zNS4xMmM1LjQyLTEwLjE2LDEyLjkxLTE4LjEyLDIyLjQ3LTIzLjg5LDkuNTYtNS43NywyMC41My04LjY1LDMyLjkzLTguNjVzMjIuNDcsMi45NywzMS4yNSw4LjkxYzguNzgsNS45NCwxNS41OCwxNC4yNSwyMC40LDI0LjkyLDQuODIsMTAuNjgsNy4yMywyMy4yNCw3LjIzLDM3LjdoLTEwMS40OWMuODYsMTQuMTIsNS4zMywyNS4xNCwxMy40MywzMy4wNiw4LjA5LDcuOTIsMTguMzQsMTEuODgsMzAuNzMsMTEuODgsOS4xMiwwLDE2LjgzLTIuMTUsMjMuMTEtNi40Niw2LjI4LTQuMywxMS4xNS05Ljk4LDE0LjU5LTE3LjA0bDE3LjgyLDkuMDRjLTMuMjcsNi43MS03LjYyLDEyLjU3LTEzLjA0LDE3LjU2LTUuNDIsNS0xMS43OSw4Ljg3LTE5LjExLDExLjYyLTcuMzIsMi43NS0xNS40NSw0LjEzLTI0LjQsNC4xM1pNNjUwLjQzLDE3Mi4yaDc3LjczYy0uNTItNy40LTIuNDUtMTMuNzctNS44MS0xOS4xMS0zLjM2LTUuMzMtNy43MS05LjQ3LTEzLjA0LTEyLjQtNS4zNC0yLjkzLTExLjM2LTQuMzktMTguMDgtNC4zOXMtMTIuODMsMS40Mi0xOC44NSw0LjI2Yy02LjAzLDIuODQtMTEuMDIsNi45Ny0xNC45OCwxMi40LTMuOTYsNS40Mi02LjI5LDExLjg0LTYuOTcsMTkuMjRaIi8+CiAgICAgICAgPHBhdGggY2xhc3M9ImNscy01IiBkPSJNODM0LjA0LDI1My4yOWMtMTIuNzQsMC0yNC4wMi0yLjg5LTMzLjgzLTguNjUtOS44MS01Ljc3LTE3LjQ4LTEzLjczLTIyLjk4LTIzLjg5LTUuNTEtMTAuMTYtOC4yNi0yMS44Ni04LjI2LTM1LjEyczIuNzEtMjQuOTYsOC4xMy0zNS4xMmM1LjQyLTEwLjE2LDEzLjA0LTE4LjEyLDIyLjg1LTIzLjg5LDkuODEtNS43NywyMS04LjY1LDMzLjU3LTguNjVzMjMuNSwyLjg0LDMzLjMxLDguNTJjOS44MSw1LjY4LDE3LjMsMTMuNjksMjIuNDcsMjQuMDJsLTE4Ljg1LDguNTJjLTMuNDUtNi44OC04LjQ0LTEyLjI3LTE0Ljk4LTE2LjE0LTYuNTUtMy44Ny0xNC4wMy01LjgxLTIyLjQ3LTUuODFzLTE1Ljg4LDIuMDctMjIuMzQsNi4yYy02LjQ2LDQuMTMtMTEuNTQsOS44Ni0xNS4yNCwxNy4xNy0zLjcsNy4zMi01LjU1LDE1LjcxLTUuNTUsMjUuMThzMS44NSwxNy44Niw1LjU1LDI1LjE4YzMuNyw3LjMyLDguODcsMTMuMDQsMTUuNDksMTcuMTcsNi42Myw0LjEzLDE0LjE2LDYuMiwyMi42LDYuMnMxNS45Ny0yLjE1LDIyLjYtNi40NmM2LjYzLTQuMywxMS42Ni0xMC4zMywxNS4xMS0xOC4wOGwxOC44NSw4LjUyYy01LjE2LDExLjAyLTEyLjY1LDE5LjYzLTIyLjQ3LDI1Ljgycy0yMS4wMSw5LjMtMzMuNTcsOS4zWiIvPgogICAgICAgIDxwYXRoIGNsYXNzPSJjbHMtNSIgZD0iTTk3My40OSwyNTMuMjljLTEyLjc0LDAtMjMuOTgtMi44OS0zMy43LTguNjUtOS43My01Ljc3LTE3LjM1LTEzLjczLTIyLjg1LTIzLjg5LTUuNTEtMTAuMTYtOC4yNi0yMS44Ni04LjI2LTM1LjEyczIuNzEtMjQuOTYsOC4xMy0zNS4xMmM1LjQyLTEwLjE2LDEzLTE4LjEyLDIyLjczLTIzLjg5LDkuNzItNS43NywyMC44Ny04LjY1LDMzLjQ0LTguNjVzMjMuNzEsMi44OSwzMy40NCw4LjY1YzkuNzIsNS43NywxNy4zLDEzLjczLDIyLjczLDIzLjg5LDUuNDIsMTAuMTYsOC4xMywyMS44Nyw4LjEzLDM1LjEycy0yLjcxLDI0Ljk2LTguMTMsMzUuMTJjLTUuNDIsMTAuMTYtMTIuOTYsMTguMTItMjIuNiwyMy44OS05LjY0LDUuNzctMjAuNjYsOC42NS0zMy4wNiw4LjY1Wk05NzMuMjMsMjM0LjE4YzguNDMsMCwxNS44OC0yLjA3LDIyLjM0LTYuMiw2LjQ2LTQuMTMsMTEuNTMtOS44NSwxNS4yNC0xNy4xNywzLjctNy4zMiw1LjU1LTE1LjcxLDUuNTUtMjUuMThzLTEuODUtMTcuODYtNS41NS0yNS4xOGMtMy43LTcuMzItOC44Mi0xMy4wNC0xNS4zNi0xNy4xNy02LjU1LTQuMTMtMTQuMTItNi4yLTIyLjczLTYuMnMtMTUuODgsMi4wNy0yMi4zNCw2LjJjLTYuNDYsNC4xMy0xMS41NCw5LjgxLTE1LjI0LDE3LjA0LTMuNyw3LjIzLTUuNTUsMTUuNjctNS41NSwyNS4zMXMxLjg1LDE3Ljg2LDUuNTUsMjUuMThjMy43LDcuMzIsOC44NywxMy4wNCwxNS40OSwxNy4xNyw2LjYzLDQuMTMsMTQuMTYsNi4yLDIyLjYsNi4yWiIvPgogICAgICA8L2c+CiAgICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTk3My44MSwyOTUuMWMtMjAuNjIsMC0zOC43OS00LjY3LTU0LjUzLTE0LTE1Ljc0LTkuMzMtMjguMDctMjIuMjEtMzYuOTgtMzguNjUtOC45Mi0xNi40My0xMy4zNy0zNS4zNy0xMy4zNy01Ni44M3M0LjM5LTQwLjM5LDEzLjE2LTU2LjgzYzguNzgtMTYuNDMsMjEuMDMtMjkuMzEsMzYuNzctMzguNjUsMTUuNzMtOS4zMywzMy43Ny0xNCw1NC4xMS0xNHMzOC4zNyw0LjY3LDU0LjExLDE0YzE1LjczLDkuMzQsMjcuOTksMjIuMjIsMzYuNzcsMzguNjUsOC43NywxNi40NCwxMy4xNiwzNS4zOCwxMy4xNiw1Ni44M3MtNC4zOSw0MC4zOS0xMy4xNiw1Ni44M2MtOC43OCwxNi40NC0yMC45NiwyOS4zMi0zNi41NiwzOC42NS0xNS42LDkuMzMtMzMuNDMsMTQtNTMuNDgsMTRaIi8+CiAgICAgIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0iTTk3NC4zMiwzNjIuNzZjLTMzLjM2LDAtNjIuNzctNy41NS04OC4yMy0yMi42NS0yNS40Ny0xNS4wOS00NS40MS0zNS45NC01OS44My02Mi41NC0xNC40My0yNi41OS0yMS42My01Ny4yMy0yMS42My05MS45NHM3LjEtNjUuMzUsMjEuMjktOTEuOTRjMTQuMi0yNi41OSwzNC4wMy00Ny40Myw1OS40OS02Mi41NCwyNS40Ni0xNS4wOSw1NC42NC0yMi42NSw4Ny41NS0yMi42NXM2Mi4wOCw3LjU1LDg3LjU1LDIyLjY1YzI1LjQ2LDE1LjExLDQ1LjMsMzUuOTUsNTkuNDksNjIuNTQsMTQuMiwyNi42LDIxLjI5LDU3LjI0LDIxLjI5LDkxLjk0cy03LjEsNjUuMzYtMjEuMjksOTEuOTRjLTE0LjIsMjYuNi0zMy45Miw0Ny40NC01OS4xNiw2Mi41NC0yNS4yNSwxNS4xLTU0LjA5LDIyLjY1LTg2LjU0LDIyLjY1WiIvPgogICAgICA8Y2lyY2xlIGNsYXNzPSJjbHMtNCIgY3g9Ijk3NC40MiIgY3k9IjE4NS43MiIgcj0iMjIuOTgiLz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo=" alt="Eco" />
        <h2 class="eco-cta__hook">La app que <b>audita qué dice la IA</b> de tu marca.</h2>
        <p class="eco-cta__desc">
          La IA ya describe tu marca y recomienda a tus competidores, sin que nadie lo revise. Eco lo
          mide en los seis modelos: <b>dónde aparecés, cómo te nombran y qué tan cierto es</b>.
        </p>
        <a class="eco-cta__btn" href="https://eco.shiftlabdev.space/dossier" target="_blank" rel="noopener">
          Conocé más
          <span class="eco-cta__btn-arrow" aria-hidden="true">→</span>
        </a>
        <div class="eco-cta__family">
          <span class="eco-cta__dots" aria-hidden="true"><i class="is-on"></i><i></i><i></i></span>
          <span class="eco-cta__family-label">Eco · análisis de huella digital y GEO, pensada para LATAM</span>
        </div>
      </div>

      <!-- Derecha: simulación de presencia por modelo -->
      <div class="eco-cta__signal">
        <div class="eco-cta__signal-head">
          <span class="eco-cta__signal-label">Presencia por modelo</span>
          <button class="eco-cta__help" id="ecoHelp" type="button" aria-label="Qué mide este gráfico" aria-expanded="false">?</button>
        </div>

        <div class="eco-cta__pop" id="ecoPop" role="dialog" aria-label="Qué mide este gráfico" hidden>
          <p><b>Presencia:</b> de cada 100 preguntas de tu categoría, en cuántas el modelo menciona tu marca. Este gráfico es una <b>simulación</b>; con tu marca, Eco lo mide de verdad en los seis modelos, con intervalo de confianza.</p>
          <button class="eco-cta__pop-x" id="ecoPopX" type="button" aria-label="Cerrar">✕</button>
        </div>

        <div class="eco-cta__chart">
          <div class="eco-cta__row">
            <span class="eco-cta__mchip" style="background:#10a37f;color:#fff"><svg class="eco-cta__mlogo" viewBox="-1 -.1 949.1 959.8" aria-hidden="true"><path fill="currentColor" d="m925.8 456.3c10.4 23.2 17 48 19.7 73.3 2.6 25.3 1.3 50.9-4.1 75.8-5.3 24.9-14.5 48.8-27.3 70.8-8.4 14.7-18.3 28.5-29.7 41.2-11.3 12.6-23.9 24-37.6 34-13.8 10-28.5 18.4-44.1 25.3-15.5 6.8-31.7 12-48.3 15.4-7.8 24.2-19.4 47.1-34.4 67.7-14.9 20.6-33 38.7-53.6 53.6-20.6 15-43.4 26.6-67.6 34.4-24.2 7.9-49.5 11.8-75 11.8-16.9.1-33.9-1.7-50.5-5.1-16.5-3.5-32.7-8.8-48.2-15.7s-30.2-15.5-43.9-25.5c-13.6-10-26.2-21.5-37.4-34.2-25 5.4-50.6 6.7-75.9 4.1-25.3-2.7-50.1-9.3-73.4-19.7-23.2-10.3-44.7-24.3-63.6-41.4s-35-37.1-47.7-59.1c-8.5-14.7-15.5-30.2-20.8-46.3s-8.8-32.7-10.6-49.6c-1.8-16.8-1.7-33.8.1-50.7 1.8-16.8 5.5-33.4 10.8-49.5-17-18.9-31-40.4-41.4-63.6-10.3-23.3-17-48-19.6-73.3-2.7-25.3-1.3-50.9 4-75.8s14.5-48.8 27.3-70.8c8.4-14.7 18.3-28.6 29.6-41.2s24-24 37.7-34 28.5-18.5 44-25.3c15.6-6.9 31.8-12 48.4-15.4 7.8-24.3 19.4-47.1 34.3-67.7 15-20.6 33.1-38.7 53.7-53.7 20.6-14.9 43.4-26.5 67.6-34.4 24.2-7.8 49.5-11.8 75-11.7 16.9-.1 33.9 1.6 50.5 5.1s32.8 8.7 48.3 15.6c15.5 7 30.2 15.5 43.9 25.5 13.7 10.1 26.3 21.5 37.5 34.2 24.9-5.3 50.5-6.6 75.8-4s50 9.3 73.3 19.6c23.2 10.4 44.7 24.3 63.6 41.4 18.9 17 35 36.9 47.7 59 8.5 14.6 15.5 30.1 20.8 46.3 5.3 16.1 8.9 32.7 10.6 49.6 1.8 16.9 1.8 33.9-.1 50.8-1.8 16.9-5.5 33.5-10.8 49.6 17.1 18.9 31 40.3 41.4 63.6zm-333.2 426.9c21.8-9 41.6-22.3 58.3-39s30-36.5 39-58.4c9-21.8 13.7-45.2 13.7-68.8v-223q-.1-.3-.2-.7-.1-.3-.3-.6-.2-.3-.5-.5-.3-.3-.6-.4l-80.7-46.6v269.4c0 2.7-.4 5.5-1.1 8.1-.7 2.7-1.7 5.2-3.1 7.6s-3 4.6-5 6.5a32.1 32.1 0 0 1 -6.5 5l-191.1 110.3c-1.6 1-4.3 2.4-5.7 3.2 7.9 6.7 16.5 12.6 25.5 17.8 9.1 5.2 18.5 9.6 28.3 13.2 9.8 3.5 19.9 6.2 30.1 8 10.3 1.8 20.7 2.7 31.1 2.7 23.6 0 47-4.7 68.8-13.8zm-455.1-151.4c11.9 20.5 27.6 38.3 46.3 52.7 18.8 14.4 40.1 24.9 62.9 31s46.6 7.7 70 4.6 45.9-10.7 66.4-22.5l193.2-111.5.5-.5q.2-.2.3-.6.2-.3.3-.6v-94l-233.2 134.9c-2.4 1.4-4.9 2.4-7.5 3.2-2.7.7-5.4 1-8.2 1-2.7 0-5.4-.3-8.1-1-2.6-.8-5.2-1.8-7.6-3.2l-191.1-110.4c-1.7-1-4.2-2.5-5.6-3.4-1.8 10.3-2.7 20.7-2.7 31.1s1 20.8 2.8 31.1c1.8 10.2 4.6 20.3 8.1 30.1 3.6 9.8 8 19.2 13.2 28.2zm-50.2-417c-11.8 20.5-19.4 43.1-22.5 66.5s-1.5 47.1 4.6 70c6.1 22.8 16.6 44.1 31 62.9 14.4 18.7 32.3 34.4 52.7 46.2l193.1 111.6q.3.1.7.2h.7q.4 0 .7-.2.3-.1.6-.3l81-46.8-233.2-134.6c-2.3-1.4-4.5-3.1-6.5-5a32.1 32.1 0 0 1 -5-6.5c-1.3-2.4-2.4-4.9-3.1-7.6-.7-2.6-1.1-5.3-1-8.1v-227.1c-9.8 3.6-19.3 8-28.3 13.2-9 5.3-17.5 11.3-25.5 18-7.9 6.7-15.3 14.1-22 22.1-6.7 7.9-12.6 16.5-17.8 25.5zm663.3 154.4c2.4 1.4 4.6 3 6.6 5 1.9 1.9 3.6 4.1 5 6.5 1.3 2.4 2.4 5 3.1 7.6.6 2.7 1 5.4.9 8.2v227.1c32.1-11.8 60.1-32.5 80.8-59.7 20.8-27.2 33.3-59.7 36.2-93.7s-3.9-68.2-19.7-98.5-39.9-55.5-69.5-72.5l-193.1-111.6q-.3-.1-.7-.2h-.7q-.3.1-.7.2-.3.1-.6.3l-80.6 46.6 233.2 134.7zm80.5-121h-.1v.1zm-.1-.1c5.8-33.6 1.9-68.2-11.3-99.7-13.1-31.5-35-58.6-63-78.2-28-19.5-61-30.7-95.1-32.2-34.2-1.4-68 6.9-97.6 23.9l-193.1 111.5q-.3.2-.5.5l-.4.6q-.1.3-.2.7-.1.3-.1.7v93.2l233.2-134.7c2.4-1.4 5-2.4 7.6-3.2 2.7-.7 5.4-1 8.1-1 2.8 0 5.5.3 8.2 1 2.6.8 5.1 1.8 7.5 3.2l191.1 110.4c1.7 1 4.2 2.4 5.6 3.3zm-505.3-103.2c0-2.7.4-5.4 1.1-8.1.7-2.6 1.7-5.2 3.1-7.6 1.4-2.3 3-4.5 5-6.5 1.9-1.9 4.1-3.6 6.5-4.9l191.1-110.3c1.8-1.1 4.3-2.5 5.7-3.2-26.2-21.9-58.2-35.9-92.1-40.2-33.9-4.4-68.3 1-99.2 15.5-31 14.5-57.2 37.6-75.5 66.4-18.3 28.9-28 62.3-28 96.5v223q.1.4.2.7.1.3.3.6.2.3.5.6.2.2.6.4l80.7 46.6zm43.8 294.7 103.9 60 103.9-60v-119.9l-103.8-60-103.9 60z"/></svg></span>
            <span class="eco-cta__mname">ChatGPT</span>
            <span class="eco-cta__bar"><span class="eco-cta__bar-fill" style="--w:64%;background:#10a37f"></span></span>
            <span class="eco-cta__val">64%</span>
          </div>
          <div class="eco-cta__row">
            <span class="eco-cta__mchip" style="background:#d97757;color:#fff"><svg class="eco-cta__mlogo" viewBox="0 -.01 39.5 39.53" aria-hidden="true"><path fill="currentColor" d="m7.75 26.27 7.77-4.36.13-.38-.13-.21h-.38l-1.3-.08-4.44-.12-3.85-.16-3.73-.2-.94-.2-.88-1.16.09-.58.79-.53 1.13.1 2.5.17 3.75.26 2.72.16 4.03.42h.64l.09-.26-.22-.16-.17-.16-3.88-2.63-4.2-2.78-2.2-1.6-1.19-.81-.6-.76-.26-1.66 1.08-1.19 1.45.1.37.1 1.47 1.13 3.14 2.43 4.1 3.02.6.5.24-.17.03-.12-.27-.45-2.23-4.03-2.38-4.1-1.06-1.7-.28-1.02c-.1-.42-.17-.77-.17-1.2l1.23-1.67.68-.22 1.64.22.69.6 1.02 2.33 1.65 3.67 2.56 4.99.75 1.48.4 1.37.15.42h.26v-.24l.21-2.81.39-3.45.38-4.44.13-1.25.62-1.5 1.23-.81.96.46.79 1.13-.11.73-.47 3.05-.92 4.78-.6 3.2h.35l.4-.4 1.62-2.15 2.72-3.4 1.2-1.35 1.4-1.49.9-.71h1.7l1.25 1.86-.56 1.92-1.75 2.22-1.45 1.88-2.08 2.8-1.3 2.24.12.18.31-.03 4.7-1 2.54-.46 3.03-.52 1.37.64.15.65-.54 1.33-3.24.8-3.8.76-5.66 1.34-.07.05.08.1 2.55.24 1.09.06h2.67l4.97.37 1.3.86.78 1.05-.13.8-2 1.02-2.7-.64-6.3-1.5-2.16-.54h-.3v.18l1.8 1.76 3.3 2.98 4.13 3.84.21.95-.53.75-.56-.08-3.63-2.73-1.4-1.23-3.17-2.67h-.21v.28l.73 1.07 3.86 5.8.2 1.78-.28.58-1 .35-1.1-.2-2.26-3.17-2.33-3.57-1.88-3.2-.23.13-1.11 11.95-.52.61-1.2.46-1-.76-.53-1.23.53-2.43.64-3.17.52-2.52.47-3.13.28-1.04-.02-.07-.23.03-2.36 3.24-3.59 4.85-2.84 3.04-.68.27-1.18-.61.11-1.09.66-.97 3.93-5 2.37-3.1 1.53-1.79-.01-.26h-.09l-10.44 6.78-1.86.24-.8-.75.1-1.23.38-.4 3.14-2.16z"/></svg></span>
            <span class="eco-cta__mname">Claude</span>
            <span class="eco-cta__bar"><span class="eco-cta__bar-fill" style="--w:51%;background:#d97757"></span></span>
            <span class="eco-cta__val">51%</span>
          </div>
          <div class="eco-cta__row">
            <span class="eco-cta__mchip" style="background:linear-gradient(135deg,#4285f4 0%,#9168c0 52%,#d96570 100%);color:#fff"><svg class="eco-cta__mlogo" viewBox="0 0 28.01 28" aria-hidden="true"><path fill="currentColor" d="M14 28c0-1.94-.37-3.76-1.12-5.46-.72-1.7-1.72-3.19-2.98-4.45s-2.74-2.25-4.44-2.97C3.76 14.37 1.94 14 0 14c1.94 0 3.76-.36 5.46-1.09 1.7-.75 3.19-1.75 4.44-3.01 1.26-1.26 2.25-2.74 2.98-4.44C13.63 3.76 14 1.94 14 0c0 1.94.36 3.76 1.09 5.46.75 1.7 1.75 3.19 3.01 4.44 1.26 1.26 2.74 2.26 4.45 3.01 1.7.72 3.52 1.09 5.46 1.09-1.94 0-3.76.37-5.46 1.12-1.7.72-3.19 1.71-4.45 2.97s-2.26 2.74-3.01 4.45A13.86 13.86 0 0 0 14 28z"/></svg></span>
            <span class="eco-cta__mname">Gemini</span>
            <span class="eco-cta__bar"><span class="eco-cta__bar-fill" style="--w:58%;background:#4285f4"></span></span>
            <span class="eco-cta__val">58%</span>
          </div>
          <div class="eco-cta__row">
            <span class="eco-cta__mchip" style="background:#20808d;color:#fff"><svg class="eco-cta__mlogo" viewBox="1.5 0 21 24" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M19.785 0v7.272H22.5V17.62h-2.935V24l-7.037-6.194v6.145h-1.091v-6.152L4.392 24v-6.465H1.5V7.188h2.884V0l7.053 6.494V.19h1.09v6.49L19.786 0zm-7.257 9.044v7.319l5.946 5.234V14.44l-5.946-5.397zm-1.099-.08l-5.946 5.398v7.235l5.946-5.234V8.965zm8.136 7.58h1.844V8.349H13.46l6.105 5.54v2.655zm-8.982-8.28H2.59v8.195h1.8v-2.576l6.192-5.62zM5.475 2.476v4.71h5.115l-5.115-4.71zm13.219 0l-5.115 4.71h5.115v-4.71z"/></svg></span>
            <span class="eco-cta__mname">Perplexity</span>
            <span class="eco-cta__bar"><span class="eco-cta__bar-fill" style="--w:29%;background:#20808d"></span></span>
            <span class="eco-cta__val">29%</span>
          </div>
          <div class="eco-cta__row">
            <span class="eco-cta__mchip" style="background:#4d6bfe;color:#fff"><svg class="eco-cta__mlogo" viewBox="3.771 6.973 23.993 17.652" aria-hidden="true"><path fill="currentColor" d="M27.501 8.469c-.252-.123-.36.111-.508.23-.05.04-.093.09-.135.135-.368.395-.797.652-1.358.621-.821-.045-1.521.213-2.14.842-.132-.776-.57-1.238-1.235-1.535-.349-.155-.701-.309-.944-.645-.171-.238-.217-.504-.303-.765-.054-.159-.108-.32-.29-.348-.197-.031-.274.135-.352.273-.31.567-.43 1.192-.419 1.825.028 1.421.628 2.554 1.82 3.36.136.093.17.186.128.321-.081.278-.178.547-.264.824-.054.178-.135.217-.324.14a5.448 5.448 0 0 1 -1.719-1.169c-.848-.82-1.614-1.726-2.57-2.435-.225-.166-.449-.32-.681-.467-.976-.95.128-1.729.383-1.82.267-.096.093-.428-.77-.424s-1.653.293-2.659.677a2.782 2.782 0 0 1 -.46.135 9.554 9.554 0 0 0 -2.853-.1c-1.866.21-3.356 1.092-4.452 2.6-1.315 1.81-1.625 3.87-1.246 6.018.399 2.261 1.552 4.136 3.326 5.601 1.837 1.518 3.955 2.262 6.37 2.12 1.466-.085 3.1-.282 4.942-1.842.465.23.952.322 1.762.392.623.059 1.223-.031 1.687-.127.728-.154.677-.828.414-.953-2.132-.994-1.665-.59-2.09-.916 1.084-1.285 2.717-2.619 3.356-6.94.05-.343.007-.558 0-.837-.004-.168.034-.235.228-.254a4.084 4.084 0 0 0 1.529-.47c1.382-.757 1.938-1.997 2.07-3.485.02-.227-.004-.463-.243-.582zm-12.041 13.391c-2.067-1.627-3.07-2.162-3.483-2.138-.387.021-.318.465-.233.754.089.285.205.482.368.732.113.166.19.414-.112.598-.666.414-1.823-.139-1.878-.166-1.347-.793-2.473-1.842-3.267-3.276-.765-1.38-1.21-2.861-1.284-4.441-.02-.383.093-.518.472-.586a4.692 4.692 0 0 1 1.514-.04c2.109.31 3.905 1.255 5.41 2.749.86.853 1.51 1.871 2.18 2.865.711 1.057 1.478 2.063 2.454 2.887.343.289.619.51.881.672-.792.088-2.117.107-3.022-.61zm.99-6.38a.304.304 0 1 1 .609 0c0 .17-.136.304-.306.304a.3.3 0 0 1 -.303-.305zm3.077 1.581c-.197.08-.394.15-.584.159a1.246 1.246 0 0 1 -.79-.252c-.27-.227-.463-.354-.546-.752a1.752 1.752 0 0 1 .016-.582c.07-.324-.008-.531-.235-.72-.187-.155-.422-.196-.682-.196a.551.551 0 0 1 -.252-.078c-.108-.055-.197-.19-.112-.356.027-.053.159-.183.19-.207.352-.201.758-.135 1.134.016.349.142.611.404.99.773.388.448.457.573.678.906.174.264.333.534.441.842.066.192-.02.35-.248.448z"/></svg></span>
            <span class="eco-cta__mname">DeepSeek</span>
            <span class="eco-cta__bar"><span class="eco-cta__bar-fill" style="--w:42%;background:#4d6bfe"></span></span>
            <span class="eco-cta__val">42%</span>
          </div>
          <div class="eco-cta__row">
            <span class="eco-cta__mchip" style="background:#fff;color:#000"><svg class="eco-cta__mlogo" viewBox="0 1 48 46" aria-hidden="true"><path fill="currentColor" d="m18.542 30.532 15.956-11.776c.783-.576 1.902-.354 2.274.545 1.962 4.728 1.084 10.411-2.819 14.315-3.903 3.901-9.333 4.756-14.299 2.808l-5.423 2.511c7.778 5.315 17.224 4 23.125-1.903 4.682-4.679 6.131-11.058 4.775-16.812l.011.011c-1.966-8.452.482-11.829 5.501-18.735.116-.164.237-.33.357-.496l-6.602 6.599v-.022l-22.86 22.958m-3.29 2.857c-5.582-5.329-4.619-13.579.142-18.339 3.521-3.522 9.294-4.958 14.331-2.847l5.412-2.497c-.974-.704-2.224-1.46-3.659-1.994-6.478-2.666-14.238-1.34-19.505 3.922-5.065 5.064-6.659 12.851-3.924 19.496 2.044 4.965-1.307 8.48-4.682 12.023-1.199 1.255-2.396 2.514-3.363 3.844l15.241-13.608"/></svg></span>
            <span class="eco-cta__mname">Grok</span>
            <span class="eco-cta__bar"><span class="eco-cta__bar-fill" style="--w:18%;background:#5b6472"></span></span>
            <span class="eco-cta__val">18%</span>
          </div>
        </div>

        <p class="eco-cta__signal-foot">Simulación · de cada 100 preguntas de tu categoría, en cuántas te nombra cada IA.</p>
      </div>
    </div>
  </section>`;

export default function ShiftLabEcoCard() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const card = root.querySelector<HTMLElement>(".eco-cta");
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
      const onEnter = () => {
        card.classList.remove("is-drawn");
        void card.offsetWidth;
        card.classList.add("is-drawn");
      };
      card.addEventListener("mouseenter", onEnter);
      cleanups.push(() => {
        io.disconnect();
        window.clearTimeout(t);
        card.removeEventListener("mouseenter", onEnter);
      });
    }

    const help = root.querySelector<HTMLButtonElement>("#ecoHelp");
    const pop = root.querySelector<HTMLElement>("#ecoPop");
    const popX = root.querySelector<HTMLButtonElement>("#ecoPopX");
    const setPop = (open: boolean) => {
      if (!pop || !help) return;
      pop.hidden = !open;
      help.setAttribute("aria-expanded", open ? "true" : "false");
    };
    const onHelp = (e: Event) => {
      e.stopPropagation();
      if (pop) setPop(pop.hidden);
    };
    const onX = () => setPop(false);
    const onDoc = (e: MouseEvent) => {
      if (pop && !pop.hidden && e.target instanceof Node && !pop.contains(e.target) && e.target !== help) {
        setPop(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPop(false);
    };
    help?.addEventListener("click", onHelp);
    popX?.addEventListener("click", onX);
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    cleanups.push(() => {
      help?.removeEventListener("click", onHelp);
      popX?.removeEventListener("click", onX);
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: CARD_HTML }} />;
}
