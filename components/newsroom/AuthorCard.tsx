import Image from "next/image";

interface AuthorCardProps {
  name: string;
  avatarUrl?: string | null;
  coAvatarUrl?: string | null;
  authorIsAi?: boolean;
  coIsAi?: boolean;
  bio?: string | null;
  role?: string | null;
  date: string;
  readTime?: number | null;
}

function Avatar({
  url,
  alt,
  isAi,
  z,
}: {
  url?: string | null;
  alt: string;
  isAi?: boolean;
  z: number;
}) {
  return (
    <span
      style={{ zIndex: z }}
      className={`relative block shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 bg-[#1534DC]/5 ${
        isAi ? "border-[#F540FF]/50 ai-avatar" : "border-[#1534DC]/20"
      }`}
    >
      {url ? (
        <Image src={url} alt={alt} fill className="object-cover" />
      ) : (
        <span className="w-full h-full flex items-center justify-center text-[#1534DC] font-bold text-lg [font-family:var(--font-figtree)]">
          {alt.charAt(0).toUpperCase()}
        </span>
      )}
      {isAi && (
        <span
          title="Agente IA"
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 grid place-items-center w-[15px] h-[15px] rounded-full bg-[#F540FF] text-white text-[8px] leading-none font-bold ring-[1.5px] ring-white"
        >
          ✦
        </span>
      )}
    </span>
  );
}

export default function AuthorCard({
  name,
  avatarUrl,
  coAvatarUrl,
  authorIsAi,
  coIsAi,
  role,
  date,
  readTime,
}: AuthorCardProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex shrink-0 -space-x-3">
        <Avatar url={avatarUrl} alt={name} isAi={authorIsAi} z={20} />
        {coAvatarUrl && <Avatar url={coAvatarUrl} alt={name} isAi={coIsAi} z={10} />}
      </span>
      <div className="min-w-0">
        <p className="text-[15px] font-bold text-[#111A31] [font-family:var(--font-figtree)] leading-tight">
          {name}
        </p>
        <div className="flex items-center gap-2 text-[13px] text-[#111A31]/50 [font-family:var(--font-fira-sans)] mt-0.5">
          {role && <span>{role}</span>}
          {role && <span className="text-[#111A31]/20">·</span>}
          <span>{date}</span>
          {readTime && (
            <>
              <span className="text-[#111A31]/20">·</span>
              <span>{readTime} min lectura</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
