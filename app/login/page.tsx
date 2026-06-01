"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import PasswordInput from "@/components/PasswordInput";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/newsroom/escritorio";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      document.cookie = `sb-token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}`;
      router.push(redirectTo);
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#111A31] [font-family:var(--font-glitz-local)] mb-3">
            Shift <span className="text-[#1534DC]">Newsroom</span>
          </h1>
          <p className="text-[#1F2A44] [font-family:var(--font-fira-sans)]">
            Accede a tu escritorio de autor
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm [font-family:var(--font-fira-sans)]">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/60 [font-family:var(--font-figtree)] mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-xl border border-[#111A31]/10 bg-white text-[#111A31] text-sm [font-family:var(--font-fira-sans)] focus:outline-none focus:border-[#1534DC] focus:ring-2 focus:ring-[#1534DC]/20 transition-all"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/60 [font-family:var(--font-figtree)] mb-2">
              Contraseña
            </label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-[#1534DC] hover:bg-[#1534DC]/90 text-white text-sm font-bold [font-family:var(--font-figtree)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar al escritorio"}
          </button>
        </form>

        <p className="text-center text-sm text-[#111A31]/50 [font-family:var(--font-fira-sans)] mt-6">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-[#1534DC] hover:text-[#F540FF] transition-colors font-bold">
            Regístrate
          </Link>
        </p>

        <div className="mt-8 pt-8 border-t border-[#111A31]/8 text-center">
          <Link
            href="/newsroom"
            className="inline-flex items-center gap-2 text-[#111A31]/40 hover:text-[#111A31]/70 transition-colors text-sm [font-family:var(--font-figtree)]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Newsroom
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-[#111A31]/40 [font-family:var(--font-figtree)]">Cargando...</div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
