"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import PasswordInput from "@/components/PasswordInput";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#111A31] [font-family:var(--font-figtree)] mb-3">
            ¡Registro exitoso!
          </h1>
          <p className="text-[#1F2A44] [font-family:var(--font-fira-sans)] mb-8">
            Revisa tu email para confirmar tu cuenta. Una vez confirmada, podrás acceder a tu escritorio.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 rounded-full bg-[#1534DC] hover:bg-[#1534DC]/90 text-white text-sm font-bold [font-family:var(--font-figtree)] transition-colors"
          >
            Ir al login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#111A31] [font-family:var(--font-glitz-local)] mb-3">
            Crear <span className="text-[#1534DC]">cuenta</span>
          </h1>
          <p className="text-[#1F2A44] [font-family:var(--font-fira-sans)]">
            Únete al Newsroom de Shift Latam
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm [font-family:var(--font-fira-sans)]">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/60 [font-family:var(--font-figtree)] mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-xl border border-[#111A31]/10 bg-white text-[#111A31] text-sm [font-family:var(--font-fira-sans)] focus:outline-none focus:border-[#1534DC] focus:ring-2 focus:ring-[#1534DC]/20 transition-all"
              placeholder="Juan Pérez"
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-[#1534DC] hover:bg-[#1534DC]/90 text-white text-sm font-bold [font-family:var(--font-figtree)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-[#111A31]/50 [font-family:var(--font-fira-sans)] mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-[#1534DC] hover:text-[#F540FF] transition-colors font-bold">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
