import { getDirectusToken } from "./directus-auth";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://2.25.128.2:8055";

async function getHeaders() {
  const headers: Record<string, string> = {};
  const token = await getDirectusToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export type UserRole = "author" | "editor" | "admin";

export interface AuthorWithRole {
  id: string;
  user_id: string;
  name: string;
  role: UserRole;
}

export async function getAuthorByUserId(userId: string): Promise<AuthorWithRole | null> {
  try {
    const res = await fetch(
      `${DIRECTUS_URL}/items/authors?filter[user_id][_eq]=${userId}&limit=1&fields=id,user_id,name,role`,
      { headers: await getHeaders(), cache: "no-store" }
    );
    const data = await res.json().catch(() => ({ data: [] }));
    const author = data.data?.[0];
    if (!author) return null;
    return {
      id: author.id,
      user_id: author.user_id,
      name: author.name,
      role: (author.role || "author") as UserRole,
    };
  } catch {
    return null;
  }
}

export function isAdmin(role: UserRole): boolean {
  return role === "admin" || role === "editor";
}
