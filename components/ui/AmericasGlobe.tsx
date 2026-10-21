"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { geoOrthographic, geoPath, geoGraticule, geoInterpolate } from "d3-geo";
import { timer } from "d3-timer";

/**
 * Globo interactivo de las Américas.
 *
 * Queda semi-fijo sobre el continente en vez de girar libre: la rotación solo
 * se mueve cuando cambia la selección, y lo hace con ease. Cada mercado donde
 * Shift opera es un punto, unidos por arcos con glow magenta desde la sede en
 * Costa Rica — radios en vez de todos-contra-todos, que serían 45 líneas y
 * ruido.
 *
 * Es un control, no un adorno: captura clics y hace hit-test contra los puntos
 * proyectados. Un clic fuera de cualquier punto deselecciona.
 *
 * `prefers-reduced-motion`: sin flujo en los arcos ni transición de cámara.
 */

export interface Mercado {
  pais: string;
  lat: number;
  lng: number;
  activo: boolean;
}

interface Props {
  mercados: Mercado[];
  seleccionado?: string | null;
  /** Sin handler el globo es decorativo: no captura clics ni muestra cursor. */
  onSeleccionar?: (pais: string | null) => void;
  /** Encuadre base en forma `rotate` de d3: `[-lon, -lat]`. */
  vista?: [number, number];
  /** Grados por frame. >0 lo pone a girar solo (uso decorativo). */
  spin?: number;
  /** Ondas que salen del país seleccionado (la escucha está corriendo ahí). */
  latiendo?: boolean;
  size?: number;
  className?: string;
  /**
   * Lienzo espejo, dibujado en tinta negra en el MISMO frame y con la MISMA
   * proyección. Va fuera de la caja del hero, detrás: el fondo opaco de la caja
   * lo tapa y solo se ve lo que sobresale. Dos componentes separados derivarían
   * entre sí; un solo tick pintando dos contextos no puede.
   */
  shadowRef?: React.RefObject<HTMLCanvasElement | null>;
}

/** Paletas: la de adentro va sobre fondo oscuro; la de afuera sobre fondo claro. */
interface Paleta {
  limbo: string;
  reticula: string;
  tierra: string;
  puntoActivo: string;
  pulso: string;
}

const PALETA: Record<"claro" | "tinta", Paleta> = {
  claro: {
    limbo: "rgba(255,255,255,0.20)",
    reticula: "rgba(255,255,255,0.07)",
    tierra: "rgba(255,255,255,0.32)",
    puntoActivo: "#ffffff",
    pulso: "rgba(255,255,255,0.9)",
  },
  tinta: {
    limbo: "rgba(0,0,0,0.30)",
    reticula: "rgba(0,0,0,0.09)",
    tierra: "rgba(0,0,0,0.42)",
    puntoActivo: "#0B1020",
    pulso: "rgba(11,16,32,0.9)",
  },
};

const VISTA_AMERICAS: [number, number] = [79, -12];
const MAGENTA = "245,64,255";
const AZUL = "120,150,255";

