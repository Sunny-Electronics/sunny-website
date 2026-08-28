# SunnyKR Project Rules

This project is SunnyKR.

SunnyKR is a public business website for approved company information, product guidance, public stock quantities, public documents, and RFQs.

SunnyKR is independent. Do not share its hostnames, tunnel routes, service labels, tokens, catalogs, environment variables, or model instructions with another project.

## Public boundary

- Never place customer, buyer, order, receivable, negotiated price, buy price, cost, margin, personal mailbox, credential, local path, or internal-system data in public code or files.
- Public pricing is limited to the approved, versioned Sunny estimate table. It must be labeled USD per unit, subject to EAU and final specification review, and must never be represented as a final or customer-specific price.
- Public stock is limited to stock number, Sunny part number, and quantity.
- Keep private admin and operational tools outside this public repository and deployment.
- The public Vercel handler is the AI security boundary. It must refuse private or unrelated requests before any model call.
- Production AI calls may use only `SUNNY_AI_BRIDGE_URL` and `SUNNY_AI_BRIDGE_TOKEN`, with the fixed route `https://bridge.sunnykr.com/sunny/chat`.
- The bridge must identify itself as project `sunnykr` and service `sunny-ai-bridge`. Otherwise the website must use the approved public-catalog fallback.
- Send only the sanitized Sunny public catalog and visitor-provided conversation to the bridge.

## Assistant

- Name: Sunny
- Public button text: Chat with Sunny
- Telegram: https://t.me/sunny_kr_bot
- Role: public electronics product guidance, RFQ support, crystal/oscillator guidance, and Sunny Electronics information support
- Tone: professional, helpful, concise, human sounding, business focused

## Workflow

Use the standard shared-device flow:

1. Keep the private source catalog in the SunnyKR Obsidian vault on Google Drive.
2. Run the allowlisted exporter and review the sanitized public JSON before committing it.
3. Use this GitHub repository as the code source of truth. Do not synchronize a live Git worktree through Google Drive.
4. Use one approved computer as the primary Sunny AI bridge host.
5. Use one separately tested computer as standby; never connect two hosts to the production name at the same time without an approved failover.
6. Use a separate development computer for review, not as the public production bridge.
7. Deploy only an approved GitHub `main` commit to Vercel.

Every computer starts by pulling the same approved Git commit and running the Sunny verification commands in `docs/work-home-workflow.md`.

Keep changes minimal, modular, maintainable, Sunny-only, fail closed, and inside the public-data boundary.
