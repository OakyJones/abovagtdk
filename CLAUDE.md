# CLAUDE.md — Project context for Claude Code

## Project
AboVagt (abovagt.dk) — Danish subscription management service built with Next.js + TypeScript.

## Deployment
- **Hosting**: Vercel, auto-deploys from `main` branch
- **Auto-merge**: GitHub Actions workflow (`.github/workflows/auto-merge-claude.yml`) automatically merges any `claude/*` branch into `main` on push. No manual merge/PR needed.
- **Workflow**: Push to `claude/*` branch → GitHub Actions merges to `main` → Vercel deploys to abovagt.dk

## Stack
- Next.js (App Router, "use client" components)
- TypeScript
- Tailwind CSS
- Supabase (database)
- Stripe (payments, 35 kr flat fee)
- GoCardless/Nordigen (open banking, PSD2)
- Umami (analytics, `window.umami?.track()`)

## Key patterns
- Analytics: `window.umami?.track("event_name", { key: value })`
- Environment variable `NEXT_PUBLIC_LAUNCH_MODE=live` hides "Kommer snart" badges
- Danish language throughout UI
- **Lazy-init external SDKs**: Never instantiate `new Resend()`, `new Stripe()`, etc. at module top-level in API routes — use lazy getters to avoid build-time crashes when env vars are missing

## Working principles
- **Do as much as possible yourself** — never ask the user to do something you can do. Only involve the user when absolutely necessary (e.g., network-restricted operations like Supabase SQL that require dashboard access).
- **Always commit and push when done** — don't wait for the user to ask.
- **Automate everything** — the user prefers minimal manual steps.

## Supabase
- **URL**: `https://ranlmeiwrqpfynyyuaiu.supabase.co`
- Credentials are in `.env.local` (not committed to git)
- **Note**: The Claude Code sandbox proxy blocks `supabase.co`, `abovagt.dk`, and `vercel.app` — no external API calls to these services are possible.
- **Database migrations**: Always provide ready-to-copy SQL that the user pastes into Supabase SQL Editor (Dashboard → SQL Editor → New Query → Run). Keep SQL concise and idempotent (`IF NOT EXISTS`, etc.).

## Git
- Claude Code environment restricts pushes to `claude/*` branches only (proxy limitation)
- Always push to `claude/*` branches — GitHub Actions handles the rest
