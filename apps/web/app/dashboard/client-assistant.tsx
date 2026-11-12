'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ArrowUpRight, Sparkles, X } from 'lucide-react';

type ProjectContext = {
  project: string;
  stage: string;
  deadline: string | null;
};

const apiUrl = process.env.NEXT_PUBLIC_CLIENTFLOW_API_URL?.replace(/\/$/, '');
const suggestions = ['What should I prioritize?', 'Draft a client follow-up', 'Help me plan a handoff'];

export function ClientAssistant({ projects, draft }: { projects: ProjectContext[]; draft?: { question: string } }) {
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    if (open) (panel.current?.querySelector('textarea') ?? panel.current?.querySelector<HTMLButtonElement>('.assistant-close'))?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    launcher.current?.focus();
  }

  const [question, setQuestion] = useState('');
  const [includeBoard, setIncludeBoard] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const request = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!draft) return;
    request.current?.abort();
    request.current = null;
    setQuestion(draft.question);
    setIncludeBoard(false);
    setAnswer('');
    setError('');
    setPending(false);
    setOpen(true);
    panel.current?.querySelector('textarea')?.focus();
  }, [draft]);

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!apiUrl || !question.trim() || pending) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setError('');
    setAnswer('');
    try {
      const token = await getToken();
      if (!token) throw new Error('Sign in again to use the assistant.');
      const response = await fetch(`${apiUrl}/assistant`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(25_000)]),
        body: JSON.stringify({ question, projects: includeBoard ? projects.slice(0, 20) : [] }),
      });
      const data = await response.json() as { answer?: string; error?: string };
      if (!response.ok || !data.answer) throw new Error(data.error ?? 'The assistant is unavailable.');
      if (!controller.signal.aborted) setAnswer(data.answer);
    } catch (problem) {
      if (!controller.signal.aborted) setError(problem instanceof Error && problem.name === 'Error' ? problem.message : 'The assistant did not respond. Try again.');
    } finally {
      if (request.current === controller) {
        request.current = null;
        setPending(false);
      }
    }
  }

  return (
    <div className="assistant-widget" onKeyDown={event => {
      if (open && event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    }}>
      <button ref={launcher} type="button" className="assistant-launcher" aria-expanded={open}
        aria-controls={open ? 'client-assistant-panel' : undefined}
        aria-label={open ? 'Close client assistant' : 'Open client assistant'}
        title={open ? 'Close client assistant' : 'Open client assistant'}
        onClick={() => open ? close() : setOpen(true)}>
        <Sparkles size={25} aria-hidden="true" />
      </button>
      {open && <section ref={panel} id="client-assistant-panel" className="assistant-panel" aria-labelledby="client-assistant-title">
      <div className="assistant-heading">
        <span className="assistant-icon"><Sparkles size={20} aria-hidden="true" /></span>
        <div>
          <h2 id="client-assistant-title" tabIndex={-1}>Client assistant</h2>
          <p>Plan client work with Gemini.</p>
        </div>
        <button type="button" className="assistant-close" onClick={close} aria-label="Close assistant panel">
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      {apiUrl ? (
        <form onSubmit={ask}>
          <label className="sr-only" htmlFor="assistant-question">Ask about your client work</label>
          <textarea id="assistant-question" value={question} onChange={event => setQuestion(event.target.value)}
            placeholder="What would you like help with?" maxLength={1200} required />
          <div className="assistant-suggestions">
            {suggestions.map(prompt => <button type="button" key={prompt} onClick={() => setQuestion(prompt)}>{prompt}</button>)}
          </div>
          <div className="assistant-actions">
            <label><input type="checkbox" checked={includeBoard} onChange={event => setIncludeBoard(event.target.checked)} /> Include up to 20 open projects</label>
            <button type="submit" className="client-board-primary" disabled={pending || !question.trim()}>
              {pending ? 'Asking Gemini…' : 'Ask Gemini'}<ArrowUpRight size={16} aria-hidden="true" />
            </button>
          </div>
          <p className="assistant-disclosure">Your question goes to Google Gemini. If selected, project titles, stages, and deadlines go with it. Avoid entering confidential information.</p>
        </form>
      ) : <p className="assistant-disclosure">Gemini is awaiting setup.</p>}
      <div className="assistant-result" aria-live="polite" aria-busy={pending}>
        {error && <p role="alert">{error}</p>}
        {answer && <p>{answer}</p>}
      </div>
      </section>}
    </div>
  );
}
