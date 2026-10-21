/* Marca de Sentinel tal como la usa el producto: SENTINEL en mayúsculas,
 * peso 600 y tracking 0,14em (lockup del tablero y del video). */
export function SentinelMarca({ className = "", color = "#9244D8" }: { className?: string; color?: string }) {
  return (
    <span className={`font-semibold uppercase tracking-[0.14em] [margin-right:-0.14em] ${className}`} style={{ color }}>
      Sentinel
    </span>
  );
}
