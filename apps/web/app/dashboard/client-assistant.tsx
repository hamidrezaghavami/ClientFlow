'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ArrowUpRight, Sparkles } from 'lucide-react';

type ProjectContext = {
  project: string;
  stage: string;
  deadline: string | null;
};

const apiUrl = process.env.NEXT_PUBLIC_CLIENTFLOW_API_URL?.replace(/\/$/, '');
const suggestions = ['What should I prioritize?', 'Draft a client follow-up', 'Help me plan a handoff'];

export function ClientAssistant({ projects }: { projects: ProjectContext[] }) {
  const { getToken } = useAuth();
  const [question, setQuestion] = useState('');
  const [includeBoard, setIncludeBoard] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!apiUrl || !question.trim() || pending) return;
    setPending(true);
    setError('');
    setAnswer('');
    try {
      const token = await getToken();
      if (!token) throw new Error('Sign in again to use the assistant.');
      const response = await fetch(`${apiUrl}/assistant`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(25_000),
        body: JSON.stringify({ question, projects: includeBoard ? projects.slice(0, 20) : [] }),
      });
      const data = await response.json() as { answer?: string; error?: string };
      if (!response.ok || !data.answer) throw new Error(data.error ?? 'The assistant is unavailable.');
      setAnswer(data.answer);
    } catch (problem) {
      setError(problem instanceof Error && problem.name === 'Error' ? problem.message : 'The assistant did not respond. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="assistant-panel" aria-labelledby="client-assistant-title">
      <div className="assistant-heading">
        <span className="assistant-icon"><Sparkles size={20} aria-hidden="true" /></span>
        <div>
          <h2 id="client-assistant-title" tabIndex={-1}>Client assistant</h2>
          <p>Prioritize projects, draft follow-ups, and plan client handoffs with Gemini.</p>
        </div>
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
    </section>
  );
}
