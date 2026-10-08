// ----------------------------------------------------------------------
// Cliente de embeddings para el RAG de Shifty.
// Usa OpenRouter (el mismo provider de Cerebro) para no depender de
// OpenAI directo. La respuesta del chat sigue saliendo de Cerebro.
// Endpoint: https://openrouter.ai/api/v1/embeddings
// Modelo default: openai/text-embedding-3-small (1536 dims).
// ----------------------------------------------------------------------

const MODEL = "openai/text-embedding-3-small";
const DIMENSIONS = 1536;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error(
      "OPENROUTER_API_KEY no está configurada. Se necesita para generar embeddings del RAG.",
    );
  }
  return key;
}

interface OpenRouterEmbeddingResponse {
  data?: Array<{ index: number; embedding: number[] }>;
  error?: { message: string };
}

async function createEmbeddings(inputs: string[]): Promise<number[][]> {
  const trimmed = inputs.map((t) => t.trim()).filter(Boolean);
  if (trimmed.length === 0) return [];

  const res = await fetch(`${OPENROUTER_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      // OpenRouter recomienda estos headers para stats y rate limits
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://shiftlatam.agency",
      "X-Title": "Shift Latam RAG",
    },
    body: JSON.stringify({
      model: MODEL,
      input: trimmed,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter embeddings error ${res.status}: ${text.slice(0, 500)}`);
  }

  const json = (await res.json()) as OpenRouterEmbeddingResponse;
  if (json.error) {
    throw new Error(`OpenRouter embeddings error: ${json.error.message}`);
  }

  const data = json.data ?? [];
  data.sort((a, b) => a.index - b.index);
  return data.map((d) => d.embedding);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  return createEmbeddings(texts);
}

export async function embedText(text: string): Promise<number[]> {
  const [embedding] = await createEmbeddings([text]);
  return embedding;
}

export { MODEL, DIMENSIONS };
