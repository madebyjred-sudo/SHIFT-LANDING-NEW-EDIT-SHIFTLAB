"use client";

import { useState } from "react";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}

function EyeOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function PasswordInput({ value, onChange, placeholder, required, minLength }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="w-full px-4 py-3.5 pr-12 rounded-xl border border-[#111A31]/10 bg-white text-[#111A31] text-sm [font-family:var(--font-fira-sans)] focus:outline-none focus:border-[#1534DC] focus:ring-2 focus:ring-[#1534DC]/20 transition-all"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#111A31]/30 hover:text-[#111A31]/60 transition-colors"
        tabIndex={-1}
      >
        {visible ? (
          <EyeOpenIcon className="w-5 h-5" />
        ) : (
          <EyeClosedIcon className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
