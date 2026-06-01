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
  date_created: string;
  category: { name: string } | null;
  author_id: { name: string } | null;
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

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login?redirectTo=/newsroom/admin");
        return;
      }

      // Check role
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
        if (!isAdminRole(authorData.author?.role)) {
          router.push("/newsroom/escritorio");
          return;
        }
        setIsAdmin(true);
      } catch {
        router.push("/newsroom/escritorio");
        return;
      }

      // Fetch ALL articles
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

  const handleDelete = async (slug: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este artículo? Esta acción no se puede deshacer.")) {
      return;
    }

    setDeleting(slug);
    try {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) return;

      const res = await fetch(`/api/newsroom/articles/${slug}?user_id=${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.slug !== slug));
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Error eliminando artículo");
      }
    } catch {
      alert("Error eliminando artículo");
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "sb-token=; path=/; max-age=0";
    router.push("/newsroom");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-[#111A31]/40 [font-family:var(--font-figtree)] text-sm">Cargando panel de admin...</div>
      </main>
    );
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-white pb-32">
      <header className="border-b border-[#111A31]/8">
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#111A31] [font-family:var(--font-figtree)]">
              Admin <span className="text-[#1534DC]">Panel</span>
            </h1>
            <p className="text-sm text-[#111A31]/50 [font-family:var(--font-fira-sans)] mt-1">
              Gestión de todos los artículos del newsroom
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/newsroom/escritorio"
              className="px-4 py-2.5 rounded-full border border-[#111A31]/15 text-[#111A31]/60 hover:text-[#111A31] hover:border-[#111A31]/30 text-[12px] font-bold uppercase tracking-[0.1em] [font-family:var(--font-figtree)] transition-all"
            >
              Mi escritorio
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
            <h2 className="text-lg font-bold text-[#111A31] [font-family:var(--font-figtree)]">Todos los artículos</h2>
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[#111A31]/15 rounded-3xl">
              <p className="text-[#111A31]/40 [font-family:var(--font-figtree)]">No hay artículos en el newsroom</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#111A31]/8">
                    <th className="pb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/40 [font-family:var(--font-figtree)]">Artículo</th>
                    <th className="pb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/40 [font-family:var(--font-figtree)] hidden md:table-cell">Autor</th>
                    <th className="pb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/40 [font-family:var(--font-figtree)] hidden sm:table-cell">Categoría</th>
                    <th className="pb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/40 [font-family:var(--font-figtree)]">Estado</th>
                    <th className="pb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/40 [font-family:var(--font-figtree)] hidden lg:table-cell">Fecha</th>
                    <th className="pb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/40 [font-family:var(--font-figtree)] text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111A31]/5">
                  {articles.map((article) => (
                    <tr key={article.id} className="group hover:bg-[#111A31]/[0.01] transition-colors">
                      <td className="py-4 pr-4">
                        <h3 className="text-sm font-bold text-[#111A31] [font-family:var(--font-figtree)]">{article.title}</h3>
                        <p className="text-[11px] text-[#111A31]/30 [font-family:var(--font-fira-sans)]">/{article.slug}</p>
                      </td>
                      <td className="py-4 pr-4 hidden md:table-cell">
                        <span className="text-sm text-[#111A31]/60 [font-family:var(--font-fira-sans)]">
                          {typeof article.author_id === "object" && article.author_id !== null
                            ? (article.author_id as unknown as { name: string }).name
                            : "—"}
                        </span>
                      </td>
                      <td className="py-4 pr-4 hidden sm:table-cell">
                        <span className="text-sm text-[#111A31]/60 [font-family:var(--font-fira-sans)]">
                          {article.category?.name || "—"}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] border ${statusColors[article.status] || statusColors.draft} [font-family:var(--font-figtree)]`}>
                          {statusLabels[article.status] || article.status}
                        </span>
                      </td>
                      <td className="py-4 pr-4 hidden lg:table-cell">
                        <span className="text-[12px] text-[#111A31]/40 [font-family:var(--font-fira-sans)]">
                          {article.date_published
                            ? new Date(article.date_published).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
                            : new Date(article.date_created).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/newsroom/${article.slug}`}
                            target="_blank"
                            className="px-3 py-1.5 rounded-full border border-[#111A31]/10 text-[#111A31]/60 hover:text-[#1534DC] hover:border-[#1534DC]/30 text-[10px] font-bold uppercase tracking-[0.1em] [font-family:var(--font-figtree)] transition-all"
                          >
                            Ver
                          </Link>
                          <Link
                            href={`/newsroom/escritorio/${article.slug}/editar`}
                            className="px-3 py-1.5 rounded-full bg-[#111A31] hover:bg-[#111A31]/90 text-white text-[10px] font-bold uppercase tracking-[0.1em] [font-family:var(--font-figtree)] transition-colors"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(article.slug)}
                            disabled={deleting === article.slug}
                            className="px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 text-[10px] font-bold uppercase tracking-[0.1em] [font-family:var(--font-figtree)] transition-colors disabled:opacity-50"
                          >
                            {deleting === article.slug ? "..." : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
