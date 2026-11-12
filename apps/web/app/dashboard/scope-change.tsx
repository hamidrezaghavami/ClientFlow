'use client';

import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { dateLabel, dollars, ReviewOptions, type ReviewChoice, type ReviewTerms } from '../review/review-options';
import { DeadlinePicker } from './deadline-picker';

type Proposal = ReviewTerms & { originalScope: string[]; token?: string; published?: boolean };
type Decision = Omit<Proposal, 'token' | 'published'> & { choice: ReviewChoice; recordedAt: string };
export type ScopeChange = { deliverables: string[]; pending?: Proposal; history: Decision[] };
type ReviewDecision = { choice: ReviewChoice; decidedAt: string };

export async function scopeReviewRequest(body: object) {
  const response = await fetch('/api/scope-review', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: AbortSignal.timeout(10_000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? 'Could not reach the review service.');
  return data;
}

export function applyScopeDecision(scope: ScopeChange, choice: ReviewChoice, recordedAt: string) {
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

export function ScopeChangePanel({ project, deadline, scope, onSave, onClose }: {
  project: string;
  deadline: string;
  scope?: ScopeChange;
  onSave: (scope: ScopeChange, deadline?: string) => boolean;
  onClose: () => void;
}) {
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<ReviewChoice | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const history = scope?.history ?? [];
  const pending = scope?.pending;
  const link = pending?.published && pending.token && typeof window !== 'undefined'
    ? `${window.location.origin}/review#${pending.token}` : '';

  async function publish() {
    if (!pending || busy || deadline !== pending.originalDeadline) return;
    const token = pending.token ?? crypto.randomUUID() + crypto.randomUUID();
    if (!pending.token && !onSave({ deliverables: pending.originalScope, pending: { ...pending, token }, history })) return;
    setBusy(true);
    setError('');
    try {
      const { requested, replaced, originalDeadline, extraCents, newDeadline } = pending;
      const proposal = { requested, replaced, originalDeadline, extraCents, newDeadline };
      const { review } = await scopeReviewRequest({ action: 'publish', token, project, proposal });
      if (review.choice && scope) {
        const decision = review as ReviewDecision;
        const updated = applyScopeDecision(scope, decision.choice, decision.decidedAt);
        if (updated) onSave(updated.scope, updated.deadline);
        return;
      }
      if (!pending.published && !onSave({ deliverables: pending.originalScope, pending: { ...pending, token, published: true }, history })) return;
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/review#${token}`);
        setCopied(true);
      } catch {
        setError('Copy the link from the field above.');
      }
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not publish the review.');
    } finally {
      setBusy(false);
    }
  }

  async function revoke() {
    if (!pending?.token || busy) return;
    setBusy(true);
    setError('');
    try {
      await scopeReviewRequest({ action: 'revoke', token: pending.token });
      if (onSave({ deliverables: pending.originalScope, pending: { ...pending, token: undefined, published: undefined }, history })) setCopied(false);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not revoke the review.');
    } finally {
      setBusy(false);
    }
  }

  const approvedExtras = history.reduce((total, decision) => total + (decision.choice === 'add' ? decision.extraCents : 0), 0);

  function saveProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const requested = String(data.get('requested')).trim();
    const replaced = String(data.get('replaced')).trim();
    const originalScope = [...new Set(String(data.get('deliverables')).split('\n').map(line => line.trim()).filter(Boolean))];
    const extraCents = Math.round(Number(data.get('extra')) * 100);
    const newDeadline = String(data.get('newDeadline'));
    if (!requested || !originalScope.includes(replaced)) {
      setError('Enter the new deliverable and a replacement that matches a line in the current scope.');
      return;
    }
    if (originalScope.some(item => item.toLowerCase() === requested.toLowerCase())) {
      setError('The requested deliverable is already in the current scope.');
      return;
    }
    if (!newDeadline || (deadline && newDeadline < deadline)) {
      setError('Choose a date for the add-on on or after the current deadline.');
      return;
    }
    if (onSave({
      deliverables: originalScope,
      pending: { requested, replaced, originalScope, originalDeadline: deadline, extraCents, newDeadline },
      history,
    })) setError('');
  }

  function recordDecision() {
    if (!scope || !selected || pending?.token) return;
    const updated = applyScopeDecision(scope, selected, new Date().toISOString());
    if (updated && onSave(updated.scope, updated.deadline)) {
      setSelected(null);
      setError('');
    }
  }

  return (
    <>
      <div className="client-editor-heading">
        <div><h2 id="scope-title">Scope changes</h2><p>{project}</p></div>
        <button type="button" className="client-editor-close" aria-label="Close scope changes" onClick={onClose}><X size={19} aria-hidden="true" /></button>
      </div>
      {pending ? (
        <div className="scope-proposal">
          <p className="scope-request"><span>Client request</span><strong>{pending.requested}</strong></p>
          <ReviewOptions terms={pending} selected={selected} onSelect={setSelected} disabled={Boolean(pending.token)} />
          {link && <label className="scope-share-link">Client review link
            <input readOnly value={link} onFocus={event => event.currentTarget.select()} />
          </label>}
          {copied && <p role="status">Review link copied.</p>}
          {error && <p role="alert">{error}</p>}
          {deadline !== pending.originalDeadline && <p role="status">The deadline changed after this proposal was drafted. Discard it and create a new proposal with the updated date.</p>}
          <div className="client-editor-actions scope-actions">
            {pending.token ? <button type="button" disabled={busy} onClick={revoke}>Revoke link</button> : <>
              <button type="button" onClick={() => {
                if (onSave({ deliverables: pending.originalScope, history })) setSelected(null);
              }}>Discard proposal</button>
              <button type="button" disabled={!selected || deadline !== pending.originalDeadline} onClick={recordDecision}>Record approval</button>
            </>}
            <button type="button" className="client-board-primary" disabled={busy || deadline !== pending.originalDeadline} onClick={publish}>
              {busy ? 'Working…' : pending.published ? 'Copy review link' : 'Create and copy link'}
            </button>
          </div>
        </div>
      ) : (
        <form className="scope-proposal" onSubmit={saveProposal}>
          <label>Requested deliverable<input name="requested" placeholder="e.g. Pricing page" required maxLength={120} /></label>
          <label>Current scope <span>One deliverable per line</span>
            <textarea name="deliverables" rows={3} required maxLength={1500} defaultValue={scope?.deliverables.join('\n')} placeholder={'Homepage\nAbout page'} />
          </label>
          <label>Deliverable to replace<input name="replaced" placeholder="e.g. About page" required maxLength={120} /></label>
          <div className="scope-form-grid">
            <label>Add-on price (USD)<input name="extra" type="number" required min="0" max="999999" step="0.01" placeholder="350" /></label>
            <DeadlinePicker name="newDeadline" label="Add-on deadline" initialValue={deadline} />
          </div>
          {error && <p role="alert">{error}</p>}
          <div className="client-editor-actions"><button type="submit" className="client-board-primary">Compare options</button></div>
        </form>
      )}
      {history.length > 0 && <section className="scope-history" aria-label="Approval history">
        <h3>Approval history</h3>
        <p className="scope-history-total">Approved add-ons {dollars.format(approvedExtras / 100)}</p>
        <ol>{history.map(decision => <li key={decision.recordedAt}>
          <strong>{decision.requested} · {decision.choice === 'swap' ? 'Swapped in' : 'Added to scope'}</strong>
          <span>{decision.choice === 'swap'
            ? `Replaced ${decision.replaced} · No extra charge`
            : `Kept ${decision.replaced} · +${dollars.format(decision.extraCents / 100)}`}</span>
          <span>Delivery {dateLabel(decision.originalDeadline)}{decision.choice === 'add' && decision.newDeadline !== decision.originalDeadline
            ? ` → ${dateLabel(decision.newDeadline)}` : ''} · Recorded {dateLabel(decision.recordedAt.slice(0, 10))}</span>
          <details><summary>Original scope</summary><ul>{decision.originalScope.map(item => <li key={item}>{item}</li>)}</ul></details>
        </li>)}</ol>
      </section>}
    </>
  );
}
