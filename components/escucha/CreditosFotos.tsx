import { CREDITOS } from "./MarcaEjemplo";

/* Atribución de las fotos (CC BY / CC BY-SA): autor, licencia y enlace. */
export function CreditosFotos({ color = "#858eb4" }: { color?: string }) {
  return (
    <details className="mt-2 text-[11px]" style={{ color }}>
      <summary className="cursor-pointer">Créditos de las fotos</summary>
      <p className="mt-1 leading-relaxed">
        {CREDITOS.map((c, i) => (
          <span key={c.k}>
            <a href={c.url} target="_blank" rel="noopener" className="underline underline-offset-2">{c.autor}</a> ({c.licencia}){i < CREDITOS.length - 1 ? ", " : ". "}
          </span>
        ))}
        Wikimedia Commons. Nike y su logo son marcas de Nike, Inc.
      </p>
    </details>
  );
}
