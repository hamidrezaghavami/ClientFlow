# ClientFlow

A calmer home for freelance clients, projects, and tasks.

## Current milestone

An interactive landing-page design preview, built with Next.js, React, TypeScript and Tailwind. The 2D hero organizes client/project/task cards on scroll or with a button. Reduced-motion settings are respected. The demo board supports task status changes and reset, with fictional data held in memory.

Clerk handles sign-in, account creation, and password recovery. The signed-in dashboard currently shows a welcome screen and account menu. The project workspace and separate Express/PostgreSQL API are subsequent milestones.

## Run locally

Requires Node.js 20.9+ and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Next.js (normally http://127.0.0.1:3000).

```sh
npm run build
npm run typecheck
```

## Structure

- `apps/web`: Next.js frontend; no backend business logic.
- `docs`: current product decisions and implementation boundary.
- Planned `apps/api`: standalone Node.js + Express + TypeScript REST service with PostgreSQL. Clerk tokens will be verified here, with owner-scoped authorization on every protected operation.

Local auth uses a claimable Clerk development instance. On a fresh checkout, put the Clerk publishable and secret keys in `apps/web/.env.local`. Enable email and password in Clerk so the sign-in form offers password recovery. Keep development credentials out of Git.

## Deploy to Vercel

Import the GitHub repository into Vercel, select Next.js, and set the Root Directory to `apps/web`. Keep workspace source outside the root directory available so Vercel can use the root npm lockfile. Use `main` as the production branch. The managed Next.js build runs without Docker.

The landing page and interactive demo can be deployed without credentials. To enable hosted accounts, configure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` for the appropriate Vercel environments and redeploy. Use a Clerk production instance for public production authentication. Enable email and password in Clerk to offer password recovery.
