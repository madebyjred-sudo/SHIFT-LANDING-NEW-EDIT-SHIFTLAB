"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import RichTextEditor from "@/components/RichTextEditor";

const LAYOUT_PRESETS = [
  { value: "classic", label: "Clásico", desc: "Hero imagen + título superpuesto" },
  { value: "editorial", label: "Editorial", desc: "Imagen 50% + contenido 50%" },
  { value: "magazine", label: "Magazine", desc: "Hero vertical, tipografía grande" },
  { value: "hero-split", label: "Hero Split", desc: "Imagen y texto lado a lado" },
];

export default function NuevoArticuloPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [layoutPreset, setLayoutPreset] = useState("classic");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [authorEmail, setAuthorEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login?redirectTo=/newsroom/escritorio/nuevo");
        return;
      }
      setUserId(data.user.id);
      setAuthorName(
        data.user.user_metadata?.full_name ||
          data.user.email?.split("@")[0] ||
          "Autor"
      );
      setAuthorEmail(data.user.email ?? null);
    });
  }, [router, supabase]);

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
    setGalleryPreviews((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!coverImage) {
      setError("Debes subir una imagen de portada");
      setLoading(false);
      return;
    }
    if (galleryImages.length < 1) {
      setError("Debes subir al menos 1 imagen adicional para la galería (mínimo 2 imágenes en total)");
      setLoading(false);
      return;
    }

    try {
      // 1. Upload cover image
      const coverForm = new FormData();
      coverForm.append("file", coverImage);
      const coverRes = await fetch("/api/newsroom/upload", {
        method: "POST",
        body: coverForm,
      });
      if (!coverRes.ok) throw new Error("Error subiendo imagen de portada");
      const { id: coverId } = await coverRes.json();

      // 2. Upload gallery images
      const galleryIds = [];
      for (const file of galleryImages) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/newsroom/upload", {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error("Error subiendo imagen de galería");
        const { id } = await res.json();
        galleryIds.push(id);
      }

      // 3. Create article
      const articleRes = await fetch("/api/newsroom/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content,
          category,
          layout_preset: layoutPreset,
          cover_image: coverId,
          gallery_images: galleryIds,
          status,
          user_id: userId,
          author_name: authorName,
          author_email: authorEmail,
        }),
      });

      if (!articleRes.ok) {
        const err = await articleRes.json();
        throw new Error(err.error || "Error creando artículo");
      }

      router.push("/newsroom/escritorio");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white pb-32">
      {/* Header */}
      <header className="border-b border-[#111A31]/8 sticky top-0 bg-white/95 backdrop-blur-sm z-30">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/newsroom/escritorio"
              className="text-[#111A31]/40 hover:text-[#111A31] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-lg md:text-xl font-bold text-[#111A31] [font-family:var(--font-figtree)]">
              Nuevo <span className="text-[#1534DC]">artículo</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 rounded-full border border-[#111A31]/10 text-[#111A31]/60 hover:text-[#1534DC] hover:border-[#1534DC]/30 text-[11px] font-bold uppercase tracking-[0.1em] [font-family:var(--font-figtree)] transition-all"
            >
              {previewMode ? "Editar" : "Preview"}
            </button>
          </div>
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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/60 [font-family:var(--font-figtree)] mb-2">
                Título *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl border border-[#111A31]/10 bg-white text-[#111A31] text-lg [font-family:var(--font-figtree)] font-bold focus:outline-none focus:border-[#1534DC] focus:ring-2 focus:ring-[#1534DC]/20 transition-all"
                placeholder="Título del artículo"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/60 [font-family:var(--font-figtree)] mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#111A31]/10 bg-white text-[#111A31] text-sm [font-family:var(--font-fira-sans)] focus:outline-none focus:border-[#1534DC] focus:ring-2 focus:ring-[#1534DC]/20 transition-all"
                placeholder="mi-articulo-url"
              />
            </div>

            {/* Excerpt */}
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
                placeholder="Breve descripción del artículo (aparece en cards y SEO)"
              />
            </div>

            {/* Category */}
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

            {/* Layout Preset */}
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
                    <p className={`text-sm font-bold [font-family:var(--font-figtree)] ${layoutPreset === preset.value ? "text-[#1534DC]" : "text-[#111A31]"}`}>
                      {preset.label}
                    </p>
                    <p className="text-[11px] text-[#111A31]/40 [font-family:var(--font-fira-sans)] mt-1">
                      {preset.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/60 [font-family:var(--font-figtree)] mb-2">
                Imagen de portada * (máx 2MB)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full aspect-[21/9] rounded-2xl border-2 border-dashed border-[#111A31]/15 hover:border-[#1534DC]/40 cursor-pointer overflow-hidden bg-[#111A31]/[0.02] flex items-center justify-center transition-colors"
              >
                {coverPreview ? (
                  <Image src={coverPreview} alt="Cover preview" fill className="object-cover" />
                ) : (
                  <div className="text-center">
                    <svg className="w-8 h-8 text-[#111A31]/20 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-[#111A31]/40 [font-family:var(--font-fira-sans)]">
                      Click para subir imagen de portada
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </div>

            {/* Gallery Images */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/60 [font-family:var(--font-figtree)] mb-2">
                Galería de imágenes * (mín 1, máx 2MB cada una)
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
                  <svg className="w-6 h-6 text-[#111A31]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </label>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#111A31]/60 [font-family:var(--font-figtree)] mb-2">
                Contenido *
              </label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Escribe el contenido de tu artículo..."
              />
              <p className="text-[11px] text-[#111A31]/30 [font-family:var(--font-fira-sans)] mt-2">
                Usa el toolbar para dar formato: negrita, cursiva, títulos, listas y enlaces.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-[#111A31]/8">
              <button
                type="submit"
                disabled={loading}
                onClick={() => setStatus("draft")}
                className="w-full sm:w-auto px-8 py-4 rounded-full border border-[#111A31]/15 text-[#111A31] text-sm font-bold [font-family:var(--font-figtree)] hover:border-[#111A31]/30 transition-all disabled:opacity-50"
              >
                {loading && status === "draft" ? "Guardando..." : "Guardar borrador"}
              </button>
              <button
                type="submit"
                disabled={loading}
                onClick={() => setStatus("published")}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#1534DC] hover:bg-[#1534DC]/90 text-white text-sm font-bold [font-family:var(--font-figtree)] transition-colors disabled:opacity-50"
              >
                {loading && status === "published" ? "Publicando..." : "Publicar artículo"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
