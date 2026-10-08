import { createDirectus, rest, readItems, readItem } from '@directus/sdk';

export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar: string | null;
  role: string | null;
  social_links: Record<string, string> | null;
  user_id: string | null;
}

export interface NewsArticle {
  id: string;
  status: 'draft' | 'published' | 'archived';
  date_published: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  category: string | NewsCategory | null;
  read_time: number | null;
  author: string | null;
  author_id: string | Author | null;
  featured: boolean;
  tags: string[] | null;
  layout_preset: 'classic' | 'editorial' | 'magazine' | 'hero-split' | null;
  content_blocks: unknown[] | null;
  gallery_images: { image_id: string }[] | null;
}

interface Schema {
  news_categories: NewsCategory[];
  news_articles: NewsArticle[];
  authors: Author[];
}

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://2.25.128.2:8055';

const directus = createDirectus<Schema>(directusUrl).with(rest());

export default directus;
export { readItems, readItem };

export function getDirectusImageUrl(imageId: string) {
  if (!imageId) return null;
  // Proxy same-origin con token (`/api/newsroom/image/<id>`): el rol público
  // de Directus no puede leer `/assets`, y el asset va por HTTP (mixed content
  // en una página HTTPS). La ruta sirve el binario autenticado y same-origin,
  // así el optimizador de Next lo acepta sin remotePatterns.
  return `/api/newsroom/image/${imageId}`;
}
