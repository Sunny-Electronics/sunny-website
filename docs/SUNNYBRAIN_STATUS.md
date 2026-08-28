# SunnyBrain Status

Last updated: 2026-08-29 08:41 KST

## Current status

Implementation in progress on the Sunny-only development branch. Gemma is the selected primary conversation provider. GPT-5.6 Luna is documented as an optional disabled fallback and is not billed or called.

## Previous status

Sunnychat used the dedicated Sunny bridge and a sanitized 94-model catalog snapshot. Public price matching could fall back to a default model price when a frequency had no explicit match.

## Changes in this release

- Added a public SunnyBrain authority, privacy, quoting, part-number, compatibility, learning, and model policy.
- Added fail-closed public price eligibility.
- Added a sanitized public technical-knowledge export from catalog-verified model notes.
- Added Gemma-first request policy with deterministic local fallback.
- Added portable Sunnychat copy, export, import, same-browser restore, and new-session controls.
- Added recovery and system-map documentation.

## Open items

- The approved developed-standard-frequency lists are not yet complete for every priced model. Unproven combinations remain Submit for Price.
- GPT-5.6 Luna API integration is intentionally deferred and disabled.
- Production deployment requires final tests, review, commit, push, and live verification.

## Exact next actions

1. Run the full Sunny verification suite.
2. Correct any failures.
3. Build the production website locally.
4. Review the public generated files and Git diff for privacy.
5. Commit and push the approved branch.
6. Verify the deployment and test Sunnychat, 100 MHz quote rejection, session export/import, and RFQ delivery.
