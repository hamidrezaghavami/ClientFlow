import type { z } from 'zod';
import type { engagementSchema } from '../../../api/src/client-board-model.js';

export { applyScopeDecision, boardSchema, stages } from '../../../api/src/client-board-model.js';
export type Engagement = z.infer<typeof engagementSchema>;
export type Board = { clients: Engagement[]; revision: number };
export type ScopeChange = NonNullable<Engagement['scope']>;
