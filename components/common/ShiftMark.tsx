/**
 * ShiftMark — el monograma de Shift LATAM (mismo SVG que el favicon).
 *
 * NOTA sobre el viewBox: el SVG original es `0 0 477.24 492.57` pero
 * los dos paths sólo ocupan un rectángulo central de ~131×174. El resto
 * es whitespace. Si renderizamos con el viewBox original a 36px, el
 * glyph visible es de ~9px y se siente diminuto.
 *
 * Lo recortamos a la bounding-box real de las paths (+ un poco de
 * padding para que respire). Eso hace que `size={36}` realmente
 * signifique "36px de glyph".
 *
 * Bounding combinado (medido sobre las curvas):
 *   x: 155.5 → 286.2  (width 130.7)
 *   y: 174.7 → 348.7  (height 174)
 * Con +6px de padding en cada lado: viewBox="149 169 143 186"
 */
export default function ShiftMark({
  size = 32,
  wingColor = "#9244d8",
  bodyColor = "#ffffff",
  className = "",
  title,
}: {
  size?: number | string;
  /** Color del "wing" lateral (originalmente #9244d8). */
  wingColor?: string;
  /** Color de la figura-8 central (originalmente blanco). */
  bodyColor?: string;
  className?: string;
  /** Si se pasa, se renderiza como elemento con título (accesible). */
  title?: string;
}) {
  // Calculamos width/height del viewBox recortado preservando aspect ratio:
  // ratio = 143/186 ≈ 0.769. Le pasamos size al lado dominante (la altura).
  const heightPx = typeof size === "number" ? size : undefined;
  const widthPx = heightPx ? Math.round(heightPx * (143 / 186)) : undefined;

  return (
    <svg
      viewBox="149 169 143 186"
      width={widthPx ?? size}
      height={heightPx ?? size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path
        fill={wingColor}
        d="M233.6,348.69l-2.63-7.12c-4.53,1.67-9.24,2.69-14.05,3.04v-55.1h-3.78c-28.36-.08-51.43-23.21-51.43-51.57,0-19.23,10.59-36.73,27.64-45.68l-3.53-6.72c-19.55,10.26-31.7,30.34-31.7,52.39,0,31.26,24.44,56.98,55.21,59.01v55.37h3.79c7.03,0,13.92-1.23,20.47-3.64Z"
      />
      <path
        fill={bodyColor}
        d="M230.88,230.01v-55.24c-30.57,0-55.35,24.78-55.35,55.35s24.71,55.27,55.21,55.35v55.24c30.57,0,55.35-24.78,55.35-55.35s-24.71-55.27-55.21-55.35Z"
      />
    </svg>
  );
}
