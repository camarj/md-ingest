/**
 * Fetch markdown content from a URL using Jina AI Reader API.
 * Falls back to basic fetch + title extraction if Jina fails.
 */
export async function fetchMarkdown(url) {
  const jinaUrl = `https://r.jina.ai/${url}`;

  try {
    const res = await fetch(jinaUrl, {
      headers: { "Accept": "text/plain" },
    });

    if (!res.ok) {
      throw new Error(`Jina API returned ${res.status}`);
    }

    const text = await res.text();
    return parseJinaResponse(text, url);
  } catch (err) {
    console.warn(`⚠️  Jina API failed (${err.message}), falling back to basic fetch...`);
    return fetchBasic(url);
  }
}

/**
 * Parse Jina AI Reader response.
 * Format: "Title: <title>\n\n<markdown content>"
 */
function parseJinaResponse(text, originalUrl) {
  const lines = text.split("\n");
  let title = "";
  let contentStart = 0;

  // Jina prepends "Title: " on the first line
  if (lines[0]?.startsWith("Title: ")) {
    title = lines[0].slice(7).trim();
    contentStart = 2; // skip title line + empty line
  }

  const content = lines.slice(contentStart).join("\n").trim();

  return {
    title: title || "Untitled",
    content: content || "(no content extracted)",
    source: originalUrl,
  };
}

/**
 * Fallback: basic fetch + extract title from HTML.
 */
async function fetchBasic(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim() || "Untitled";

  // Very basic HTML-to-text: remove tags
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    title,
    content: text.slice(0, 5000), // cap fallback
    source: url,
  };
}
