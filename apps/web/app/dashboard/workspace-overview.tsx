'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, CalendarDays, ChevronRight, LayoutGrid, X } from 'lucide-react';
import { MovableAddClient } from './movable-add-client';
import { ClientAssistant } from './client-assistant';
import { DeadlinePicker } from './deadline-picker';

const stages = ['New', 'In progress', 'In review', 'Delivered'] as const;
type Stage = (typeof stages)[number];
type Engagement = { id: string; client: string; project: string; contact: string; deadline: string; stage: Stage };

const initialClients: Engagement[] = [
  { id: 'atlas', client: 'Atlas Ventures', project: 'Investor pitch deck', contact: 'Sofia Reed', deadline: '2026-11-18', stage: 'New' },
  { id: 'northstar', client: 'Northstar Studio', project: 'Website refresh', contact: 'Maya Chen', deadline: '2026-11-16', stage: 'In progress' },
  { id: 'forma', client: 'Forma Coffee', project: 'Packaging direction', contact: 'Leo Martin', deadline: '2026-11-20', stage: 'In review' },
  { id: 'fieldwork', client: 'Fieldwork Press', project: 'Editorial site handoff', contact: 'Jamie Park', deadline: '2026-11-09', stage: 'Delivered' },
];

function formatDeadline(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${value}T00:00:00Z`));
}

export function WorkspaceOverview() {
  const [clients, setClients] = useState(initialClients);
  const [draft, setDraft] = useState<Engagement | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [today, setToday] = useState('');
  const dueClients = clients
    .filter(item => item.deadline && item.stage !== 'Delivered')
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
  const overdueCount = today ? dueClients.filter(item => item.deadline < today).length : 0;

  useEffect(() => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
    setToday(localDate.toISOString().slice(0, 10));
  }, []);

  const dialog = useRef<HTMLDialogElement>(null);
  const deadlines = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const editor = dialog.current;
    if (draft && editor && !editor.open) editor.showModal();
  }, [draft]);

  function openEditor(client?: Engagement) {
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
    const updated = {
      id: draft.id || crypto.randomUUID(), client, project, stage,
      contact: String(data.get('contact')).trim(), deadline: String(data.get('deadline')),
    };
    setClients(current => draft.id ? current.map(item => item.id === draft.id ? updated : item) : [...current, updated]);
    setAnnouncement(`${client} saved in ${stage}.`);
    dialog.current?.close();
  }

  function moveClient(id: string, stage: Stage) {
    const client = clients.find(item => item.id === id);
    setClients(current => current.map(item => item.id === id ? { ...item, stage } : item));
    if (client) setAnnouncement(`${client.client} moved to ${stage}.`);
  }

  return (
    <main id="workspace-main" className="client-board-shell">
      <nav className="client-tool-rail" aria-label="Client Board">
        <span className="client-tool-label">Client Board</span>
        <a href="#client-board-title" aria-label="Client stages" title="Client stages"><LayoutGrid size={19} aria-hidden="true" /></a>
        <button type="button" aria-label="Due next" title="Due next" aria-haspopup="dialog" onClick={() => deadlines.current?.showModal()}><CalendarDays size={19} aria-hidden="true" /></button>
      </nav>


      <section id="client-board-title" tabIndex={-1} className="client-board-main" aria-labelledby="workspace-title">
        <div className="client-board-heading">
          <MovableAddClient onAdd={() => openEditor()} />
        </div>
        <div className="client-board-columns">
          {stages.map((stage, index) => {
            const items = clients.filter(item => item.stage === stage);
            return (
              <section className="client-board-column" data-stage={index} key={stage} aria-labelledby={`client-stage-${index}`}>
                <h2 id={`client-stage-${index}`}><i data-stage={index} aria-hidden="true" />{stage}<span>{items.length}</span></h2>
                {items.length === 0 && <p className="client-board-empty">No clients here yet.</p>}
                {items.map(item => (
                  <article className="client-board-card" key={item.id}>
                    <button type="button" className="client-board-card-title" onClick={() => openEditor(item)}
                      aria-label={`Edit ${item.client}: ${item.project}`}>
                      <span className="client-board-avatar" aria-hidden="true">{item.client.charAt(0).toUpperCase()}</span>
                      <span><strong>{item.client}</strong><small>{item.project}</small></span>
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </button>
                    <div className="client-board-card-meta">
                      {item.contact && <span>{item.contact}</span>}
                      {item.deadline && <span><CalendarDays size={14} aria-hidden="true" /> Due {formatDeadline(item.deadline)}</span>}
                    </div>
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
                  </article>
                ))}
              </section>
            );
          })}
        </div>
        <p className="client-board-note">Sample workspace. Changes reset when you reload.</p>
        <p className="sr-only" role="status">{announcement}</p>
      </section>

      <ClientAssistant projects={clients.filter(item => item.stage !== 'Delivered').map(item => ({
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
            <DeadlinePicker initialValue={draft.deadline} />
            <label>Stage<select name="stage" defaultValue={draft.stage}>{stages.map(stage => <option key={stage}>{stage}</option>)}</select></label>
            <div className="client-editor-actions">
              <button type="button" onClick={() => dialog.current?.close()}>Cancel</button>
              <button type="submit" className="client-board-primary">Save client</button>
            </div>
          </form>
        )}
      </dialog>
    </main>
  );
}
