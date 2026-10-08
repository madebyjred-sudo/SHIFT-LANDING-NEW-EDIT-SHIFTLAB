"use client";

import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/70 [font-family:var(--font-figtree)]">
        Compartir
      </span>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center w-9 h-9 rounded-full border border-[#111A31]/10 hover:border-[#111A31]/25 hover:bg-[#111A31]/5 transition-all duration-200"
        aria-label="Compartir en X"
      >
        <svg className="w-4 h-4 text-[#111A31]/60 group-hover:text-[#111A31] transition-colors" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center w-9 h-9 rounded-full border border-[#111A31]/10 hover:border-[#111A31]/25 hover:bg-[#111A31]/5 transition-all duration-200"
        aria-label="Compartir en LinkedIn"
      >
        <svg className="w-4 h-4 text-[#111A31]/60 group-hover:text-[#111A31] transition-colors" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center w-9 h-9 rounded-full border border-[#111A31]/10 hover:border-[#111A31]/25 hover:bg-[#111A31]/5 transition-all duration-200"
        aria-label="Compartir en Facebook"
      >
        <svg className="w-4 h-4 text-[#111A31]/60 group-hover:text-[#111A31] transition-colors" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopy}
        className="group flex items-center justify-center w-9 h-9 rounded-full border border-[#111A31]/10 hover:border-[#1534DC] hover:bg-[#1534DC]/5 transition-all duration-200 relative"
        aria-label="Copiar enlace"
      >
        <svg className="w-4 h-4 text-[#111A31]/60 group-hover:text-[#1534DC] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-[#111A31] px-2 py-1 rounded whitespace-nowrap [font-family:var(--font-figtree)]">
            Copiado
          </span>
        )}
      </button>
    </div>
  );
}
