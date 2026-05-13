# SunnyKR Work/Home Workflow

SunnyKR source of truth:

- GitHub repo: `https://github.com/Sunny-Electronics/sunny-website`
- Main branch: `main`
- Home Mac Mini repo: `/Users/johnchun/Documents/New project 8/sunnykr-repo`

## Standard Flow

Use the same flow from the Mac Mini and the work notebook:

1. Start from the local SunnyKR repo.
2. Pull before work:
   `git pull origin main`
3. Make changes locally.
4. Verify:
   `pnpm run typecheck`
   `PORT=3008 BASE_PATH=/ NODE_ENV=production pnpm --filter ./artifacts/web run build`
5. Commit:
   `git add <changed files>`
   `git commit -m "Short clear message"`
6. Push:
   `git push origin main`
7. Vercel deploys from GitHub.

## AI Architecture Rule

Public access must stay:

Frontend -> bridge/API -> Cloudflare tunnel -> OpenClaw/Gemma4

Never expose Ollama, OpenClaw, local ports, Telegram tokens, API secrets, or Cloudflare secrets directly.

## First-Time Setup On Another Computer

Install required tools:

- Git
- Node.js
- pnpm
- GitHub CLI: `gh`

Login:

`gh auth login --hostname github.com --git-protocol https --web --scopes repo,workflow`

Then connect Git to GitHub CLI credentials:

`gh auth setup-git`

Clone the repo:

`git clone https://github.com/Sunny-Electronics/sunny-website.git`

Install dependencies:

`pnpm install --frozen-lockfile`

## Important Local Note

Do not use the parent folder `/Users/johnchun/Documents/New project 8` as the repo. It had a macOS directory metadata issue.

Use `/Users/johnchun/Documents/New project 8/sunnykr-repo`.
