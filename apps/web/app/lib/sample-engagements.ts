import type { Engagement } from './client-board';

export const initialClients: Engagement[] = [
  { id: 'atlas', client: 'Atlas Ventures', project: 'Investor pitch deck', contact: 'Sofia Reed', deadline: '2026-11-18', stage: 'New', nextAction: 'Confirm the pitch deck scope', actionOwner: 'client', followUp: '2026-11-12' },
  { id: 'northstar', client: 'Northstar Studio', project: 'Website refresh', contact: 'Maya Chen', deadline: '2026-11-16', stage: 'In progress', nextAction: 'Send the homepage draft', actionOwner: 'me', scope: { deliverables: ['Homepage', 'About page'], history: [] } },
  { id: 'forma', client: 'Forma Coffee', project: 'Packaging direction', contact: 'Leo Martin', deadline: '2026-11-20', stage: 'In review', nextAction: 'Share feedback on the packaging draft', actionOwner: 'client', followUp: '2026-11-18' },
  { id: 'fieldwork', client: 'Fieldwork Press', project: 'Editorial site handoff', contact: 'Jamie Park', deadline: '2026-11-09', stage: 'Delivered' },
];

export function formatDeadline(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${value}T00:00:00Z`));
}
