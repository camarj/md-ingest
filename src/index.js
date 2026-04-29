import { fetchMarkdown } from "./fetcher.js";
import { formatDocument } from "./formatter.js";
import { classifyContent } from "./classifier.js";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Ingest a URL into structured Markdown.
 */
export async function ingestUrl({
  url,
  outputDir = ".",
  titleOverride,
  classify = false,
  claudeModel,
}) {
  const { title, content, source } = await fetchMarkdown(url);

  let classification = null;
  if (classify) {
    classification = await classifyContent(content, claudeModel);
  }

  const doc = formatDocument({
    title: titleOverride || title,
    content,
    source,
    classification,
  });

  const filepath = await writeFile(doc, outputDir);
  return { filepath, classification };
}

/**
 * Ingest content from stdin or direct input.
 */
export async function ingestStdin({
  title,
  content,
  source,
  outputDir = ".",
  classify = false,
  claudeModel,
}) {
  let classification = null;
  if (classify) {
    classification = await classifyContent(content, claudeModel);
  }

  const doc = formatDocument({
    title,
    content,
    source,
    classification,
  });

  const filepath = await writeFile(doc, outputDir);
  return { filepath, classification };
}

async function writeFile(doc, outputDir) {
  await fs.mkdir(outputDir, { recursive: true });
  const filepath = path.join(outputDir, doc.filename);
  await fs.writeFile(filepath, doc.body, "utf8");
  return filepath;
}
