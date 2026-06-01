"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  date_published: string | null;
  category: { name: string } | null;
}

const statusColors: Record<string, string> = {
  draft: "bg-yellow-50 text-yellow-700 border-yellow-200",
  published: "bg-green-50 text-green-700 border-green-200",
  archived: "bg-gray-50 text-gray-500 border-gray-200",
};

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

function isAdminRole(role: string | undefined) {
  return role === "admin" || role === "editor";
}

export default function EscritorioPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login?redirectTo=/newsroom/escritorio");
        return;
      }
      setUser(data.user);

      // Ensure author exists in Directus
      try {
        const authorRes = await fetch("/api/newsroom/authors/ensure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: data.user.id,
            name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Autor",
            email: data.user.email,
          }),
        });
        const authorData = await authorRes.json().catch(() => ({}));
        if (isAdminRole(authorData.author?.role)) {
          setIsAdmin(true);
        }
        console.log("Author ensure:", authorData);
      } catch (e) {
        console.error("Author ensure error:", e);
      }

      // Fetch user's articles
      try {
        const res = await fetch("/api/newsroom/articles", {
          headers: { "x-user-id": data.user.id },
        });
        if (res.ok) {
          const data = await res.json();
          setArticles(data.articles || []);
        }
      } catch {
        // silent
      }
      setLoading(false);
    };
    checkAuth();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "sb-token=; path=/; max-age=0";
    router.push("/newsroom");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-[#111A31]/40 [font-family:var(--font-figtree)] text-sm">Cargando escritorio...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-32">
      <header className="border-b border-[#111A31]/8">
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#111A31] [font-family:var(--font-figtree)]">
              Mi <span className="text-[#1534DC]">Escritorio</span>
            </h1>
            <p className="text-sm text-[#111A31]/50 [font-family:var(--font-fira-sans)] mt-1">
              {user?.user_metadata?.full_name || user?.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/newsroom/admin"
                className="px-4 py-2.5 rounded-full bg-[#111A31] hover:bg-[#111A31]/90 text-white text-[12px] font-bold uppercase tracking-[0.1em] [font-family:var(--font-figtree)] transition-colors"
              >
                Admin panel
              </Link>
            )}
            <Link
              href="/newsroom/escritorio/nuevo"
              className="px-5 py-2.5 rounded-full bg-[#1534DC] hover:bg-[#1534DC]/90 text-white text-[12px] font-bold uppercase tracking-[0.1em] [font-family:var(--font-figtree)] transition-colors"
            >
              + Nuevo artículo
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-full border border-[#111A31]/15 text-[#111A31]/60 hover:text-[#111A31] hover:border-[#111A31]/30 text-[12px] font-bold uppercase tracking-[0.1em] [font-family:var(--font-figtree)] transition-all"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Publicados", value: articles.filter((a) => a.status === "published").length },
            { label: "Borradores", value: articles.filter((a) => a.status === "draft").length },
            { label: "Archivados", value: articles.filter((a) => a.status === "archived").length },
            { label: "Total", value: articles.length },
          ].map((stat) => (
            <div key={stat.label} className="p-5 rounded-2xl border border-[#111A31]/8 bg-[#111A31]/[0.02]">
              <p className="text-2xl font-bold text-[#111A31] [font-family:var(--font-figtree)]">{stat.value}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/40 [font-family:var(--font-figtree)] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#111A31] [font-family:var(--font-figtree)]">Mis artículos</h2>
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[#111A31]/15 rounded-3xl">
              <p className="text-[#111A31]/40 [font-family:var(--font-figtree)] mb-4">Aún no has publicado artículos</p>
              <Link href="/newsroom/escritorio/nuevo" className="inline-block px-6 py-3 rounded-full bg-[#1534DC] hover:bg-[#1534DC]/90 text-white text-sm font-bold [font-family:var(--font-figtree)] transition-colors">
                Escribir mi primer artículo
              </Link>
            </div>
          ) : (
            articles.map((article) => (
              <div key={article.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-[#111A31]/8 hover:border-[#111A31]/15 hover:shadow-sm transition-all">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] border ${statusColors[article.status] || statusColors.draft} [font-family:var(--font-figtree)]`}>
                      {statusLabels[article.status] || article.status}
                    </span>
                    {article.category && <span className="text-[11px] text-[#111A31]/40 [font-family:var(--font-figtree)]">{article.category.name}</span>}
                  </div>
                  <h3 className="text-base font-bold text-[#111A31] [font-family:var(--font-figtree)] truncate">{article.title}</h3>
                  {article.date_published && (
                    <p className="text-[12px] text-[#111A31]/40 [font-family:var(--font-fira-sans)] mt-1">
                      {new Date(article.date_published).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/newsroom/${article.slug}`} target="_blank" className="px-4 py-2 rounded-full border border-[#111A31]/10 text-[#111A31]/60 hover:text-[#1534DC] hover:border-[#1534DC]/30 text-[11px] font-bold uppercase tracking-[0.1em] [font-family:var(--font-figtree)] transition-all">Ver</Link>
                  <Link href={`/newsroom/escritorio/${article.slug}/editar`} className="px-4 py-2 rounded-full bg-[#111A31] hover:bg-[#111A31]/90 text-white text-[11px] font-bold uppercase tracking-[0.1em] [font-family:var(--font-figtree)] transition-colors">Editar</Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
