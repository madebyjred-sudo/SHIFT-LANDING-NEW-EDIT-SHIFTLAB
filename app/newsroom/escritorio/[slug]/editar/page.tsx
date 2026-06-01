"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { getDirectusImageUrl } from "@/lib/directus";
import RichTextEditor from "@/components/RichTextEditor";

const LAYOUT_PRESETS = [
  { value: "classic", label: "Clásico", desc: "Hero imagen + título superpuesto" },
  { value: "editorial", label: "Editorial", desc: "Imagen 50% + contenido 50%" },
  { value: "magazine", label: "Magazine", desc: "Hero vertical, tipografía grande" },
  { value: "hero-split", label: "Hero Split", desc: "Imagen y texto lado a lado" },
];

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string | { slug: string } | null;
  layout_preset: string;
  cover_image: string | null;
  gallery_images: { image_id: string }[] | null;
  status: "draft" | "published" | "archived";
}

export default function EditarArticuloPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const supabase = createClient();

  const [article, setArticle] = useState<ArticleData | null>(null);
  const [title, setTitle] = useState("");
  const [articleSlug, setArticleSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [layoutPreset, setLayoutPreset] = useState("classic");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverId, setCoverId] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [galleryIds, setGalleryIds] = useState<string[]>([]);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login?redirectTo=/newsroom/escritorio");
        return;
      }
      setUserId(data.user.id);
      loadArticle(data.user.id);
    });
  }, [router, supabase, slug]);

  const loadArticle = async (uid: string) => {
    try {
      const res = await fetch(`/api/newsroom/articles/${slug}?user_id=${uid}`);
      if (!res.ok) {
        router.push("/newsroom/escritorio");
        return;
      }
      const data = await res.json();
      const a = data.article as ArticleData;
      setArticle(a);
      setTitle(a.title);
      setArticleSlug(a.slug);
      setExcerpt(a.excerpt || "");
      setContent(a.content || "");
      setLayoutPreset(a.layout_preset || "classic");
      setStatus(a.status === "archived" ? "draft" : a.status);
      setCoverId(a.cover_image);
      if (a.cover_image) {
        setCoverPreview(
          a.cover_image.startsWith("/")
            ? a.cover_image
            : getDirectusImageUrl(a.cover_image)!
        );
      }

      const cat =
        typeof a.category === "string"
          ? a.category
          : (a.category as { slug: string })?.slug || "";
      setCategory(cat);

      const gids =
        a.gallery_images?.map((g) =>
          typeof g === "string" ? g : g.image_id
        ) || [];
      setGalleryIds(gids);
      setGalleryPreviews(
        gids.map((id: string) =>
          id.startsWith("/") ? id : getDirectusImageUrl(id)!
        )
      );
    } catch {
      setError("Error cargando artículo");
    } finally {
      setLoading(false);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen de cover debe ser menor a 2MB");
      return;
    }
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.size <= 2 * 1024 * 1024);
    if (valid.length < files.length) {
      setError("Algunas imágenes exceden 2MB y fueron omitidas");
    }
    setGalleryImages((prev) => [...prev, ...valid]);
    setGalleryPreviews((prev) => [
      ...prev,
      ...valid.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    setGalleryIds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent, newStatus: "draft" | "published") => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      let finalCoverId = coverId;

      // Upload new cover if changed
      if (coverImage) {
        const coverForm = new FormData();
        coverForm.append("file", coverImage);
        const coverRes = await fetch("/api/newsroom/upload", {
          method: "POST",
          body: coverForm,
        });
        if (!coverRes.ok) throw new Error("Error subiendo imagen de portada");
        const { id } = await coverRes.json();
        finalCoverId = id;
      }

      // Upload new gallery images
      const newGalleryIds = [...galleryIds];
      for (const file of galleryImages) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/newsroom/upload", {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error("Error subiendo imagen de galería");
        const { id } = await res.json();
        newGalleryIds.push(id);
      }

      // Update article
      const articleRes = await fetch(`/api/newsroom/articles/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: articleSlug,
          excerpt,
          content,
          category,
          layout_preset: layoutPreset,
          cover_image: finalCoverId,
          gallery_images: newGalleryIds,
          status: newStatus,
          user_id: userId,
        }),
      });

      if (!articleRes.ok) {
        const err = await articleRes.json();
        throw new Error(err.error || "Error actualizando artículo");
      }

      router.push("/newsroom/escritorio");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-[#111A31]/40 [font-family:var(--font-figtree)]">
          Cargando artículo...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-32">
      <header className="border-b border-[#111A31]/8 sticky top-0 bg-white/95 backdrop-blur-sm z-30">
        <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/newsroom/escritorio"
              className="text-[#111A31]/40 hover:text-[#111A31] transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <h1 className="text-lg md:text-xl font-bold text-[#111A31] [font-family:var(--font-figtree)]">
              Editar <span className="text-[#1534DC]">artículo</span>
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 rounded-full border border-[#111A31]/10 text-[#111A31]/60 hover:text-[#1534DC] hover:border-[#1534DC]/30 text-[11px] font-bold uppercase tracking-[0.1em] [font-family:var(--font-figtree)] transition-all"
          >
            {previewMode ? "Editar" : "Preview"}
          </button>
        </div>
      </header>

      <div className="max-w-[900px] mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm [font-family:var(--font-fira-sans)]">
            {error}
          </div>
        )}

        {previewMode ? (
          <div className="space-y-8">
            {coverPreview && (
              <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden">
                <Image src={coverPreview} alt={title} fill className="object-cover" />
              </div>
            )}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#111A31] [font-family:var(--font-figtree)] leading-tight">
                {title || "Sin título"}
              </h1>
              {excerpt && (
                <p className="mt-4 text-xl text-[#1F2A44] [font-family:var(--font-fira-sans)] font-light leading-relaxed">
                  {excerpt}
                </p>
              )}
            </div>
            <div className="prose prose-lg max-w-none [font-family:var(--font-fira-sans)]">
              <div dangerouslySetInnerHTML={{ __html: content || "<p>Sin contenido</p>" }} />
            </div>
            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryPreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden">
                    <Image src={src} alt={`Gallery ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form className="space-y-8">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/60 [font-family:var(--font-figtree)] mb-2">
                Título *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl border border-[#111A31]/10 bg-white text-[#111A31] text-lg [font-family:var(--font-figtree)] font-bold focus:outline-none focus:border-[#1534DC] focus:ring-2 focus:ring-[#1534DC]/20 transition-all"
                placeholder="Título del artículo"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/60 [font-family:var(--font-figtree)] mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={articleSlug}
                onChange={(e) => setArticleSlug(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#111A31]/10 bg-white text-[#111A31] text-sm [font-family:var(--font-fira-sans)] focus:outline-none focus:border-[#1534DC] focus:ring-2 focus:ring-[#1534DC]/20 transition-all"
                placeholder="mi-articulo-url"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/60 [font-family:var(--font-figtree)] mb-2">
                Extracto *
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#111A31]/10 bg-white text-[#111A31] text-sm [font-family:var(--font-fira-sans)] focus:outline-none focus:border-[#1534DC] focus:ring-2 focus:ring-[#1534DC]/20 transition-all resize-none"
                placeholder="Breve descripción del artículo"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/60 [font-family:var(--font-figtree)] mb-2">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#111A31]/10 bg-white text-[#111A31] text-sm [font-family:var(--font-fira-sans)] focus:outline-none focus:border-[#1534DC] focus:ring-2 focus:ring-[#1534DC]/20 transition-all appearance-none"
              >
                <option value="">Selecciona una categoría</option>
                <option value="noticias">Noticias</option>
                <option value="insights">Insights</option>
                <option value="casos-de-exito">Casos de Éxito</option>
                <option value="cultura">Cultura</option>
                <option value="eventos">Eventos</option>
                <option value="innovacion">Innovación</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/60 [font-family:var(--font-figtree)] mb-3">
                Layout del artículo
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {LAYOUT_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setLayoutPreset(preset.value)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      layoutPreset === preset.value
                        ? "border-[#1534DC] bg-[#1534DC]/5 ring-2 ring-[#1534DC]/20"
                        : "border-[#111A31]/10 hover:border-[#111A31]/20"
                    }`}
                  >
                    <p
                      className={`text-sm font-bold [font-family:var(--font-figtree)] ${
                        layoutPreset === preset.value
                          ? "text-[#1534DC]"
                          : "text-[#111A31]"
                      }`}
                    >
                      {preset.label}
                    </p>
                    <p className="text-[11px] text-[#111A31]/40 [font-family:var(--font-fira-sans)] mt-1">
                      {preset.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/60 [font-family:var(--font-figtree)] mb-2">
                Imagen de portada (máx 2MB)
              </label>
              <label className="relative block w-full aspect-[21/9] rounded-2xl border-2 border-dashed border-[#111A31]/15 hover:border-[#1534DC]/40 cursor-pointer overflow-hidden bg-[#111A31]/[0.02] flex items-center justify-center transition-colors">
                {coverPreview ? (
                  <Image src={coverPreview} alt="Cover preview" fill className="object-cover" />
                ) : (
                  <div className="text-center">
                    <svg
                      className="w-8 h-8 text-[#111A31]/20 mx-auto mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm text-[#111A31]/40 [font-family:var(--font-fira-sans)]">
                      Click para cambiar imagen de portada
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/60 [font-family:var(--font-figtree)] mb-2">
                Galería de imágenes (máx 2MB cada una)
              </label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {galleryPreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                    <Image src={src} alt={`Gallery ${i + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-xl border-2 border-dashed border-[#111A31]/15 hover:border-[#1534DC]/40 cursor-pointer flex items-center justify-center bg-[#111A31]/[0.02] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    className="hidden"
                  />
                  <svg
                    className="w-6 h-6 text-[#111A31]/20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/60 [font-family:var(--font-figtree)] mb-2">
                Contenido *
              </label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Escribe el contenido de tu artículo..."
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-[#111A31]/8">
              <button
                type="button"
                disabled={saving}
                onClick={(e) => handleSubmit(e as unknown as React.FormEvent, "draft")}
                className="w-full sm:w-auto px-8 py-4 rounded-full border border-[#111A31]/15 text-[#111A31] text-sm font-bold [font-family:var(--font-figtree)] hover:border-[#111A31]/30 transition-all disabled:opacity-50"
              >
                {saving && status === "draft" ? "Guardando..." : "Guardar borrador"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={(e) => handleSubmit(e as unknown as React.FormEvent, "published")}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#1534DC] hover:bg-[#1534DC]/90 text-white text-sm font-bold [font-family:var(--font-figtree)] transition-colors disabled:opacity-50"
              >
                {saving && status === "published" ? "Publicando..." : "Publicar cambios"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
