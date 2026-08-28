# SunnyBrain Recovery and Computer Change

Last updated: 2026-08-29 08:41 KST

## What survives a computer failure

- The private Sunny vault is kept in the approved Google Drive Sunny project folder.
- Website code, public SunnyBrain rules, tests, and sanitized exports are kept in GitHub.
- Production secrets stay in approved server-side environment settings and are never committed.
- Sunnychat can copy a conversation as Markdown and export/import a portable JSON session file.

## Continue work on another approved computer

1. Wait for Google Drive to finish syncing before opening or changing the vault.
2. Clone or pull the approved Sunny website Git repository.
3. Install the repository's required Node.js and pnpm versions.
4. Add server credentials only through the approved private environment store.
5. Run `pnpm sunny:check` before changing anything.
6. To refresh public knowledge, run:

   ```text
   pnpm sunny:export -- --vault "PATH TO THE AUTHORITATIVE SUNNY VAULT"
   ```

7. Review the generated public JSON for privacy and correctness.
8. Run `pnpm sunny:check` again.
9. Preview locally before any production deployment.

## Continue a Sunnychat conversation

1. On the original computer, select **Export** in Sunnychat.
2. Move the downloaded `sunnychat-session-YYYY-MM-DD.json` file using an approved location.
3. Open Sunnychat on the other computer.
4. Select **Import** and choose the session file.
5. Confirm the restored conversation before continuing.

**Copy chat** produces plain Markdown for email, notes, or another session. Each message also has its own copy button.

## Failure modes

- If Gemma is unavailable, Sunnychat must keep using local verified public answers.
- If the public knowledge export is missing or invalid, the build or verification must fail.
- If quote inputs do not match an explicit approved rule, the result must be Submit for Price.
- Never solve a bridge failure by connecting another project's service or credentials.
