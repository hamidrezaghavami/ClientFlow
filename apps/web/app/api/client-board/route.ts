import { createHash } from 'node:crypto';
import { auth } from '@clerk/nextjs/server';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';
import { applyScopeDecision, boardSchema, engagementSchema, type Board } from '../../lib/client-board';

const input = z.discriminatedUnion('action', [
  z.object({ action: z.literal('load'), initial: boardSchema.optional() }),
  z.object({ action: z.literal('save'), revision: z.number().int().nonnegative(), client: engagementSchema }),
]);

function reply(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  if (request.headers.get('sec-fetch-site') === 'cross-site' || !request.headers.get('content-type')?.startsWith('application/json')) {
    return reply({ error: 'Invalid board request.' }, 400);
  }
  const { userId } = await auth();
  if (!userId) return reply({ error: 'Sign in to access your client board.' }, 401);
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return reply({ error: 'The board data could not be saved. Check the entry and try again.' }, 400);
  if (!process.env.DATABASE_URL) return reply({ error: 'Board storage is unavailable.' }, 503);
  const sql = neon(process.env.DATABASE_URL);
  const data = parsed.data;

  async function readBoard() {
    const [row] = await sql`SELECT clients, revision FROM client_boards WHERE owner_id = ${userId}`;
    return row as Board | undefined;
  }

  async function writeBoard(clients: Board['clients'], revision: number) {
    const [row] = await sql`
      UPDATE client_boards SET clients = ${JSON.stringify(clients)}::jsonb, revision = revision + 1
      WHERE owner_id = ${userId} AND revision = ${revision}
      RETURNING clients, revision
    `;
    return row as Board | undefined;
  }

  try {
    if (data.action === 'load' && data.initial) {
      await sql`
        INSERT INTO client_boards (owner_id, clients) VALUES (${userId}, ${JSON.stringify(data.initial)}::jsonb)
        ON CONFLICT (owner_id) DO NOTHING
      `;
    }
    const board = await readBoard();
    if (!board) return reply({ board: null });
    if (data.action === 'save') {
      if (data.revision !== board.revision) return reply({ board, error: 'The board changed. Review the latest version and try again.' }, 409);
      const exists = board.clients.some(client => client.id === data.client.id);
      if (!exists && board.clients.length >= 500) return reply({ error: 'This board has reached 500 engagements.' }, 400);
      const next = exists ? board.clients.map(client => client.id === data.client.id ? data.client : client) : [...board.clients, data.client];
      const updated = await writeBoard(next, board.revision);
      return updated ? reply({ board: updated }) : reply({ board: await readBoard(), error: 'The board changed. Review the latest version and try again.' }, 409);
    }

    const hashes = new Map(board.clients.flatMap(client => {
      const token = client.scope?.pending?.token;
      return token ? [[client.id, createHash('sha256').update(token).digest('hex')] as const] : [];
    }));
    if (!hashes.size) return reply({ board });
    const reviews = await sql`
      SELECT token_hash, choice, decided_at, revoked FROM scope_reviews
      WHERE owner_id = ${userId} AND token_hash = ANY(${[...hashes.values()]}::text[])
    `;
    const byHash = new Map(reviews.map(review => [review.token_hash, review]));
    let changed = false;
    const clients = board.clients.map(client => {
      const review = byHash.get(hashes.get(client.id));
      if (!review || !client.scope?.pending) return client;
      if (review.revoked) {
        changed = true;
        const { token, published, ...pending } = client.scope.pending;
        return { ...client, scope: { ...client.scope, pending } };
      }
      if (review.choice === 'swap' || review.choice === 'add') {
        const decision = applyScopeDecision(client.scope, review.choice, new Date(review.decided_at).toISOString());
        if (decision) {
          changed = true;
          return { ...client, ...decision };
        }
      }
      if (!client.scope.pending.published) {
        changed = true;
        return { ...client, scope: { ...client.scope, pending: { ...client.scope.pending, published: true } } };
      }
      return client;
    });
    return reply({ board: changed ? (await writeBoard(clients, board.revision) ?? await readBoard()) : board });
  } catch {
    return reply({ error: 'Board storage is temporarily unavailable. Try again shortly.' }, 503);
  }
}
