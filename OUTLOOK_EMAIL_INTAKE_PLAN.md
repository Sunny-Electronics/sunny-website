# SunnyKR Outlook Email Intake Plan

Status date: May 4, 2026

## Current Email Reality

Sunny currently works from Microsoft Outlook using local PST data files.

Observed local PST files:

- `C:\Users\admin\Documents\Outlook Files\john@sunny.co.kr - SunnyJohn_backup.pst.pst`
- `C:\Users\admin\Documents\Outlook Files\Archive_REAL_2016_2025.pst.pst`
- `C:\Users\admin\Documents\Outlook Files\Active_Work.pst`
- `C:\Users\admin\Documents\Outlook Files\Main_Fast.pst`
- `C:\Users\admin\Documents\Outlook Files\john@sunny.co.kr.pst`

The backup/history PST files are large and valuable for learning real customer patterns, but live automation should not depend only on local PST files.

## Recommended Direction

Use a three-track intake strategy:

1. Email forwarding/copy to a dedicated AI inbox for the fastest live prototype.
2. PST historical import for old RFQs, POs, quote replies, QA document requests, customer contacts, and repeat part/customer patterns.
3. Direct IMAP/SMTP or Microsoft Graph connection later if needed.

## Why Not Gmail First

Gmail can be the best first connector if Sunny forwards a copy of company mail into a dedicated AI inbox.

This avoids changing the current company groupware and keeps the original mail workflow safe.

Connector choices:

- Gmail/Google Workspace automation inbox for copied live emails.
- PST import for historical data and early prototypes.
- IMAP if `sunny.co.kr` email needs direct mailbox reading later.
- SMTP if Sunny wants the system to send approved emails as `john@sunny.co.kr` later.

## Intake Options

| Option | Best For | Pros | Risk / Limitation |
| --- | --- | --- | --- |
| Microsoft Graph | Microsoft 365/Exchange live mailbox | Secure OAuth, reliable live sync, draft replies | Requires mailbox to be Microsoft 365/Exchange |
| IMAP/SMTP | Standard hosted email | Works with many email providers | Provider settings and app passwords may be needed |
| Outlook COM | Local Outlook desktop | Can inspect local Outlook folders | Requires Windows + Outlook open/configured |
| PST Import | Historical training/import | Uses existing email history | Not good for real-time automation by itself |
| Forwarding Rule | Fast live intake backup | Simple and reliable | Needs mailbox rule setup |

## Immediate Build Path

### Step 1: Historical PST Audit

- [ ] Identify which PST is the active/latest mailbox.
- [ ] Export or parse a small sample of recent messages.
- [ ] Classify examples into RFQ, PO, quote reply, QA document request, stock inquiry, and general.
- [ ] Build customer/contact matching from sender email domains.

### Step 2: Live Mailbox Decision

- [ ] Confirm where `john@sunny.co.kr` is hosted.
- [ ] If Microsoft 365/Exchange: use Microsoft Graph.
- [ ] If standard mail hosting: use IMAP for intake and SMTP for draft/send.
- [ ] If neither is easy: create forwarding rule to an automation mailbox.

### Step 3: First Automation Prototype

- [ ] Pull 20-50 recent emails.
- [ ] Classify email type.
- [ ] Extract PO number, RFQ part number, quantity, requested date, and QA document type.
- [ ] Create admin review tasks only.
- [ ] Do not auto-send customer replies yet.

### Step 4: Production Safety

- [ ] Require admin approval before quote/PO/QA responses are sent.
- [ ] Store source email, extracted fields, confidence score, and final admin action.
- [ ] Keep customer-specific pricing admin-only.
- [ ] Add audit records for every detection, draft, approval, and sent reply.

## Required Settings To Collect

For Microsoft 365/Exchange:

- Tenant ID
- Client ID
- Client Secret
- Mailbox address
- Redirect URI

For IMAP/SMTP:

- IMAP host and port
- SMTP host and port
- Username
- App password or OAuth method
- Security mode: SSL/TLS or STARTTLS

For PST import:

- PST file path
- Folder names to scan first
- Date range
- Sample size

## First Folder To Scan

Start with recent Inbox messages from:

`C:\Users\admin\Documents\Outlook Files\john@sunny.co.kr - SunnyJohn_backup.pst.pst`

Then compare with:

`C:\Users\admin\Documents\Outlook Files\Archive_REAL_2016_2025.pst.pst`

## Non-Negotiable Rule

The automation must create drafts and admin review tasks first. It must not send external customer emails automatically until Sunny explicitly enables controlled auto-send for safe cases.
