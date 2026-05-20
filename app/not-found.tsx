import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 py-20 text-center text-[#111A31]">
      <p className="text-sm font-semibold uppercase tracking-widest text-[#1534DC]">
        404
      </p>
      <h1 className="text-2xl font-semibold sm:text-3xl">Página no encontrada</h1>
      <p className="max-w-md text-base leading-relaxed text-[#111A31]/80">
        La dirección no existe o fue movida. Volvé al inicio para seguir navegando.
      </p>
      <Link
        href="/"
        className="rounded-full border border-[#1534DC] bg-[#1534DC] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#1229b8]"
      >
        Ir al inicio
      </Link>
    </div>
  );
}
