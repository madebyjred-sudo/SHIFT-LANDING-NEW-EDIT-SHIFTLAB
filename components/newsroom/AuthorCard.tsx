import Image from "next/image";

interface AuthorCardProps {
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  role?: string | null;
  date: string;
  readTime?: number | null;
}

export default function AuthorCard({ name, avatarUrl, bio, role, date, readTime }: AuthorCardProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-[#1534DC]/20 bg-[#1534DC]/5">
        {avatarUrl ? (
          <Image src={avatarUrl} alt={name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#1534DC] font-bold text-lg [font-family:var(--font-figtree)]">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
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
