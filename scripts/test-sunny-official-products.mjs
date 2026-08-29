import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const catalogPath = path.join(
  repositoryRoot,
  "api",
  "ai",
  "sunny-official-products.json",
);
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

const expectedCounts = {
  "Crystal Units": 23,
  "Crystal Oscillators": 41,
  VCXO: 22,
  "TCXO & VCTCXO": 10,
};

assert.equal(catalog.products.length, 96);
assert.deepEqual(catalog.sectionCounts, expectedCounts);
assert.equal(new Set(catalog.products.map((product) => product.id)).size, 96);
assert.equal(new Set(catalog.products.map((product) => product.model)).size, 96);

for (const product of catalog.products) {
  assert.ok(expectedCounts[product.section], `Unexpected section ${product.section}`);
  assert.ok(product.model);
  assert.ok(product.deviceType);
  assert.ok(product.datasheetName.toLowerCase().endsWith(".pdf"));
  assert.match(
    product.datasheetUrl,
    /^http:\/\/(?:www\.)?sunny\.co\.kr\/html\/goods_download\.php\?/,
  );
  assert.doesNotMatch(
    `${product.model} ${product.section} ${product.deviceType}`,
    /MEMS|Filter/i,
  );

  const imagePath = path.join(
    repositoryRoot,
    "artifacts",
    "web",
    "public",
    product.imagePath.replace(/^\//, ""),
  );
  assert.ok(fs.existsSync(imagePath), `Missing image ${product.imagePath}`);
  assert.ok(fs.statSync(imagePath).size > 100, `Empty image ${product.imagePath}`);
}

console.log(
  `Sunny official product catalog passed: ${catalog.products.length} models, 4 sections, 96 datasheets.`,
);
