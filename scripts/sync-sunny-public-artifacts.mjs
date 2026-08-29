import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const copies = [
  ["api/ai/chat.js", "artifacts/web/api/ai/chat.js"],
  ["api/ai/sunny-assistant.md", "artifacts/web/api/ai/sunny-assistant.md"],
  [
    "api/ai/sunny-brain-public.json",
    "artifacts/web/api/ai/sunny-brain-public.json",
  ],
  ["api/ai/sunny-catalog.json", "artifacts/web/api/ai/sunny-catalog.json"],
  [
    "api/ai/sunny-official-products.json",
    "artifacts/web/api/ai/sunny-official-products.json",
  ],
  [
    "api/ai/sunny-official-products.json",
    "artifacts/web/src/data/sunny-official-products.json",
  ],
  [
    "api/ai/sunny-obsidian-public.json",
    "artifacts/web/api/ai/sunny-obsidian-public.json",
  ],
  [
    "api/ai/sunny-obsidian-public.json",
    "artifacts/web/src/data/sunny-obsidian-public.json",
  ],
  [
    "api/ai/sunny-public-knowledge.json",
    "artifacts/web/api/ai/sunny-public-knowledge.json",
  ],
  [
    "api/ai/sunny-public-prices.json",
    "artifacts/web/api/ai/sunny-public-prices.json",
  ],
  [
    "api/ai/sunny-public-prices.json",
    "artifacts/web/src/data/sunny-public-prices.json",
  ],
];

for (const [sourceRelative, targetRelative] of copies) {
  const source = path.join(repositoryRoot, sourceRelative);
  const target = path.join(repositoryRoot, targetRelative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  console.log(`${sourceRelative} -> ${targetRelative}`);
}
