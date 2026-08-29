# SunnyKR Public Announcements

## Purpose

`SunnyAnnouncements.tsx` shows approved public Sunny notices when a visitor first enters the site.

- Each announcement has its own unique `id`.
- Closing or opening a notice stores that `id` in the visitor's browser.
- The same notice does not appear again on that device.
- A future notice with a new `id` will appear once, even when older notices were dismissed.

## Current notices

1. Outstanding Quality Competitiveness Enterprise, selected for four consecutive years (2022–2025).
2. Notice of Cash Dividend Decision for the 60th Fiscal Year.

The dividend notice links to the full original announcement on `sunny.co.kr`. The quality notice links to the SunnyKR quality page.

## Adding a future notice

1. Confirm the source is a public announcement from Sunny Electronics.
2. Create and review the English artwork. Never include customer, buyer, order, price, A/R, email, or other private data.
3. Save the approved image in `attached_assets`.
4. Add one entry to `ANNOUNCEMENTS` in `artifacts/web/src/components/SunnyAnnouncements.tsx`.
5. Give it a new unique `id`, even when replacing an older notice.
6. Set the approved internal or public external link.
7. Run typecheck, production build, and browser interaction tests before deployment.

Do not silently replace an existing image while keeping its old `id`; visitors who dismissed the old version would not see the replacement.
