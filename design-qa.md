# Design QA — SunnyKR Release

## Announcement glass

- Original Sunny reference: `C:\Users\admin\AppData\Local\Temp\codex-clipboard-e7464b40-47dd-4d12-a184-6abbd99b5aaa.png`
- SunnyKR before state: `C:\Users\admin\AppData\Local\Temp\codex-clipboard-bb63862e-7e61-4266-b2f7-7b23a41c518e.png`
- Updated implementation: `C:\Users\admin\AppData\Local\Temp\sunny-announcement-glass-qa\after-final.png`
- Side-by-side comparison: `C:\Users\admin\AppData\Local\Temp\sunny-announcement-glass-qa\before-after.png`
- The backdrop is a 10% dark layer with no blur, so the page is 90% visible.
- Announcement images, translations, links, and close controls remain solid and readable.

## Oscillator specification fields

- Reference: John's in-app Browser annotation on the `Tolerance at 25C` field, 2026-08-29.
- Updated implementation: `C:\Users\admin\AppData\Local\Temp\sunny-oscillator-tolerance-qa\after-full.png`
- The separate tolerance field is removed from SCO oscillators and special oscillator/VCXO modules.
- Stability over temperature remains visible and moves into the open grid position.
- SCO summaries now show stability only and format the voltage as a voltage, not pF.
- Crystal and 32.768 kHz families retain their tolerance field.

## Browser verification

- SCO-10, SCO-32, SCO-06, SCO-22, and SCO-53: no tolerance field; stability field present.
- SVH and SLO-10: no tolerance field; stability field present.
- SX-32 crystal: tolerance and stability fields both present.
- Announcement `Close all` works and restores the page.

## Review

- **P0 — blocking:** none.
- **P1 — major:** none.
- **P2 — minor:** none.
- **P3 — polish:** none.

## Build verification

- `pnpm sunny:check`: passed.
- TypeScript typecheck: passed.
- Vite production build: passed.
- `git diff --check`: passed.
- Existing non-blocking build warnings remain: Google Fonts import ordering, source-map reporting for two UI components, and bundle-size advisory.

final result: passed
