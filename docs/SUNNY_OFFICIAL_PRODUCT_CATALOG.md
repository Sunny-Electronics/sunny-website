# SunnyKR official public product catalog

## Purpose

This catalog gives the SunnyKR Products page, quote forms, search, and Sunnychat one approved public list of Sunny frequency-control products.

## Approved public scope

| Section | Models |
| --- | ---: |
| Crystal Units | 23 |
| Crystal Oscillators | 41 |
| VCXO | 22 |
| TCXO & VCTCXO | 10 |
| **Total** | **96** |

Tuning-fork crystals are included under Crystal Units. MEMS oscillators and filters are not included.

## Source and files

- Public source: the English product pages and model detail pages on `sunny.co.kr`.
- Approved data: `api/ai/sunny-official-products.json`.
- Website copy: `artifacts/web/src/data/sunny-official-products.json`.
- AI endpoint copy: `artifacts/web/api/ai/sunny-official-products.json`.
- Public product images: `artifacts/web/public/catalog/products/`.
- Each model record contains its official attached-datasheet PDF link from the original Sunny website.

The public product list is authoritative for which models appear. The sanitized Obsidian export may supplement a model with reviewed package, dimensions, frequency, and verification data. The production website never reads the private Obsidian vault directly.

## Privacy boundary

Only public product facts may enter this file. Never include customer names, customer emails, inquiry history, order data, A/R data, private prices, internal costs, margins, API keys, or any private vault note.

## Verification

Run:

```text
pnpm sunny:check
```

The automated catalog check verifies the exact four section counts, 96 unique products, exclusion of MEMS and filters, one PDF URL for every model, and one local product image for every model.
