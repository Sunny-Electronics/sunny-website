import assert from "node:assert/strict";
import fs from "node:fs";

const table = JSON.parse(
  fs.readFileSync(new URL("../api/ai/sunny-public-prices.json", import.meta.url), "utf8"),
);
const quoteTypesSource = fs.readFileSync(
  new URL("../artifacts/web/src/data/quote-types.ts", import.meta.url),
  "utf8",
);

assert.equal(table.schemaVersion, 1);
assert.equal(table.publishedDate, "2026-08-28");
assert.equal(table.currency, "USD");
assert.equal(table.unit, "per unit");
assert.match(table.disclaimer, /EAU \(Expected Annual Usage\)/);
assert.equal(table.entries.length, 27);
assert.equal(new Set(table.entries.map((entry) => entry.id)).size, table.entries.length);

for (const entry of table.entries) {
  assert.deepEqual(
    Object.keys(entry).filter((key) => /customer|buyer|cost|margin|order|invoice/i.test(key)),
    [],
  );
  assert.equal(typeof entry.model, "string");
  assert.ok(entry.unitPriceUsd > 0);
  assert.ok(Number.isInteger(entry.spq) && entry.spq > 0);
  assert.ok(Number.isInteger(entry.moq) && entry.moq > 0);
}

function entry(id) {
  return table.entries.find((candidate) => candidate.id === id);
}

assert.deepEqual(
  [entry("sx-3-low").unitPriceUsd, entry("sx-3-high").unitPriceUsd],
  [0.095, 0.085],
);
assert.equal(entry("ats-49u-16mm-insulator-taping").unitPriceUsd, 0.09);
assert.deepEqual(
  [entry("sco-32").unitPriceUsd, entry("sco-32").spq, entry("sco-32").moq],
  [0.26, 3000, 3000],
);
assert.deepEqual(
  [entry("cs-3215").loadCapacitance, entry("cs-3215").tolerance],
  ["12.5 pF", "+/-20 ppm"],
);
for (const model of ["CS-146", "CS-306", "CS-405", "CS-519"]) {
  assert.ok(table.submitForPriceModels.includes(model));
}
for (const family of ["VCXO", "TCXO"]) {
  assert.ok(table.submitForPriceFamilies.includes(family));
}

function optionBlock(typeId) {
  const start = quoteTypesSource.indexOf(`id: "${typeId}"`);
  assert.notEqual(start, -1, `Missing quote type: ${typeId}`);
  const next = quoteTypesSource.indexOf("\n  {\n    id:", start + 1);
  const section = quoteTypesSource.slice(start, next === -1 ? undefined : next);
  const match = section.match(/options:\s*\[([\s\S]*?)\]/);
  assert.ok(match, `Missing primary options for quote type: ${typeId}`);
  return [...match[1].matchAll(/"([^"]+)"/g)].map((value) => value[1]);
}

for (const typeId of ["ats", "smd-crystal", "smd-oscillator", "tuning-fork"]) {
  const choices = optionBlock(typeId);
  const pricedModels = new Set(
    table.entries.filter((candidate) => candidate.quoteType === typeId).map((candidate) => candidate.model),
  );
  for (const model of pricedModels) {
    assert.ok(
      choices.some((choice) => choice.toUpperCase().startsWith(model.toUpperCase())),
      `${model} has a public estimate but is not selectable under ${typeId}`,
    );
  }
}

console.log("Sunny public estimate price-table tests passed.");
