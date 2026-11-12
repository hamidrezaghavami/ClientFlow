'use client';

import { useEffect, useEffectEvent, useRef, useState, type FormEvent } from 'react';
import { Archive, ArrowLeftRight, ArrowUpRight, CalendarDays, ChevronRight, Handshake, LayoutGrid, ListTodo, RotateCcw, Search, Sparkles, UserPlus, X } from 'lucide-react';
import { ClientAssistant } from './client-assistant';
import { DeadlinePicker } from './deadline-picker';
import { applyScopeDecision, scopeReviewRequest, ScopeChangePanel, type ScopeChange } from './scope-change';

const stages = ['New', 'In progress', 'In review', 'Delivered'] as const;
type Stage = (typeof stages)[number];
type ActionOwner = 'me' | 'client';
type Engagement = { id: string; client: string; project: string; contact: string; deadline: string; stage: Stage; nextAction?: string; actionOwner?: ActionOwner; followUp?: string; scope?: ScopeChange; archived?: boolean };

const initialClients: Engagement[] = [
  { id: 'atlas', client: 'Atlas Ventures', project: 'Investor pitch deck', contact: 'Sofia Reed', deadline: '2026-11-18', stage: 'New', nextAction: 'Confirm the pitch deck scope', actionOwner: 'client', followUp: '2026-11-12' },
  { id: 'northstar', client: 'Northstar Studio', project: 'Website refresh', contact: 'Maya Chen', deadline: '2026-11-16', stage: 'In progress', nextAction: 'Send the homepage draft', actionOwner: 'me', scope: { deliverables: ['Homepage', 'About page'], history: [] } },
  { id: 'forma', client: 'Forma Coffee', project: 'Packaging direction', contact: 'Leo Martin', deadline: '2026-11-20', stage: 'In review', nextAction: 'Share feedback on the packaging draft', actionOwner: 'client', followUp: '2026-11-18' },
  { id: 'fieldwork', client: 'Fieldwork Press', project: 'Editorial site handoff', contact: 'Jamie Park', deadline: '2026-11-09', stage: 'Delivered' },
];

