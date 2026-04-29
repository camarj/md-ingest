import yaml from "js-yaml";

/**
 * Generate a structured Markdown document with YAML frontmatter.
 */
export function formatDocument({ title, content, source, classification }) {
  const date = today();
  const safeTitle = (title || "Untitled").slice(0, 120);
  const filename = `${date}-${slug(safeTitle)}.md`;

  const frontmatter = {
    title: safeTitle,
    source,
    date_ingested: date,
    status: "pending",
    tags: [],
  };

  if (classification?.category) {
    frontmatter.category = classification.category;
  }

  if (classification?.summary) {
    frontmatter.summary = classification.summary.slice(0, 300);
  }

  if (classification?.tags?.length) {
    frontmatter.tags = classification.tags;
  }

  const body = `---
${yaml.dump(frontmatter).trim()}
---

🔗 **Source:** ${source}

${content}
`;

  return { filename, body };
}

function slug(text, max = 60) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, max);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
