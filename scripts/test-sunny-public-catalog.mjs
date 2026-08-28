import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const paths = [
  "api/ai/sunny-obsidian-public.json",
  "artifacts/web/api/ai/sunny-obsidian-public.json",
  "artifacts/web/src/data/sunny-obsidian-public.json",
];
const files = paths.map((file) => fs.readFileSync(path.join(repositoryRoot, file), "utf8"));
assert.equal(new Set(files).size, 1, "all public catalog copies must be byte-identical");

const catalog = JSON.parse(files[0]);
assert.equal(catalog.version, 2);
assert.match(catalog.sourceSha256, /^[a-f0-9]{64}$/);
assert.equal(catalog.models.length, 94);
assert.equal(new Set(catalog.models.map((model) => model.id)).size, catalog.models.length);

const allowedKeys = [
  "dimensions",
  "family",
  "id",
  "model",
  "packageType",
  "verificationStatus",
  "websiteFamilyIds",
].sort();
for (const model of catalog.models) {
  assert.deepEqual(Object.keys(model).sort(), allowedKeys);
}

const modelText = JSON.stringify(catalog.models);
assert.doesNotMatch(
  modelText,
  /@|mailto:|https?:|customer|buyer|purchase order|invoice|price|cost|margin|password|secret|token|api.?key|고객|매입|매출|단가|수금|미수/i,
);

const digest = crypto.createHash("sha256").update(files[0]).digest("hex");
console.log(`Sunny public catalog tests passed: ${catalog.models.length} models, SHA-256 ${digest}`);
