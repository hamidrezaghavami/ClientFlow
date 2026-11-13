'use client';

import { translate, type Language } from '../../components/landing-language';

import { useAuth } from '@clerk/nextjs';
import { postApi } from '../lib/api';
import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { dateLabel, dollars, ReviewOptions, type ReviewChoice, type ReviewTerms } from '../review/review-options';
import { DeadlinePicker } from './deadline-picker';
import { applyScopeDecision, type ScopeChange } from '../lib/client-board';

export function ScopeChangePanel({ language = 'en', project, deadline, scope, onSave, onRefresh, onClose }: { language?: Language;
  project: string;
  deadline: string;
  scope?: ScopeChange;
  onSave: (scope: ScopeChange, deadline?: string) => Promise<boolean>;
  onRefresh: () => Promise<void>;
  onClose: () => void;
}) {
  const t = translate(language);
  const { getToken } = useAuth();

  async function scopeReviewRequest(body: object) {
    const token = await getToken();
    if (!token) throw new Error('Sign in again to manage review links.');
    const response = await postApi('scope-review', body, AbortSignal.timeout(10_000), token);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? 'Could not reach the review service.');
    return data;
  }

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
    setBusy(true);
    setError('');
    try {
      if (!pending.token && !await onSave({ deliverables: pending.originalScope, pending: { ...pending, token }, history })) return;
      const { requested, replaced, originalDeadline, extraCents, newDeadline } = pending;
      const proposal = { requested, replaced, originalDeadline, extraCents, newDeadline };
      const { review } = await scopeReviewRequest({ action: 'publish', token, project, proposal });
      await onRefresh();
      if (review.choice) return;
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/review#${token}`);
        setCopied(true);
      } catch {
        setError(t("Copy the link from the field above."));
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
      await onRefresh();
      setCopied(false);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not revoke the review.');
    } finally {
      setBusy(false);
    }
  }

  const approvedExtras = history.reduce((total, decision) => total + (decision.choice === 'add' ? decision.extraCents : 0), 0);

  async function saveProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const requested = String(data.get('requested')).trim();
    const replaced = String(data.get('replaced')).trim();
    const originalScope = [...new Set(String(data.get('deliverables')).split('\n').map(line => line.trim()).filter(Boolean))];
    const extraCents = Math.round(Number(data.get('extra')) * 100);
    const newDeadline = String(data.get('newDeadline'));
    if (!requested || !originalScope.includes(replaced)) {
      setError(t("Enter the new deliverable and a replacement that matches a line in the current scope."));
      return;
    }
    if (originalScope.some(item => item.toLowerCase() === requested.toLowerCase())) {
      setError(t("The requested deliverable is already in the current scope."));
      return;
    }
    if (!newDeadline || (deadline && newDeadline < deadline)) {
      setError(t("Choose a date for the add-on on or after the current deadline."));
      return;
    }
    setBusy(true);
    const saved = await onSave({
      deliverables: originalScope,
      pending: { requested, replaced, originalScope, originalDeadline: deadline, extraCents, newDeadline },
      history,
    });
    setBusy(false);
    if (saved) setError('');
  }

  async function recordDecision() {
    if (!scope || !selected || pending?.token) return;
    const updated = applyScopeDecision(scope, selected, new Date().toISOString());
    if (updated && await onSave(updated.scope, updated.deadline)) {
      setSelected(null);
      setError('');
    }
  }

  return (
    <>
      <div className="client-editor-heading">
        <div><h2 id="scope-title">{t("Scope changes")}</h2><p>{project}</p></div>
        <button type="button" className="client-editor-close" aria-label={t("Close scope changes")}  onClick={onClose}><X size={19} aria-hidden="true" /></button>
      </div>
      {pending ? (
        <div className="scope-proposal">
          <p className="scope-request"><span>{t("Client request")}</span><strong>{pending.requested}</strong></p>
          <ReviewOptions language={language} terms={pending} selected={selected} onSelect={setSelected} disabled={Boolean(pending.token)} />
          {link && <label className="scope-share-link">{t("Client review link")}
            <input readOnly value={link} onFocus={event => event.currentTarget.select()} />
          </label>}
          {copied && <p role="status">{t("Review link copied.")}</p>}
          {error && <p role="alert">{error}</p>}
          {deadline !== pending.originalDeadline && <p role="status">{t("The deadline changed after this proposal was drafted. Discard it and create a new proposal with the updated date.")}</p>}
          <div className="client-editor-actions scope-actions">
            {pending.token ? <button type="button" disabled={busy} onClick={revoke}>{t("Revoke link")}</button> : <>
              <button type="button" disabled={busy} onClick={async () => {
                if (await onSave({ deliverables: pending.originalScope, history })) setSelected(null);
              }}>{t("Discard proposal")}</button>
              <button type="button" disabled={busy || !selected || deadline !== pending.originalDeadline} onClick={recordDecision}>{t("Record approval")}</button>
            </>}
            <button type="button" className="client-board-primary" disabled={busy || deadline !== pending.originalDeadline} onClick={publish}>
              {busy ? t("Working…") : pending.published ? t("Copy review link") : t("Create and copy link")}
            </button>
          </div>
        </div>
      ) : (
        <form className="scope-proposal" onSubmit={saveProposal}>
          <label>{t("Requested deliverable")}<input name="requested" placeholder={t("e.g. Pricing page")}  required maxLength={120} /></label>
          <label>{t("Current scope")} <span>{t("One deliverable per line")}</span>
            <textarea name="deliverables" rows={3} required maxLength={1500} defaultValue={scope?.deliverables.join('\n')} placeholder={'Homepage\nAbout page'} />
          </label>
          <label>{t("Deliverable to replace")}<input name="replaced" placeholder={t("e.g. About page")}  required maxLength={120} /></label>
          <div className="scope-form-grid">
            <label>{t("Add-on price (USD)")}<input name="extra" type="number" required min="0" max="999999" step="0.01" placeholder="350" /></label>
            <DeadlinePicker language={language} name="newDeadline" label={t("Add-on deadline")}  initialValue={deadline} />
          </div>
          {error && <p role="alert">{error}</p>}
          <div className="client-editor-actions"><button type="submit" className="client-board-primary" disabled={busy}>{t("Compare options")}</button></div>
        </form>
      )}
      {history.length > 0 && <section className="scope-history" aria-label={t("Approval history")} >
        <h3>{t("Approval history")}</h3>
        <p className="scope-history-total">{t("Approved add-ons")} {dollars.format(approvedExtras / 100)}</p>
        <ol>{history.map(decision => <li key={decision.recordedAt}>
          <strong>{decision.requested} · {decision.choice === 'swap' ? t("Swapped in") : t("Added to scope")}</strong>
          <span>{decision.choice === 'swap'
            ? `Replaced ${decision.replaced} · No extra charge`
            : `Kept ${decision.replaced} · +${dollars.format(decision.extraCents / 100)}`}</span>
          <span>{t("Delivery")} {dateLabel(decision.originalDeadline)}{decision.choice === 'add' && decision.newDeadline !== decision.originalDeadline
            ? ` → ${dateLabel(decision.newDeadline)}` : ''} · Recorded {dateLabel(decision.recordedAt.slice(0, 10))}</span>
          <details><summary>{t("Original scope")}</summary><ul>{decision.originalScope.map(item => <li key={item}>{item}</li>)}</ul></details>
        </li>)}</ol>
      </section>}
    </>
  );
}
