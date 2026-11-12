# ClientFlow

A calmer home for freelance clients, projects, and tasks.

## Current milestone

An interactive landing-page design preview, built with Next.js, React, TypeScript and Tailwind. The 2D hero organizes client/project/task cards on scroll or with a button. Reduced-motion settings are respected. The demo board supports task status changes and reset, with fictional data held in memory.

Clerk handles sign-in, account creation, and password recovery. The signed-in dashboard shows an interactive client board with sample engagements, editable project details, and stage controls. Sample changes reset on reload. Persistent workspace data will be served by the separate Express/PostgreSQL API.

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

## Client assistant

The dashboard calendar icon opens Due next. The assistant sends one question per request to Google Gemini. Project titles, stages, and deadlines are included only when the user selects board context. Client and contact names are excluded from that context.

To run the separate Express service, copy `apps/api/.env.example` to `apps/api/.env.local`, set the matching Clerk publishable key and a Gemini API key, then run:

```sh
npm run build -w @clientflow/api
node --env-file=apps/api/.env.local apps/api/dist/server.js
```

Set `NEXT_PUBLIC_CLIENTFLOW_API_URL=http://127.0.0.1:3001` in `apps/web/.env.local` and restart Next.js. Use the same frontend origin in `WEB_ORIGINS`. In a hosted environment, set the API's `HOST` and `PORT` for the hosting platform, allow the exact frontend origin, and use the HTTPS API URL in Vercel. The Gemini API key belongs on the Express host.
