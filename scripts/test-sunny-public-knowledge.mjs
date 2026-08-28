import assert from "node:assert/strict";
import fs from "node:fs";

const root = fs.readFileSync(
  new URL("../api/ai/sunny-public-knowledge.json", import.meta.url),
  "utf8",
);
const web = fs.readFileSync(
  new URL(
    "../artifacts/web/api/ai/sunny-public-knowledge.json",
    import.meta.url,
  ),
  "utf8",
);
assert.equal(root, web, "Sunny public knowledge copies must be byte-identical");

const knowledge = JSON.parse(root);
assert.equal(knowledge.schemaVersion, 1);
assert.match(knowledge.sourceSha256, /^[a-f0-9]{64}$/);
assert.ok(knowledge.records.length >= 250);
assert.equal(
  new Set(knowledge.records.map((record) => record.id)).size,
  knowledge.records.length,
);

const blocked =
  /@|mailto:|https?:|customer|buyer|purchase order|invoice|\bprice\b|\bcost\b|margin|password|secret|token|api.?key|accounts? receivable|[A-Z]:\\|\/Users\/|\/home\/|Google Drive|Obsidian - Sunny Vault|고객|매입|매출|단가|수금|미수/i;
assert.doesNotMatch(JSON.stringify(knowledge.records), blocked);
for (const record of knowledge.records) {
  assert.deepEqual(Object.keys(record).sort(), [
    "citation",
    "dimensions",
    "id",
    "model",
    "packageType",
    "section",
    "text",
    "verificationStatus",
  ]);
  assert.equal(record.verificationStatus, "catalog-verified");
  assert.ok(record.text.length <= 1800);
}

assert.ok(
  knowledge.records.some(
    (record) =>
      record.model === "SX-32" && /12\.000.?54\.000 MHz/i.test(record.text),
  ),
);
assert.ok(
  knowledge.records.some(
    (record) =>
      record.model === "SCO-32" && /1\.8 VDC[\s\S]*5\.0 VDC/i.test(record.text),
  ),
);

console.log(
  `Sunny public knowledge tests passed: ${knowledge.records.length} records.`,
);