function formatDeadline(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${value}T00:00:00Z`));
}

export function WorkspaceOverview({ storageKey }: { storageKey: string }) {
  const [clients, setClients] = useState(initialClients);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [query, setQuery] = useState('');
  const [assistantDraft, setAssistantDraft] = useState<{ question: string }>();
  const [scopeId, setScopeId] = useState<string | null>(null);
  const scopeClient = clients.find(item => item.id === scopeId);
  const scopeDialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<Engagement | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [today, setToday] = useState('');
  const activeClients = clients.filter(item => !item.archived);
  const archivedClients = clients.filter(item => item.archived);
  const search = query.trim().toLowerCase();
  const visibleClients = activeClients.filter(item => !search || [item.client, item.project, item.contact, item.nextAction]
    .some(value => value?.toLowerCase().includes(search)));
  const dueClients = activeClients
    .filter(item => item.deadline && item.stage !== 'Delivered')
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
  const openClients = activeClients.filter(item => item.stage !== 'Delivered');
  const followUps = openClients.filter(item => item.actionOwner === 'client' && item.followUp && today && item.followUp <= today)
    .sort((a, b) => (a.followUp ?? '').localeCompare(b.followUp ?? ''));
  const dueIds = new Set(followUps.map(item => item.id));
  const actionGroups = [
    { title: 'Follow up', items: followUps, empty: 'No client follow-ups due.' },
    { title: 'Your move', items: openClients.filter(item => item.actionOwner !== 'client' && item.nextAction), empty: 'No next actions assigned to you.' },
    { title: 'Client’s move', items: openClients.filter(item => item.actionOwner === 'client' && !dueIds.has(item.id)), empty: 'No other engagements waiting on a client.' },
  ];

  const overdueCount = today ? dueClients.filter(item => item.deadline < today).length : 0;

  useEffect(() => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
    setToday(localDate.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    function loadBoard() {
      try {
        const saved = window.localStorage.getItem(storageKey);
        setClients(saved ? JSON.parse(saved) as Engagement[] : initialClients);
        setSaveError('');
        setReady(true);
      } catch {
        setSaveError('Saved board unavailable. Check browser storage and reload.');
        setReady(false);
      }
    }
    function syncBoard(event: StorageEvent) {
      if (event.key === storageKey || event.key === null) loadBoard();
    }
    loadBoard();
    window.addEventListener('storage', syncBoard);
    return () => window.removeEventListener('storage', syncBoard);
  }, [storageKey]);

  function persistClient(updated: Engagement) {
    if (!ready) return false;
    try {
      const saved = window.localStorage.getItem(storageKey);
      const board: Engagement[] = saved ? JSON.parse(saved) : initialClients;
      const next = board.some(item => item.id === updated.id)
        ? board.map(item => item.id === updated.id ? updated : item)
        : [...board, updated];
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      setClients(next);
      setSaveError('');
      return true;
    } catch {
      setSaveError('Could not save. Check browser storage and try again.');
      return false;
    }
  }

  const syncApproval = useEffectEvent(async (token: string) => {
    const { review } = await scopeReviewRequest({ action: 'status', token });
    if (!review) return;
    const saved = window.localStorage.getItem(storageKey);
    const board: Engagement[] = saved ? JSON.parse(saved) : initialClients;
    const client = board.find(item => item.scope?.pending?.token === token);
    if (!client?.scope?.pending) return;
    if (review.revoked) {
      persistClient({ ...client, scope: { ...client.scope, pending: { ...client.scope.pending, token: undefined, published: undefined } } });
      return;
    }
    if (!review.choice || !review.decidedAt) return;
    const update = applyScopeDecision(client.scope, review.choice, review.decidedAt);
    if (update && persistClient({ ...client, ...update })) {
      setAnnouncement(`Client approval received for ${client.project}.`);
    }
  });
  const pendingTokens = clients.flatMap(item => item.scope?.pending?.token ?? []).join(',');
  useEffect(() => {
    if (!ready || !pendingTokens) return;
    function check() {
      void Promise.allSettled(pendingTokens.split(',').map(token => syncApproval(token)));
    }
    check();
    const interval = window.setInterval(check, 10_000);
    window.addEventListener('focus', check);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', check);
    };
  }, [ready, pendingTokens]);

  const actionPanel = useRef<HTMLDialogElement>(null);
  const archive = useRef<HTMLDialogElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const deadlines = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const editor = dialog.current;
    if (draft && editor && !editor.open) editor.showModal();
  }, [draft]);

  useEffect(() => {
    if (scopeClient && !scopeDialog.current?.open) scopeDialog.current?.showModal();
  }, [scopeClient]);

  function openEditor(client?: Engagement) {
    if (!ready) return;
    setDraft(client ?? { id: '', client: '', project: '', contact: '', deadline: '', stage: 'New' });
  }

  function saveClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const data = new FormData(event.currentTarget);
    const client = String(data.get('client')).trim();
    const project = String(data.get('project')).trim();
    if (!client || !project) {
      const field = event.currentTarget.elements.namedItem(client ? 'project' : 'client');
      if (field instanceof HTMLInputElement) {
        field.setCustomValidity('Enter a name.');
        field.reportValidity();
      }
      return;
    }
    const stage = stages.find(item => item === data.get('stage')) ?? draft.stage;
    const actionOwner = data.get('actionOwner') === 'client' ? 'client' : 'me';
    const current = clients.find(item => item.id === draft.id) ?? draft;
    const updated: Engagement = {
      ...current,
      id: draft.id || crypto.randomUUID(), client, project, stage,
      contact: String(data.get('contact')).trim(), deadline: current.scope?.pending?.token || current.deadline !== draft.deadline ? current.deadline : String(data.get('deadline')),
      nextAction: String(data.get('nextAction')).trim(), actionOwner,
      followUp: actionOwner === 'client' ? String(data.get('followUp') ?? '') : '',
    };
    if (!persistClient(updated)) return;
    setAnnouncement(`${client} saved in ${stage}.`);
    dialog.current?.close();
  }

  function moveClient(id: string, stage: Stage) {
    const client = clients.find(item => item.id === id);
    if (client && persistClient({ ...client, stage })) setAnnouncement(`${client.client} moved to ${stage}.`);
  }

  return (
    <main id="workspace-main" className="client-board-shell">
      <nav className="client-tool-rail" aria-label="Client Board">
        <span className="client-tool-label">Client Board</span>
        <a href="#client-board-title" aria-label="Client stages" title="Client stages"><LayoutGrid size={19} aria-hidden="true" /></a>
        <button type="button" disabled={!ready} aria-label="Due next" title="Due next" aria-haspopup="dialog" onClick={() => deadlines.current?.showModal()}><CalendarDays size={19} aria-hidden="true" /></button>
        <button type="button" disabled={!ready} className="client-tool-add" aria-label="Add client" title="Add client"
          aria-haspopup="dialog" onClick={() => openEditor()}><UserPlus size={19} aria-hidden="true" /></button>
        <button type="button" disabled={!ready} aria-label="Archived engagements" title="Archived engagements" aria-haspopup="dialog"
          onClick={() => archive.current?.showModal()}><Archive size={19} aria-hidden="true" /></button>
        <button type="button" disabled={!ready} className="client-action-launcher" aria-label={`Who owes what?${followUps.length ? ` ${followUps.length} follow-ups due` : ''}`}
          title="Who owes what?" aria-haspopup="dialog" onClick={() => actionPanel.current?.showModal()}>
          <Handshake size={19} aria-hidden="true" />
          {followUps.length > 0 && <span aria-hidden="true" className="client-action-count">{followUps.length}</span>}
        </button>
      </nav>


      <section id="client-board-title" tabIndex={-1} className="client-board-main" aria-labelledby="workspace-title">
        <div className="client-board-toolbar">
          <label className="client-board-search">
            <Search size={16} aria-hidden="true" />
            <input type="search" aria-label="Search client engagements" placeholder="Search clients or projects"
              value={query} onChange={event => setQuery(event.target.value)} />
          </label>
        </div>
        {ready && <div className="client-board-columns">
          {stages.map((stage, index) => {
            const items = visibleClients.filter(item => item.stage === stage);
            return (
              <section className="client-board-column" data-stage={index} data-stacked={items.length > 1} data-empty={items.length === 0} key={stage} aria-labelledby={`client-stage-${index}`}>
                <h2 id={`client-stage-${index}`}><i data-stage={index} aria-hidden="true" />{stage}<span>{items.length}</span></h2>
                {items.length === 0 && <p className="client-board-empty">{search ? 'No matches.' : 'No clients here yet.'}</p>}
                {items.map(item => (
                  <article className="client-board-card" key={item.id}>
                    <button type="button" className="client-board-card-title" onClick={() => openEditor(item)}
                      aria-label={`Edit ${item.client}: ${item.project}`}>
                      <span className="client-board-avatar" aria-hidden="true">{item.client.charAt(0).toUpperCase()}</span>
                      <span><strong>{item.client}</strong><small>{item.project}</small></span>
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </button>
                    {item.stage !== 'Delivered' && item.actionOwner === 'client' && <span className="client-waiting-chip">
                      {dueIds.has(item.id) ? 'Follow-up due' : 'Waiting on client'}
                    </span>}
                    <div className="client-card-details">
                      <div className="client-card-details-inner">
                        <div className="client-board-card-meta">
                          {item.contact && <span>{item.contact}</span>}
                          {item.deadline && <span><CalendarDays size={14} aria-hidden="true" /> Due {formatDeadline(item.deadline)}</span>}
                        </div>
                        {item.nextAction && <p className="client-card-next"><ListTodo size={14} aria-hidden="true" />
                          <span><strong>Next action</strong>{item.nextAction}</span></p>}
                        <button type="button" className="client-scope-trigger" onClick={() => setScopeId(item.id)}
                          aria-label={`Scope changes for ${item.client}`} aria-haspopup="dialog">
                          <ArrowLeftRight size={14} aria-hidden="true" />
                          {item.scope?.pending ? 'Scope decision pending' : 'Scope changes'}
                        </button>
                        <label className="client-board-stage">
                          <span>Stage</span>
                          <select id={`client-stage-control-${item.id}`} value={item.stage} aria-label={`Stage for ${item.client}`} onChange={event => {
                            const next = stages.find(value => value === event.target.value);
                            if (next) {
                              moveClient(item.id, next);
                              requestAnimationFrame(() => document.getElementById(`client-stage-control-${item.id}`)?.focus());
                            }
                          }}>
                            {stages.map(value => <option key={value}>{value}</option>)}
                          </select>
                        </label>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            );
          })}
        </div>}
        <p className="client-board-note" role={saveError ? 'alert' : undefined}>
          {saveError || (ready ? 'Changes are saved in this browser.' : 'Loading your board…')}
        </p>
        <p className="sr-only" role="status">{announcement}</p>
      </section>

      <ClientAssistant draft={assistantDraft} projects={(ready ? activeClients : []).filter(item => item.stage !== 'Delivered').map(item => ({
        project: item.project, stage: item.stage, deadline: item.deadline || null,
      }))} />

      <dialog ref={deadlines} className="client-editor deadline-dialog" aria-labelledby="deadline-panel-title">
        <div className="deadline-panel-heading">
          <span className="deadline-panel-icon"><CalendarDays size={18} aria-hidden="true" /></span>
          <div>
            <h2 id="deadline-panel-title" tabIndex={-1}>Due next</h2>
            <p>{overdueCount ? `${overdueCount} overdue` : 'Client deadlines'}</p>
          </div>
          <button className="client-editor-close" type="button" aria-label="Close deadlines" onClick={() => deadlines.current?.close()}><X size={19} /></button>
        </div>
        {dueClients.length ? (
          <ol className="deadline-panel-list">
            {dueClients.slice(0, 3).map(item => {
              const overdue = today && item.deadline < today;
              return (
                <li key={item.id}>
                  <button type="button" className="deadline-panel-item" data-stage={stages.indexOf(item.stage)} onClick={() => { deadlines.current?.close(); openEditor(item); }}
                    aria-label={`Edit ${item.project} for ${item.client}, due ${formatDeadline(item.deadline)}${overdue ? ', overdue' : ''}`}>
                    <span>
                      <span className={overdue ? 'deadline-panel-date is-overdue' : 'deadline-panel-date'}>
                        <time dateTime={item.deadline}>{formatDeadline(item.deadline)}</time>{overdue && ' · Overdue'}
                      </span>
                      <strong>{item.project}</strong>
                      <small>{item.client}</small>
                    </span>
                    <ChevronRight size={15} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ol>
        ) : <p className="deadline-panel-empty">No open client deadlines.</p>}
      </dialog>

      <dialog ref={actionPanel} className="client-editor deadline-dialog client-action-dialog" aria-labelledby="client-action-title">
        <div className="client-editor-heading">
          <h2 id="client-action-title">Who owes what?</h2>
          <button className="client-editor-close" type="button" aria-label="Close who owes what" onClick={() => actionPanel.current?.close()}><X size={19} /></button>
        </div>
        {actionGroups.map(group => <section key={group.title} className="client-action-group">
          <h3>{group.title} <span>{group.items.length}</span></h3>
          {group.items.length ? <ul className="client-archive-list">
            {group.items.map(item => <li key={item.id} className="deadline-panel-item client-action-item" data-stage={stages.indexOf(item.stage)}>
              <button type="button" className="client-action-edit" onClick={() => { actionPanel.current?.close(); openEditor(item); }}>
                <strong>{item.client}</strong>
                <small>{item.project}</small>
                {item.nextAction && <span>{item.nextAction}</span>}
                {item.actionOwner === 'client' && item.followUp && <time dateTime={item.followUp}>
                  {item.followUp === today ? 'Follow up today' : item.followUp < today ? `Overdue · ${formatDeadline(item.followUp)}` : `Follow up ${formatDeadline(item.followUp)}`}
                </time>}
              </button>
              {dueIds.has(item.id) && <button type="button" className="client-action-draft" onClick={() => {
                actionPanel.current?.close();
                setAssistantDraft({ question: `Draft a short, friendly follow-up for ${item.client} about ${item.project}.${item.nextAction ? ` The next step is: ${item.nextAction}.` : ''} Use only these details.` });
              }}><Sparkles size={14} aria-hidden="true" /> Draft nudge</button>}
            </li>)}
          </ul> : <p className="deadline-panel-empty">{group.empty}</p>}
        </section>)}
      </dialog>

      <dialog ref={archive} className="client-editor deadline-dialog" aria-labelledby="archive-title">
        <div className="client-editor-heading">
          <h2 id="archive-title">Archived engagements</h2>
          <button className="client-editor-close" type="button" aria-label="Close archive" onClick={() => archive.current?.close()}><X size={19} /></button>
        </div>
        {archivedClients.length ? <ul className="client-archive-list">
          {archivedClients.map(item => <li key={item.id} className="deadline-panel-item client-archive-item" data-stage={stages.indexOf(item.stage)}>
            <span><strong>{item.client}</strong><small>{item.project} · {item.stage}</small></span>
            <button type="button" onClick={() => {
              if (persistClient({ ...item, archived: false })) setAnnouncement(`${item.client} restored to ${item.stage}.`);
            }} aria-label={`Restore ${item.client}`}><RotateCcw size={14} aria-hidden="true" /> Restore</button>
          </li>)}
        </ul> : <p className="deadline-panel-empty">No archived engagements.</p>}
        {saveError && <p role="alert">{saveError}</p>}
      </dialog>

      <dialog ref={scopeDialog} className="client-editor scope-dialog" aria-labelledby="scope-title" onClose={() => setScopeId(null)}>
        {scopeClient && <ScopeChangePanel key={scopeClient.id} project={scopeClient.project} deadline={scopeClient.deadline} scope={scopeClient.scope}
          onSave={(scope, deadline) => persistClient({ ...scopeClient, scope, deadline: deadline ?? scopeClient.deadline })}
          onClose={() => scopeDialog.current?.close()} />}
        {saveError && <p role="alert">{saveError}</p>}
      </dialog>

      <dialog ref={dialog} className="client-editor" aria-labelledby="client-editor-title" onClose={() => setDraft(null)}>
        {draft && (
          <form onSubmit={saveClient}>
            <div className="client-editor-heading">
              <h2 id="client-editor-title">{draft.id ? 'Edit client engagement' : 'Add a client'}</h2>
              <button type="button" className="client-editor-close" aria-label="Close editor" onClick={() => dialog.current?.close()}><X size={20} /></button>
            </div>
            <label>Client name<input name="client" autoFocus required maxLength={80} defaultValue={draft.client}
              onInput={event => event.currentTarget.setCustomValidity('')} /></label>
            <label>Project<input name="project" required maxLength={100} defaultValue={draft.project}
              onInput={event => event.currentTarget.setCustomValidity('')} /></label>
            <label>Contact name<input name="contact" maxLength={80} defaultValue={draft.contact} /></label>
            <label>Next action<input name="nextAction" maxLength={140} placeholder="e.g. Send the first draft"
              defaultValue={draft.nextAction} /></label>
            <label>Who’s up next?
              <select name="actionOwner" value={draft.actionOwner ?? 'me'} onChange={event => {
                const actionOwner = event.target.value === 'client' ? 'client' : 'me';
                setDraft(current => current && { ...current, actionOwner });
              }}>
                <option value="me">Your move</option>
                <option value="client">Client’s move</option>
              </select>
            </label>
            {draft.actionOwner === 'client' && <DeadlinePicker name="followUp" label="Follow-up date" initialValue={draft.followUp ?? ''} />}
            {draft.scope?.pending?.token
              ? <p className="client-board-note">The deadline is locked while the client review is open.</p>
              : <DeadlinePicker initialValue={draft.deadline} />}
            <label>Stage<select name="stage" defaultValue={draft.stage}>{stages.map(stage => <option key={stage}>{stage}</option>)}</select></label>
            {saveError && <p role="alert">{saveError}</p>}
            <div className="client-editor-actions">
              {draft.id && <button type="button" className="client-archive-action" onClick={() => {
                if (!persistClient({ ...(clients.find(item => item.id === draft.id) ?? draft), archived: true })) return;
                setAnnouncement(`${draft.client} archived.`);
                dialog.current?.close();
              }}><Archive size={15} aria-hidden="true" /> Archive</button>}
              <button type="button" onClick={() => dialog.current?.close()}>Cancel</button>
              <button type="submit" className="client-board-primary">Save client</button>
            </div>
          </form>
        )}
      </dialog>
    </main>
  );
}
