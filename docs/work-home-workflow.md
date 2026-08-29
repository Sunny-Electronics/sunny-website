# SunnyKR: one system across three computers

## What this solves

SunnyKR must behave the same from every approved computer. The computers are access points; GitHub holds the approved website code, and the SunnyKR Google Drive folder holds the private source catalog.

No other project is allowed inside this route.

## One approved path

```text
Visitor
  -> sunnykr.com
  -> Vercel /api/ai/chat (privacy and Sunny-only gate)
  -> https://bridge.sunnykr.com/sunny/chat
  -> dedicated Sunny bridge
  -> approved Sunny local model
```

If the dedicated bridge is unavailable or fails identity verification, the website stays online and answers from the sanitized public Sunny catalog.

## Source-of-truth rules

- Private catalog source: SunnyKR Obsidian vault in the SunnyKR Google Drive folder.
- Official public product list: `api/ai/sunny-official-products.json` in GitHub. It contains the 96 approved models, four public product sections, official datasheet links, and public product images sourced from `sunny.co.kr`.
- Supplemental public catalog knowledge: `api/ai/sunny-obsidian-public.json` in GitHub. It adds reviewed package, dimensions, frequency, and verification information without exposing the private vault.
- Website code source: this GitHub repository.
- Production website: the Vercel project connected to GitHub `main`.
- Production AI origin: one dedicated Sunny bridge behind `bridge.sunnykr.com`.
- Secrets: device service settings and Vercel environment variables only. Never GitHub or Google Drive.

Do not put a Git worktree inside Google Drive. GitHub synchronizes code; Google Drive preserves the private source documents and recovery records.

## Device roles

### Primary bridge computer

- Primary 24-hour Sunny bridge.
- Uses the dedicated route `/sunny/chat` and a Sunny-only token.
- Loads only Sunny-approved public knowledge.

### Standby bridge computer

- Standby and testing bridge.
- Pulls the same approved Git commit and public catalog hash.
- Must use its own local service configuration and the same Sunny response identity.
- It is not connected to the production hostname unless John approves a controlled failover.

### Development and review computer

- Code review, catalog export, testing, and deployment review.
- Not a public production bridge.
- Pulls from GitHub and may export the sanitized catalog when the SunnyKR vault is mounted.

## First setup on any computer

1. Clone the Sunny repository or open its existing clean checkout.
2. Run `git fetch origin`.
3. Confirm the intended branch and run `git status --short --branch`.
4. Do not continue from a dirty checkout containing unrelated work.
5. Run `pnpm install` when dependencies are missing.
6. Run `pnpm sunny:check`.
7. Compare the current commit with the approved production commit before deployment.

## Updating supplemental Obsidian knowledge

1. Mount the SunnyKR Google Drive folder.
2. Run:

   ```text
   node scripts/export-sunny-public-catalog.mjs --vault "<Sunny Obsidian vault path>"
   ```

3. Review the Git diff. The export may contain only model, family, package type, dimensions, verification status, and website family IDs.
4. Run `pnpm sunny:check`.
5. Commit the reviewed JSON. Other computers pull the same committed artifact; they do not regenerate it automatically.

## Updating the official product list

The public Products page and Sunnychat use `api/ai/sunny-official-products.json` as the approved model list. The current scope is Crystal Units, Crystal Oscillators, VCXO, and TCXO & VCTCXO. MEMS oscillators and filters are excluded.

1. Review the original public `sunny.co.kr` product pages and each model's attached datasheet link.
2. Update the official JSON, keeping only public product information.
3. Store website-safe product images under `artifacts/web/public/catalog/products/`.
4. Run `pnpm sunny:sync` to copy the approved data into the web application.
5. Run `pnpm sunny:check`. The check must confirm 96 unique models, the four approved section counts, and one official PDF link per model.
6. Review the Git diff before committing. Never add email, customer, order, A/R, private pricing, or other private vault data.

## Production environment variables

Only these Sunny-specific variables are permitted:

```text
SUNNY_AI_BRIDGE_URL=https://bridge.sunnykr.com/sunny/chat
SUNNY_AI_BRIDGE_TOKEN=<stored only in Vercel and the dedicated Sunny service>
```

The public handler rejects shared or generic bridge variables, any other hostname, and any other path in production.

## Safe deployment

1. Start from current `origin/main` in a clean branch or worktree.
2. Run `pnpm sunny:check` and the web production build.
3. Push the review branch and verify the Vercel preview.
4. Confirm that private requests and unrelated questions never call the bridge.
5. Confirm that the bridge response identifies project `sunnykr` and service `sunny-ai-bridge`.
6. Merge only the reviewed Sunny files.
7. Verify the live website, catalog search, Enter-to-send, RFQ link, and fallback behavior.

## Failover rule

Moving production to the standby computer requires a deliberate change with a before-state record, test, approval, and rollback path. Do not run two unrelated tunnels or reuse another project's hostname as a shortcut.
