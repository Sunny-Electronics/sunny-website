import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const args = process.argv.slice(2);

function readArgument(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : "";
}

const vaultPath =
  readArgument("--vault") || process.env.SUNNY_OBSIDIAN_VAULT_PATH || "";
if (!vaultPath) {
  throw new Error(
    "Provide the Sunny Obsidian vault with --vault or SUNNY_OBSIDIAN_VAULT_PATH.",
  );
}

const catalogRoot = path.resolve(vaultPath, "01 - Product Catalog");
const modelIndexPath = path.join(catalogRoot, "Model Index.md");
if (!fs.existsSync(modelIndexPath))
  throw new Error("The Sunny Model Index was not found.");

const allowedNotePattern = /^(?:00|01|02|03|04) - .*\.md$/;
const blockedLinePattern =
  /@|mailto:|https?:|customer|buyer|purchase order|invoice|\bprice\b|\bcost\b|margin|password|secret|token|api.?key|accounts? receivable|\bA\/R\b|고객|매입|매출|단가|수금|미수/i;
const blockedPathPattern =
  /(?:[A-Z]:\\|\/Users\/|\/home\/|Google Drive|Obsidian - Sunny Vault)/i;

function parseFrontmatter(source) {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const values = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([a-z0-9_]+):\s*(.*)$/i);
    if (field) values[field[1]] = field[2].trim();
  }
  return values;
}

function sourceCitation(frontmatter) {
  const document = String(
    frontmatter.source_document || "Sunny Electronics E-Catalog 2023",
  )
    .replace(/[\[\]"]/g, "")
    .trim();
  const rawPages =
    frontmatter.source_pages || frontmatter.source_pdf_pages || "";
  const pages = String(rawPages).match(/\d+/g) || [];
  return pages.length
    ? `${document}, page${pages.length > 1 ? "s" : ""} ${pages.join(", ")}`
    : document;
}

function cleanLine(line) {
  return line
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/^>\s?/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function publicTechnicalText(source) {
  const body = source.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*/, "");
  const lines = [];
  for (const rawLine of body.split(/\r?\n/)) {
    const line = cleanLine(rawLine);
    if (!line || /^#+\s+(?:boundaries|links|source|back to)/i.test(line))
      continue;
    if (/^(?:source|back to):/i.test(line)) continue;
    if (blockedLinePattern.test(line) || blockedPathPattern.test(line))
      continue;
    lines.push(line);
  }
  return lines.join("\n").slice(0, 1800).trim();
}

function ensureInsideCatalog(target) {
  const resolved = path.resolve(target);
  if (!resolved.startsWith(`${catalogRoot}${path.sep}`)) {
    throw new Error(
      "A Sunny knowledge path escaped the approved Product Catalog folder.",
    );
  }
  return resolved;
}

const indexSource = fs.readFileSync(modelIndexPath, "utf8");
const modelLinks = [
  ...indexSource.matchAll(
    /^- \[\[([^|\]]+)\|([^\]]+)\]\]\s+[—-]\s+([^;]+?)(?:;\s+(.+))?$/gmu,
  ),
];
const records = [];
const sourceHash = crypto.createHash("sha256");

for (const [, noteTarget, model, packageType, dimensions = ""] of modelLinks) {
  if (noteTarget.includes("..") || path.isAbsolute(noteTarget)) {
    throw new Error(`Unsafe Sunny knowledge target was blocked: ${noteTarget}`);
  }
  const modelNotePath = ensureInsideCatalog(
    path.join(catalogRoot, `${noteTarget}.md`),
  );
  if (!fs.existsSync(modelNotePath))
    throw new Error(`Sunny model note was not found: ${model}`);
  const modelDirectory = path.dirname(modelNotePath);
  const noteFiles = fs
    .readdirSync(modelDirectory)
    .filter((name) => allowedNotePattern.test(name))
    .sort();

  for (const noteFile of noteFiles) {
    const notePath = ensureInsideCatalog(path.join(modelDirectory, noteFile));
    const source = fs.readFileSync(notePath, "utf8");
    const frontmatter = parseFrontmatter(source);
    if (frontmatter.verification_status !== "catalog-verified") continue;
    const text = publicTechnicalText(source);
    if (!text) continue;
    if (blockedLinePattern.test(text) || blockedPathPattern.test(text)) {
      throw new Error(
        `Sensitive content survived Sunny public knowledge filtering for ${model}.`,
      );
    }
    sourceHash.update(noteFile).update("\0").update(source).update("\0");
    const section = (
      text.match(/^#\s+(.+)$/m)?.[1] || noteFile.replace(/\.md$/, "")
    ).trim();
    records.push({
      id: `${String(model)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${noteFile.slice(0, 2)}`,
      model: String(model).trim(),
      packageType: String(packageType).trim(),
      dimensions: String(dimensions).trim(),
      section,
      text,
      citation: sourceCitation(frontmatter),
      verificationStatus: "catalog-verified",
    });
  }
}

if (records.length < 250) {
  throw new Error(
    `Only ${records.length} verified Sunny knowledge records were exported; review required.`,
  );
}
if (new Set(records.map((record) => record.id)).size !== records.length) {
  throw new Error("Duplicate Sunny public knowledge record IDs were blocked.");
}

const payload = {
  schemaVersion: 1,
  source: "Sunny approved catalog-verified product notes",
  sourceSha256: sourceHash.digest("hex"),
  privacy: {
    status: "sanitized-public",
    sourceBoundary:
      "01 - Product Catalog model notes linked from Model Index only",
    customerAndCommercialData: "excluded",
  },
  records,
};

const serialized = `${JSON.stringify(payload, null, 2)}\n`;
const outputs = [
  path.join(repositoryRoot, "api", "ai", "sunny-public-knowledge.json"),
  path.join(
    repositoryRoot,
    "artifacts",
    "web",
    "api",
    "ai",
    "sunny-public-knowledge.json",
  ),
];
for (const output of outputs) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, serialized, "utf8");
}

console.log(`Exported ${records.length} sanitized Sunny knowledge records.`);
for (const output of outputs)
  console.log(path.relative(repositoryRoot, output));
