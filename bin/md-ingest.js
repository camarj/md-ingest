#!/usr/bin/env node

import { program } from "commander";
import { ingestUrl, ingestStdin } from "../src/index.js";

program
  .name("md-ingest")
  .description("Ingest any URL into structured Markdown with YAML frontmatter")
  .version("1.0.0");

program
  .argument("[url]", "URL to ingest")
  .option("-o, --output <dir>", "output directory", ".")
  .option("-t, --title <title>", "override title")
  .option("-c, --classify", "classify and summarize with Claude (requires ANTHROPIC_API_KEY)")
  .option("--claude-model <model>", "Claude model for classification", "claude-haiku-4-5-20251001")
  .option("--stdin", "read content from stdin instead of URL")
  .option("--content <text>", "content text (use with --stdin)")
  .option("--source <source>", "source URL (use with --stdin)")
  .action(async (url, options) => {
    try {
      if (options.stdin) {
        if (!options.content || !options.source) {
          console.error("❌ --stdin requires --content and --source");
          process.exit(1);
        }
        const result = await ingestStdin({
          title: options.title,
          content: options.content,
          source: options.source,
          outputDir: options.output,
          classify: options.classify,
          claudeModel: options.claudeModel,
        });
        console.log(`✅ Ingested: ${result.filepath}`);
      } else if (url) {
        const result = await ingestUrl({
          url,
          outputDir: options.output,
          titleOverride: options.title,
          classify: options.classify,
          claudeModel: options.claudeModel,
        });
        console.log(`✅ Ingested: ${result.filepath}`);
        if (result.classification) {
          console.log(`   📂 Category: ${result.classification.category}`);
          if (result.classification.summary) {
            console.log(`   📝 Summary: ${result.classification.summary.slice(0, 100)}...`);
          }
        }
      } else {
        program.help();
      }
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
