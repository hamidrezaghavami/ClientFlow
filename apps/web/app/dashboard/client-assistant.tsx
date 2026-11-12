'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ArrowUp, Sparkles, X } from 'lucide-react';

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
  const [sent, setSent] = useState('');
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
    setSent('');
    setAnswer('');
    setError('');
    setPending(false);
    setOpen(true);
    panel.current?.querySelector('textarea')?.focus();
  }, [draft]);

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = question.trim();
    if (!apiUrl || !message || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setSent(message);
    setQuestion('');
    setError('');
    setAnswer('');
    try {
      const token = await getToken();
      if (!token) throw new Error('Sign in again to use the assistant.');
      const response = await fetch(`${apiUrl}/assistant`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(25_000)]),
        body: JSON.stringify({ question: message, projects: includeBoard ? projects.slice(0, 20) : [] }),
      });
      const data = await response.json() as { answer?: string; error?: string };
      if (!response.ok || !data.answer) throw new Error(data.error ?? 'The assistant is unavailable.');
      if (!controller.signal.aborted) setAnswer(data.answer);
    } catch (problem) {
      if (!controller.signal.aborted) {
        setError(problem instanceof Error && problem.name === 'Error' ? problem.message : 'Gemini did not respond. Try again.');
        setQuestion(message);
      }
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
        </div>
        <button type="button" className="assistant-close" onClick={close} aria-label="Close assistant panel">
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      {apiUrl ? <>
        <div className="assistant-conversation" aria-live="polite">
          {sent && <div className="assistant-message assistant-message-user"><span>You</span><p>{sent}</p></div>}
          {(pending || answer) && <div className="assistant-message assistant-message-reply">
            <span><Sparkles size={13} aria-hidden="true" /> Gemini</span>
            <p>{pending ? 'Thinking…' : answer}</p>
          </div>}
          {error && <p className="assistant-error" role="alert">{error}</p>}
        </div>
        {!sent && !question && <div className="assistant-suggestions">
          {suggestions.map(prompt => <button type="button" key={prompt} onClick={() => {
            setQuestion(prompt);
            panel.current?.querySelector('textarea')?.focus();
          }}>{prompt}</button>)}
        </div>}
        <form className="assistant-form" onSubmit={ask}>
          <div className="assistant-composer">
            <label className="sr-only" htmlFor="assistant-question">Message Gemini</label>
            <textarea id="assistant-question" value={question} onChange={event => setQuestion(event.target.value)}
              placeholder="Message Gemini…" rows={2} maxLength={1200} required readOnly={pending} />
            <button type="submit" className="client-board-primary assistant-send" disabled={pending || !question.trim()}
              aria-label="Send message" title="Send message"><ArrowUp size={18} aria-hidden="true" /></button>
          </div>
          <div className="assistant-actions">
            <label><input type="checkbox" checked={includeBoard} disabled={pending} onChange={event => setIncludeBoard(event.target.checked)} /> Include open projects</label>
            <details className="assistant-disclosure">
              <summary>What’s shared?</summary>
              <p>Your message goes to Google Gemini. If selected, up to 20 open project titles, stages, and deadlines go with it. Avoid confidential details.</p>
            </details>
          </div>
        </form>
      </> : <p className="assistant-disclosure">Gemini is awaiting setup.</p>}
      </section>}
    </div>
  );
}
