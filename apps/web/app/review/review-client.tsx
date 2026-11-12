'use client';

import { useEffect, useState } from 'react';
import { ReviewOptions, type ReviewChoice, type ReviewTerms } from './review-options';

type Review = { project: string; proposal: ReviewTerms; choice: ReviewChoice | null };

export function ReviewClient() {
  const [token, setToken] = useState('');
  const [review, setReview] = useState<Review>();
  const [selected, setSelected] = useState<ReviewChoice | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const secret = window.location.hash.slice(1);
    if (!/^[a-f0-9-]{72}$/.test(secret)) {
      setError('This review link is incomplete.');
      return;
    }
    setToken(secret);
    const controller = new AbortController();
    fetch('/api/scope-review', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'read', token: secret }), signal: controller.signal,
    }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setReview(result.review);
    }).catch(problem => {
      if (!controller.signal.aborted) setError(problem.message || 'Could not load this review.');
    });
    return () => controller.abort();
  }, []);

  async function approve() {
    if (!review || !selected || pending) return;
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/scope-review', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', token, choice: selected }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setReview({ ...review, choice: result.review.choice });
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not save your decision.');
    } finally {
      setPending(false);
    }
  }

  return <main className="workspace scope-review-page">
    <section className="scope-review-card" aria-labelledby="review-title">
      <p className="scope-review-brand">clientflow</p>
      <h1 id="review-title">Review a scope change</h1>
      {review ? <>
        <p className="scope-request"><span>{review.project}</span><strong>{review.proposal.requested}</strong></p>
        <ReviewOptions terms={review.proposal} selected={review.choice ?? selected} onSelect={setSelected} disabled={Boolean(review.choice) || pending} />
        {review.choice ? <p className="scope-review-confirmation" role="status">
          Decision saved · {review.choice === 'swap' ? 'Swap it in' : 'Add to scope'}
        </p> : <div className="client-editor-actions scope-actions">
          <button type="button" className="client-board-primary" disabled={!selected || pending} onClick={approve}>
            {pending ? 'Saving…' : 'Approve selected option'}
          </button>
        </div>}
      </> : !error && <p role="status">Loading your review…</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  </main>;
}
