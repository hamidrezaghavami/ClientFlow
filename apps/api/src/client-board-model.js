import { z } from 'zod';

export const stages = /** @type {const} */ (['New', 'In progress', 'In review', 'Delivered']);
const date = z.string().refine(value => value === '' || z.iso.date().safeParse(value).success);
const choiceSchema = z.enum(['swap', 'add']);
const terms = z.object({
  requested: z.string().min(1).max(120),
  replaced: z.string().min(1).max(120),
  originalScope: z.array(z.string().min(1).max(1500)).max(300),
  originalDeadline: date,
  newDeadline: z.iso.date(),
  extraCents: z.number().int().min(0).max(99_999_900),
});
const scopeSchema = z.object({
  deliverables: z.array(z.string().min(1).max(1500)).max(301),
  pending: terms.extend({ token: z.string().regex(/^[a-f0-9-]{72}$/).optional(), published: z.boolean().optional() }).optional(),
  history: z.array(terms.extend({ choice: choiceSchema, recordedAt: z.iso.datetime() })).max(500),
});

export const engagementSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,64}$/),
  client: z.string().min(1).max(80),
  project: z.string().min(1).max(100),
  contact: z.string().max(80),
  deadline: date,
  stage: z.enum(stages),
  nextAction: z.string().max(140).optional(),
  actionOwner: z.enum(['me', 'client']).optional(),
  followUp: date.optional(),
  scope: scopeSchema.optional(),
  archived: z.boolean().optional(),
});
export const boardSchema = z.array(engagementSchema).max(500)
  .refine(items => new Set(items.map(item => item.id)).size === items.length);
export function applyScopeDecision(scope, choice, recordedAt) {
  const pending = scope.pending;
  if (!pending) return null;
  const { token, published, ...terms } = pending;
  const deliverables = choice === 'swap'
    ? terms.originalScope.map(item => item === terms.replaced ? terms.requested : item)
    : [...terms.originalScope, terms.requested];
  return {
    scope: { deliverables, history: [{ ...terms, choice, recordedAt }, ...scope.history] },
    deadline: choice === 'add' ? terms.newDeadline : terms.originalDeadline,
  };
}