const ZOOM_PAIS = 1.38;

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export default function AmericasGlobe({
  mercados,
  seleccionado = null,
  onSeleccionar,
  vista,
  spin = 0,
  latiendo = false,
  size = 1000,
  className = "",
  shadowRef,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  // `vista` llega como literal desde JSX: sin memo, `base` sería un array nuevo
  // en cada render y el efecto de dibujo se reiniciaría en bucle.
  const base = useMemo<[number, number]>(
    () => vista ?? VISTA_AMERICAS,
    [vista?.[0], vista?.[1]], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const destino = useRef<[number, number]>(base);
  const actual = useRef<[number, number]>(base);
  const desde = useRef<[number, number]>(base);
  const t0 = useRef<number>(-1);
  // La cámara también acerca: 1 en la vista de las Américas, ZOOM_PAIS al fijar
  // un país. Se interpola con el mismo ease y en el mismo tick que la rotación,
  // así el acercamiento y el giro son un solo movimiento y no dos.
  const escActual = useRef(1);
  const escDesde = useRef(1);
  const escDestino = useRef(1);
  const proyRef = useRef<ReturnType<typeof geoOrthographic> | null>(null);
  const mercadosRef = useRef(mercados);
  const selRef = useRef(seleccionado);
  const latRef = useRef(latiendo);
  latRef.current = latiendo;

  mercadosRef.current = mercados;
  selRef.current = seleccionado;

  // Nueva cámara cuando cambia la selección.
  useEffect(() => {
    const m = mercados.find((x) => x.pais === seleccionado);
    const nuevo: [number, number] = m ? [-m.lng, -m.lat] : base;
    const zoom = m ? ZOOM_PAIS : 1;
    if (
      nuevo[0] === destino.current[0] &&
      nuevo[1] === destino.current[1] &&
      zoom === escDestino.current
    ) {
      return;
    }
    desde.current = [...actual.current] as [number, number];
    destino.current = nuevo;
    escDesde.current = escActual.current;
    escDestino.current = zoom;
    t0.current = performance.now();
  }, [seleccionado, mercados, base]);

  const clic = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onSeleccionar) return; // decorativo
      const proj = proyRef.current;
      const canvas = ref.current;
      if (!proj || !canvas) return;
      const r = canvas.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * size;
      const y = ((e.clientY - r.top) / r.height) * size;

      let mejor: string | null = null;
      let dmin = 26; // radio de tolerancia en px
      for (const m of mercadosRef.current) {
        const p = proj([m.lng, m.lat]);
        if (!p) continue; // cara oculta del globo
        const d = Math.hypot(p[0] - x, p[1] - y);
        if (d < dmin) {
          dmin = d;
          mejor = m.pais;
        }
      }
      onSeleccionar?.(mejor); // null = clic al vacío → vuelve a las Américas
    },
    [onSeleccionar, size],
  );

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Tope de densidad: un globo de alambre no gana nada a 2x, y en pantalla
    // retina un lienzo de 1280 se rasterizaría a 2560² = 6,5 Mpx por frame, que
    // es lo que ahogaba al hilo principal y frenaba las animaciones de la página.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const radius = size / 1.92;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    // Espejo: mismas dimensiones y misma escala de dpr que el principal.
    let ctxSombra: CanvasRenderingContext2D | null = null;
    const sombra = shadowRef?.current ?? null;
    if (sombra) {
      sombra.width = size * dpr;
      sombra.height = size * dpr;
      sombra.style.width = `${size}px`;
      sombra.style.height = `${size}px`;
      ctxSombra = sombra.getContext("2d");
      ctxSombra?.scale(dpr, dpr);
    }

    const proj = geoOrthographic()
      .scale(radius)
      .translate([size / 2, size / 2])
      .clipAngle(90)
      .rotate(actual.current);
    proj.scale(radius * escActual.current);
    proyRef.current = proj;
    const grat = geoGraticule();

    let tierra: GeoJSON.FeatureCollection | null = null;
    // Polígonos con muy pocos vértices son islas de un píxel: no aportan al
    // dibujo y sí al costo de recorrer el path en cada frame.
    let tierraVisible: GeoJSON.Feature[] = [];
    let vivo = true;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Arcos radiales desde la sede (Costa Rica) hacia cada mercado.
    const sede = mercados.find((m) => m.pais === "Costa Rica") ?? mercados[0];
    const arcos = mercados
      .filter((m) => m !== sede)
      .map((m) => {
        const it = geoInterpolate([sede.lng, sede.lat], [m.lng, m.lat]);
        return {
          destino: m.pais,
          pts: Array.from({ length: 34 }, (_, i) => it(i / 33)),
        };
      });

    const pintar = (ctx: CanvasRenderingContext2D, pal: Paleta, fase: number) => {
      ctx.clearRect(0, 0, size, size);
      const sel = selRef.current;

      // limbo
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, proj.scale(), 0, 2 * Math.PI);
      ctx.strokeStyle = pal.limbo;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // retícula
      const path = geoPath(proj, ctx);
      ctx.beginPath();
      path(grat());
      ctx.strokeStyle = pal.reticula;
      ctx.lineWidth = 0.7;
      ctx.stroke();

      if (tierra) {
        ctx.beginPath();
        for (const f of tierraVisible) path(f);
        ctx.strokeStyle = pal.tierra;
        ctx.lineWidth = 0.85;
        ctx.stroke();
      }

      // arcos con glow
      ctx.save();
      ctx.lineCap = "round";
      for (const a of arcos) {
        const visibles = a.pts.map((p) => proj(p)).filter(Boolean) as [number, number][];
        if (visibles.length < 2) continue;
        const resaltado = sel === a.destino || sel === sede.pais;
        ctx.beginPath();
        ctx.moveTo(visibles[0][0], visibles[0][1]);
        for (let i = 1; i < visibles.length; i++) ctx.lineTo(visibles[i][0], visibles[i][1]);
        // Glow por doble trazo —ancho y tenue debajo, fino y brillante encima—
        // en vez de `shadowBlur`. El desenfoque de canvas es carísimo: con 11
        // arcos y 11 puntos por frame sobre un lienzo grande congelaba la página.
        ctx.strokeStyle = `rgba(${MAGENTA},${resaltado ? 0.28 : 0.14})`;
        ctx.lineWidth = resaltado ? 7 : 4.5;
        ctx.stroke();
        ctx.strokeStyle = `rgba(${MAGENTA},${resaltado ? 0.95 : 0.6})`;
        ctx.lineWidth = resaltado ? 1.8 : 1.1;
        ctx.stroke();

        // pulso que recorre el arco
        if (!quieto) {
          const k = Math.floor(((fase + a.destino.length * 7) % 100) / 100 * visibles.length);
          const p = visibles[Math.min(k, visibles.length - 1)];
          ctx.beginPath();
          ctx.arc(p[0], p[1], 5, 0, 2 * Math.PI);
          ctx.fillStyle = `rgba(${MAGENTA},0.22)`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p[0], p[1], 2.1, 0, 2 * Math.PI);
          ctx.fillStyle = pal.pulso;
          ctx.fill();
        }
      }
      ctx.restore();

      // puntos de mercado
      for (const m of mercadosRef.current) {
        const p = proj([m.lng, m.lat]);
        if (!p) continue;
        const esSel = sel === m.pais;
        const base = m.activo ? MAGENTA : AZUL;

        if (esSel) {
          ctx.beginPath();
          ctx.arc(p[0], p[1], 15, 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(${base},0.55)`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          if (latRef.current) {
            // tres ondas desfasadas que crecen y se apagan
            const ahora = performance.now() / 1000;
            for (let o = 0; o < 3; o++) {
              const f = (ahora * 0.55 + o / 3) % 1;
              ctx.beginPath();
              ctx.arc(p[0], p[1], 16 + f * 90, 0, 2 * Math.PI);
              ctx.strokeStyle = `rgba(${base},${0.6 * (1 - f)})`;
              ctx.lineWidth = 1.6;
              ctx.stroke();
            }
            ctx.beginPath();
            ctx.arc(p[0], p[1], 34, 0, 2 * Math.PI);
            ctx.fillStyle = `rgba(${base},${0.12 + 0.08 * Math.sin(ahora * 4)})`;
            ctx.fill();
          }
        }

        const rad = esSel ? 6 : m.activo ? 4.6 : 3.2;
        ctx.beginPath();
        ctx.arc(p[0], p[1], rad * 2.6, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(${base},${m.activo ? 0.18 : 0.08})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p[0], p[1], rad, 0, 2 * Math.PI);
        ctx.fillStyle = m.activo ? pal.puntoActivo : `rgba(${AZUL},0.75)`;
        ctx.fill();
      }
    };

    let ultimo = -1;
    const tick = timer((elapsed) => {
      if (!vivo) return;
      // 30 fps alcanzan de sobra para una rotación lenta y bajan a la mitad el
      // costo de repintado, que con dos lienzos se paga doble.
      if (elapsed - ultimo < 33) return;
      ultimo = elapsed;
      if (spin && !quieto) {
        actual.current = [actual.current[0] + spin, actual.current[1]];
        proj.rotate(actual.current);
      }
      if (t0.current >= 0) {
        const dur = 900;
        const k = Math.min(1, (performance.now() - t0.current) / dur);
        const e = quieto ? 1 : ease(k);
        const a = desde.current;
        const b = destino.current;
        // interpola por el camino corto en longitud
        let dl = b[0] - a[0];
        while (dl > 180) dl -= 360;
        while (dl < -180) dl += 360;
        actual.current = [a[0] + dl * e, a[1] + (b[1] - a[1]) * e];
        escActual.current = escDesde.current + (escDestino.current - escDesde.current) * e;
        proj.rotate(actual.current).scale(radius * escActual.current);
        if (k >= 1) t0.current = -1;
      }
      const fase = (elapsed / 28) % 100;
      pintar(ctx, PALETA.claro, fase);
      if (ctxSombra) pintar(ctxSombra, PALETA.tinta, fase);
    });

    fetch("/assets/geo/ne_110m_land.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: GeoJSON.FeatureCollection) => {
        if (!vivo) return;
        tierra = d;
        const pesa = (g: GeoJSON.Geometry): number => {
          if (g.type === "Polygon") return (g.coordinates as number[][][])[0]?.length ?? 0;
          if (g.type === "MultiPolygon")
            return Math.max(
              ...(g.coordinates as number[][][][]).map((p) => p[0]?.length ?? 0),
            );
          return 0;
        };
        tierraVisible = d.features.filter((f) => pesa(f.geometry) >= 8);
      })
      .catch(() => {
        /* sin mapa quedan retícula, arcos y puntos: degrada, no rompe */
      });

    return () => {
      vivo = false;
      tick.stop();
    };
  }, [size, mercados, shadowRef, spin, base]);

  return (
    <canvas
      ref={ref}
      onClick={clic}
      className={`select-none ${onSeleccionar ? "cursor-pointer" : "pointer-events-none"} ${className}`}
      role="img"
      aria-label="Mapa de los mercados donde opera Shift. Clic en un país para filtrar."
    />
  );
}
