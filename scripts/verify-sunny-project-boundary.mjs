import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtimeFiles = [
  ".env.example",
  "api/ai/chat.js",
  "artifacts/web/api/ai/chat.js",
  "api/ai/sunny-assistant.md",
  "artifacts/web/api/ai/sunny-assistant.md",
];
const forbidden = [
  /\bAI_BRIDGE_URL\b/,
  /\bAI_BRIDGE_TOKEN\b/,
  /\bOPENCLAW_URL\b/,
  /\bOPENCLAW_API_KEY\b/,
];

for (const relativePath of runtimeFiles) {
  const text = fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
  for (const pattern of forbidden) {
    assert.doesNotMatch(text, pattern, `${relativePath} contains a shared or cross-project bridge reference`);
  }
}

const rootHandler = fs.readFileSync(path.join(repositoryRoot, "api/ai/chat.js"));
const webHandler = fs.readFileSync(path.join(repositoryRoot, "artifacts/web/api/ai/chat.js"));
assert.equal(rootHandler.equals(webHandler), true, "the two Vercel handler copies must match");

const rootCatalog = fs.readFileSync(path.join(repositoryRoot, "api/ai/sunny-catalog.json"));
const webCatalog = fs.readFileSync(path.join(repositoryRoot, "artifacts/web/api/ai/sunny-catalog.json"));
assert.equal(rootCatalog.equals(webCatalog), true, "the two legacy catalog copies must match");

console.log("Sunny project boundary verification passed.");
