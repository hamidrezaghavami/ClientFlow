# ClientFlow

ClientFlow helps freelancers manage client projects, deadlines, next actions, and scope approvals. Clients can open a private review link and approve a scope change. The decision syncs into the freelancer’s board.

## Local development

Use Node.js 22+ and npm. Run `npm ci` from the repository root, then configure the two apps from their respective `.env.example` files.

- `apps/web/.env.local` holds Clerk’s frontend and server keys and `NEXT_PUBLIC_CLIENTFLOW_API_URL`. For local development, use `http://127.0.0.1:3001` as the API URL.
- `apps/api/.env.local` holds the matching Clerk publishable key, the allowed frontend origins, the PostgreSQL connection, and the Gemini key. Keep this file out of Git.
- For a new database, apply `apps/api/db/client-boards.sql` and `apps/api/db/scope-reviews.sql` before starting the app.

Run the Express API in one terminal and Next.js in another:

```sh
node --env-file=apps/api/.env.local apps/api/src/server.js
npm run dev
```

The frontend defaults to `http://127.0.0.1:3000`. For local auth, enable email and password in Clerk so users can sign in and recover passwords.

## Architecture

- `apps/web` is the Next.js frontend, including Clerk sign-in and the public scope review page.
- `apps/api` is a plain JavaScript Node.js and Express backend. It owns board storage, approvals, and the Gemini assistant. It validates Clerk bearer tokens for owner operations and uses PostgreSQL for board and approval data.
- Client review links authorize reading and approving an individual proposal. The first approval is final.

```sh
npm run check -w @clientflow/api
npm run typecheck
npm run build
```

## Deploy

Connect two Vercel projects to this repository and use `main` as the production branch. Set their root directories to `apps/web` and `apps/api`, with the Next.js and Express presets respectively. Allow access to workspace files outside each root so the builds can use the root npm lockfile and the shared board model.

Set the frontend API URL to the API project’s public HTTPS origin. Set `WEB_ORIGINS` on the API project to the exact frontend origin. Configure the Clerk keys for the same Clerk instance on both projects. Store `DATABASE_URL` and `GEMINI_API_KEY` as server-only API environment variables.
