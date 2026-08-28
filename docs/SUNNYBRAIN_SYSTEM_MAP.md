# SunnyBrain System Map

Last updated: 2026-08-29 08:41 KST

## Purpose

SunnyBrain is the Sunny-only decision and knowledge layer used by Sunnychat, public quote forms, and part-number guidance.

## Authority order

1. Approved deterministic Sunny rules.
2. Catalog-verified public Sunny knowledge.
3. Approved public estimate-price table.
4. Gemma conversation output.

The language model never outranks a verified rule or source.

## Data flow

```text
Private authoritative Sunny vault
  -> allowlisted exporter
  -> sanitized public catalog and technical knowledge JSON
  -> privacy and regression checks
  -> Git review and approved deployment
  -> Sunnychat / quotes / part-number guidance
```

The production website does not read the private vault. It receives only reviewed generated public JSON.

## Model policy

- Primary conversation provider: Gemma through the dedicated Sunny bridge.
- Safe fallback: deterministic public Sunny answers when Gemma is unavailable.
- Future optional fallback: GPT-5.6 Luna, currently disabled.
- Luna requires separate approval for API billing, spending limits, credentials, tests, and activation.

## Commercial decisions

- A catalog frequency range proves capability only. It does not prove that every frequency is a developed standard frequency.
- An estimated price appears only after an explicit approved price rule matches the frequency and required specifications.
- Missing, unknown, unmatched, and non-standard configurations use **Submit for Price**.
- EAU means Expected Annual Usage and is required for final price confirmation.
- Public stock is limited to stock number, Sunny part number, and quantity.

## Privacy boundary

Never export customer identity, contact data, orders, invoices, A/R, buy price, cost, margins, pricing formulas, credentials, internal infrastructure, or private vault notes.

## Knowledge improvement

Uncertain questions go to the Sunny Review Flags or Inbox. A correction becomes public knowledge only after source review, John approval where required, export, privacy review, and a regression test.
