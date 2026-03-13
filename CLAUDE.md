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

## Git
- Claude Code environment restricts pushes to `claude/*` branches only (proxy limitation)
- Always push to `claude/*` branches — GitHub Actions handles the rest
- The user prefers minimal manual steps; automate everything possible
