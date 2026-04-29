/**
 * Optional classification using Claude (Anthropic API).
 * Falls back gracefully if API key is missing or call fails.
 */

const SYSTEM = `Eres un clasificador de contenido web para un knowledge base personal.

Tareas:
1. Asignar UNA categoría: "ai", "software-dev", "product", "finance", "business", "other".
2. Generar un resumen de máximo 2 oraciones en español.
3. Extraer hasta 5 tags relevantes en kebab-case.

Responde SOLO JSON válido con este schema, sin markdown ni code fences:
{"category": "ai|software-dev|product|finance|business|other", "summary": "resumen en español", "tags": ["tag-1", "tag-2"]}

NO envuelvas la respuesta en bloques de codigo markdown ni comentarios. Solo el JSON crudo.`;

export async function classifyContent(text, model = "claude-haiku-4-5-20251001") {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("⚠️  ANTHROPIC_API_KEY not set — skipping classification");
    return null;
  }

  const truncated = text.slice(0, 8000); // stay within context limits

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: SYSTEM,
        messages: [
          { role: "user", content: truncated },
          { role: "assistant", content: "{" },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Claude API ${res.status}: ${err.slice(0, 200)}`);
    }

    const data = await res.json();
    const raw = data.content?.[0]?.text || "";
    const reconstructed = "{" + raw;

    const cleaned = reconstructed
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    const validCategories = ["ai", "software-dev", "product", "finance", "business", "other"];
    if (!validCategories.includes(parsed.category)) {
      parsed.category = "other";
    }

    return {
      category: parsed.category,
      summary: parsed.summary || null,
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
    };
  } catch (err) {
    console.warn("⚠️  Classification failed:", err.message);
    return null;
  }
}
