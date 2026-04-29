# md-ingest

> CLI to ingest any URL into structured Markdown with YAML frontmatter. Built for Obsidian, knowledge bases, and Claude Code projects.

![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## Why

Every knowledge base starts with "I'll save this article to read later." Then it becomes a folder of 200 bookmarks and zero notes.

`md-ingest` converts any URL into a clean Markdown file with frontmatter — ready for your wiki, your agent, or your second brain.

## Install

```bash
npm install -g md-ingest
```

Or use directly with `npx`:

```bash
npx md-ingest https://example.com/article
```

## Usage

### Basic — URL to Markdown

```bash
md-ingest https://example.com/article
# → writes 2025-01-15-article-title.md in current directory
```

### With output directory

```bash
md-ingest https://example.com/article -o ~/Documents/Cortex/raw/
```

### With AI classification (Claude)

```bash
export ANTHROPIC_API_KEY=sk-ant-...
md-ingest https://example.com/article --classify
# → adds category, summary, and tags to frontmatter
```

### From stdin (for piping)

```bash
md-ingest --stdin --title "My Note" --content "..." --source "https://example.com"
```

## Output

```markdown
---
title: "Article Title"
source: "https://example.com/article"
date_ingested: "2025-01-15"
status: "pending"
category: "ai"
summary: "Overview of the article in Spanish"
tags:
  - machine-learning
  - tutorial
---

🔗 **Source:** https://example.com/article

# Article Title

Clean markdown content here...
```

## How it works

```
URL → Jina AI Reader API → Markdown content
                              ↓
                    Optional: Claude classification
                              ↓
                    YAML frontmatter + body
                              ↓
                    Written to filesystem
```

- Uses [Jina AI Reader](https://r.jina.ai) for fast, clean extraction
- Falls back to basic fetch if Jina is unavailable
- Optional Claude classification adds category, summary, and tags
- Zero native dependencies — pure Node.js

## Options

```
Usage: md-ingest [options] [url]

Options:
  -V, --version             output the version number
  -o, --output <dir>        output directory (default: ".")
  -t, --title <title>       override title
  -c, --classify            classify with Claude (requires ANTHROPIC_API_KEY)
  --claude-model <model>    Claude model (default: "claude-haiku-4-5-20251001")
  --stdin                   read from stdin
  --content <text>          content text (with --stdin)
  --source <source>         source URL (with --stdin)
  -h, --help                display help for command
```

## Use cases

- **Obsidian / Logseq users** who want clean imports
- **Claude Code projects** that need structured raw inputs
- **Knowledge base maintainers** building a personal wiki
- **LLM pipelines** that need web content in markdown format

## License

MIT © [Raúl Camacho](https://github.com/camarj)
