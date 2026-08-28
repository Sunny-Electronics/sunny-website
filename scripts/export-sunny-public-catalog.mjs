import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const args = process.argv.slice(2);

function readArgument(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : "";
}

const vaultPath = readArgument("--vault") || process.env.SUNNY_OBSIDIAN_VAULT_PATH || "";

if (!vaultPath) {
  throw new Error(
    "Provide the Sunny Obsidian vault with --vault or SUNNY_OBSIDIAN_VAULT_PATH.",
  );
}

const catalogRoot = path.join(vaultPath, "01 - Product Catalog");
const modelIndexPath = path.join(catalogRoot, "Model Index.md");

if (!fs.existsSync(modelIndexPath)) {
  throw new Error(`Sunny product Model Index was not found: ${modelIndexPath}`);
}

const allowedFamilies = new Set([
  "Ceramic Resonators",
  "Crystal Filters",
  "Crystal Oscillators",
  "Crystal Resonators",
  "TCXO & VCTCXO",
  "VCXO",
]);

const sensitivePattern =
  /@|mailto:|https?:|customer|buyer|purchase order|accounts? receivable|\bA\/R\b|invoice|price|cost|margin|password|secret|token|api.?key|고객|매입|매출|단가|수금|미수/i;
const phonePattern = /(?:\+?\d{1,3}[ .-]?)?(?:\(?\d{2,4}\)?[ .-]?)\d{3,4}[ .-]\d{4}\b/;

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function websiteFamilyIds(family, packageType) {
  if (family === "Crystal Oscillators") return ["smd-oscillators"];
  if (family === "TCXO & VCTCXO" || family === "VCXO") return ["tcxo-vctcxo"];
  if (family === "Crystal Filters") return ["filters-modules"];
  if (family === "Ceramic Resonators") return ["resonators"];
  if (family !== "Crystal Resonators") return [];

  if (/tuning fork/i.test(packageType)) return ["tuning-forks"];
  if (/ats lead|hc lead/i.test(packageType)) return ["through-hole-crystals"];
  return ["smd-crystals"];
}

function assertPublicRecord(record) {
  for (const [field, value] of Object.entries(record)) {
    const text = Array.isArray(value) ? value.join(" ") : String(value ?? "");
    if (sensitivePattern.test(text) || phonePattern.test(text)) {
      throw new Error(`Sensitive text was blocked in public catalog field ${field}.`);
    }
  }
}

const source = fs.readFileSync(modelIndexPath, "utf8");
const models = [];
let currentFamily = "";

for (const rawLine of source.split(/\r?\n/)) {
  const line = rawLine.trim();
  const familyMatch = line.match(/^###\s+(.+)$/);
  if (familyMatch) {
    currentFamily = familyMatch[1].trim();
    continue;
  }

  if (!line.startsWith("- [[") || !allowedFamilies.has(currentFamily)) continue;

  const modelMatch = line.match(/^- \[\[([^|\]]+)\|([^\]]+)\]\]\s+[—-]\s+([^;]+?)(?:;\s+(.+))?$/u);
  if (!modelMatch) continue;

  const [, noteTarget, model, packageType, dimensions = ""] = modelMatch;
  if (noteTarget.includes("..") || path.isAbsolute(noteTarget)) {
    throw new Error(`Unsafe Obsidian note target was blocked: ${noteTarget}`);
  }

  const record = {
    id: slugify(model),
    model: model.trim(),
    family: currentFamily,
    packageType: packageType.trim(),
    dimensions: dimensions.trim(),
    verificationStatus: "catalog-verified",
    websiteFamilyIds: websiteFamilyIds(currentFamily, packageType),
  };

  assertPublicRecord(record);
  models.push(record);
}

if (models.length < 25) {
  throw new Error(`Only ${models.length} public models were parsed; export stopped for review.`);
}

const duplicateModels = models.filter(
  (model, index) => models.findIndex((candidate) => candidate.id === model.id) !== index,
);
if (duplicateModels.length) {
  throw new Error(`Duplicate public model IDs were blocked: ${duplicateModels.map((item) => item.id).join(", ")}`);
}

const payload = {
  version: 2,
  source: "Sunny approved public product catalog",
  sourceSha256: crypto.createHash("sha256").update(source, "utf8").digest("hex"),
  privacy: {
    status: "sanitized-public",
    exportedFields: [
      "model",
      "family",
      "packageType",
      "dimensions",
      "verificationStatus",
      "websiteFamilyIds",
    ],
    excluded: [
      "customer names",
      "email addresses",
      "prices and costs",
      "orders and invoices",
      "accounts receivable",
      "private commercial notes",
    ],
  },
  models: models.sort((a, b) => a.model.localeCompare(b.model)),
};

const serialized = `${JSON.stringify(payload, null, 2)}\n`;
const outputPaths = [
  path.join(repositoryRoot, "api", "ai", "sunny-obsidian-public.json"),
  path.join(repositoryRoot, "artifacts", "web", "api", "ai", "sunny-obsidian-public.json"),
  path.join(repositoryRoot, "artifacts", "web", "src", "data", "sunny-obsidian-public.json"),
];

for (const outputPath of outputPaths) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, serialized, "utf8");
}

console.log(`Exported ${models.length} sanitized Sunny catalog models.`);
for (const outputPath of outputPaths) {
  console.log(path.relative(repositoryRoot, outputPath));
}
