import Link from "next/link";
import type { NewsFeed } from "@/lib/newsroom/feeds";

interface Props {
  feed: Pick<NewsFeed, "slug" | "badge" | "name" | "accent">;
  /** `onDark` va sobre imagen o fondo oscuro; `onLight` sobre fondo claro. */
  tone?: "onDark" | "onLight";
  size?: "sm" | "md";
  /** Sin enlace cuando el badge vive dentro de otra tarjeta que ya enlaza. */
  asLink?: boolean;
}

export default function FeedBadge({
  feed,
  tone = "onDark",
  size = "sm",
  asLink = false,
}: Props) {
  const dims =
    size === "md"
      ? "px-3.5 py-1.5 text-[11px]"
      : "px-2.5 py-1 text-[10px]";

  const base =
    `inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-[0.15em] ` +
    `[font-family:var(--font-figtree)] ${dims}`;

  const skin =
    tone === "onDark"
      ? "bg-white/15 border border-white/25 backdrop-blur-sm text-white"
      : "border text-[color:var(--feed-accent)] bg-[color:var(--feed-accent)]/8 border-[color:var(--feed-accent)]/25";

  const content = (
    <>
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: tone === "onDark" ? "#fff" : feed.accent }}
      />
      {feed.badge}
    </>
  );

  const style = { ["--feed-accent" as string]: feed.accent } as React.CSSProperties;

  if (!asLink) {
    return (
      <span className={`${base} ${skin}`} style={style} title={feed.name}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={`/newsroom/feeds/${feed.slug}`}
      className={`${base} ${skin} transition-opacity hover:opacity-80`}
      style={style}
      title={feed.name}
    >
      {content}
    </Link>
  );
}
