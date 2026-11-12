import { authenticate } from './clerk-session.js';
import { createHash } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

const date = z.iso.date();
const proposalSchema = z.object({
  requested: z.string().trim().min(1).max(120),
  replaced: z.string().trim().min(1).max(120),
  originalDeadline: z.union([date, z.literal('')]),
  newDeadline: date,
  extraCents: z.number().int().min(0).max(99_999_900),
});
const tokenSchema = z.string().regex(/^[a-f0-9-]{72}$/);
const choiceSchema = z.enum(['swap', 'add']);
const payload = z.discriminatedUnion('action', [
  z.object({ action: z.literal('publish'), token: tokenSchema, project: z.string().min(1).max(100), proposal: proposalSchema }),
  z.object({ action: z.literal('status'), token: tokenSchema }),
  z.object({ action: z.literal('revoke'), token: tokenSchema }),
  z.object({ action: z.literal('read'), token: tokenSchema }),
  z.object({ action: z.literal('approve'), token: tokenSchema, choice: choiceSchema }),
]);

export async function scopeReview(req, res) {
  const reply = (data, status = 200) => res.status(status).json(data);
  const parsed = payload.safeParse(req.body);
  if (!parsed.success) return reply({ error: 'Invalid review request.' }, 400);
  const data = parsed.data;
  const ownerAction = data.action === 'publish' || data.action === 'status' || data.action === 'revoke';
  const userId = ownerAction ? await authenticate(req) : null;
  if (ownerAction && !userId) return reply({ error: 'Sign in to manage your review links.' }, 401);
  if (!process.env.DATABASE_URL) return reply({ error: 'Review links are temporarily unavailable.' }, 503);
  const sql = neon(process.env.DATABASE_URL);
  const hash = createHash('sha256').update(data.token).digest('hex');

  try {
    if (data.action === 'publish') {
      if (data.proposal.originalDeadline && data.proposal.newDeadline < data.proposal.originalDeadline) {
        return reply({ error: 'The add-on deadline precedes the original deadline.' }, 400);
      }
      const [record] = await sql`
        INSERT INTO scope_reviews (token_hash, owner_id, project, proposal)
        VALUES (${hash}, ${userId}, ${data.project}, ${JSON.stringify(data.proposal)}::jsonb)
        ON CONFLICT (token_hash) DO UPDATE SET token_hash = EXCLUDED.token_hash
          WHERE scope_reviews.owner_id = EXCLUDED.owner_id AND NOT scope_reviews.revoked
        RETURNING choice, decided_at AS "decidedAt"
      `;
      return record ? reply({ review: record }) : reply({ error: 'Could not publish this link.' }, 409);
    }
    if (data.action === 'revoke') {
      const [review] = await sql`
        INSERT INTO scope_reviews (token_hash, owner_id, project, proposal, revoked)
        VALUES (${hash}, ${userId}, '', '{}'::jsonb, true)
        ON CONFLICT (token_hash) DO UPDATE SET revoked = true
          WHERE scope_reviews.owner_id = EXCLUDED.owner_id AND scope_reviews.choice IS NULL
        RETURNING revoked
      `;
      return review ? reply({ revoked: true }) : reply({ error: 'This review was already approved or could not be found.' }, 409);
    }
    if (data.action === 'status') {
      const [review] = await sql`
        SELECT choice, decided_at AS "decidedAt", revoked FROM scope_reviews WHERE token_hash = ${hash} AND owner_id = ${userId}
      `;
      return reply({ review: review ?? null });
    }
    if (data.action === 'approve') {
      const [review] = await sql`
        UPDATE scope_reviews SET choice = ${data.choice}, decided_at = now()
        WHERE token_hash = ${hash} AND choice IS NULL AND NOT revoked
        RETURNING choice, decided_at AS "decidedAt"
      `;
      if (review) return reply({ review });
    }
    const [review] = await sql`
      SELECT project, proposal, choice, decided_at AS "decidedAt" FROM scope_reviews WHERE token_hash = ${hash} AND NOT revoked
    `;
    return review ? reply({ review }) : reply({ error: 'This review link could not be found.' }, 404);
  } catch {
    return reply({ error: 'Review links are temporarily unavailable. Try again shortly.' }, 503);
  }
}
