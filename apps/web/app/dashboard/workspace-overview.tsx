'use client';

import { useState } from 'react';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';

const projects = [
  { id: 'northstar', name: 'Website refresh', client: 'Northstar Studio', deadline: 'Nov 16', initial: 'N', contact: 'Maya Chen', deliverable: 'A responsive marketing site with a clearer portfolio and inquiry flow.' },
  { id: 'forma', name: 'Brand launch', client: 'Forma Coffee', deadline: 'Nov 20', initial: 'F', contact: 'Leo Martin', deliverable: 'A brand kit with packaging direction for the first coffee release.' },
  { id: 'atlas', name: 'Pitch deck', client: 'Atlas Ventures', deadline: 'Nov 18', initial: 'A', contact: 'Sofia Reed', deliverable: 'An investor deck with a clear narrative and updated financial highlights.' },
] as const;

const tasks = [
  { id: 1, project: 'forma', name: 'Approve packaging direction', due: 'Overdue', done: false },
  { id: 2, project: 'northstar', name: 'Review homepage wireframes', due: 'Overdue', done: false },
  { id: 3, project: 'northstar', name: 'Build responsive layouts', due: 'Nov 13', done: false },
  { id: 4, project: 'atlas', name: 'Review the investor narrative', due: 'Nov 14', done: false },
  { id: 5, project: 'northstar', name: 'Approve sitemap', due: 'Nov 6', done: true },
  { id: 6, project: 'forma', name: 'Review brand brief', due: 'Nov 7', done: true },
  { id: 7, project: 'atlas', name: 'Collect financial highlights', due: 'Nov 10', done: true },
];

type ProjectId = (typeof projects)[number]['id'];

export function WorkspaceOverview() {
  const [completed, setCompleted] = useState(() => new Set(tasks.filter(task => task.done).map(task => task.id)));
  const [selectedId, setSelectedId] = useState<ProjectId>('northstar');
  const project = projects.find(item => item.id === selectedId) ?? projects[0];
  const projectTasks = tasks.filter(task => task.project === project.id);
  const projectDone = projectTasks.filter(task => completed.has(task.id)).length;
  const nextTask = projectTasks.find(task => !completed.has(task.id));
  const overdue = tasks.filter(task => task.due === 'Overdue' && !completed.has(task.id)).length;

  function toggleTask(id: number) {
    setCompleted(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <main id="workspace-main" className="workspace-width workspace-main">
      <div className="workspace-intro">
        <div>
          <h1>Client work</h1>
          <p>{projects.length} active projects · {overdue === 1 ? '1 overdue action' : `${overdue} overdue actions`}</p>
        </div>
        <span className="workspace-demo">Sample workspace</span>
      </div>

      <div className="client-work-grid">
        <section className="client-roster" aria-labelledby="client-roster-title">
          <h2 id="client-roster-title">Clients</h2>
          <ul className="client-roster-list">
            {projects.map(item => {
              const needsAttention = tasks.some(task => task.project === item.id && task.due === 'Overdue' && !completed.has(task.id));
              return (
                <li key={item.id}>
                  <button className="client-choice" aria-pressed={item.id === selectedId}
                    aria-controls="client-project-brief" onClick={() => setSelectedId(item.id)}>
                    <span className={`workspace-initial client-mark-${item.id}`} aria-hidden="true">{item.initial}</span>
                    <span><strong>{item.client}</strong><small>{item.name}</small>
                      {needsAttention && <small className="client-attention">Needs attention</small>}
                    </span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <article className="client-brief" id="client-project-brief" aria-labelledby="client-project-title">
          <div className="client-brief-heading">
            <div className="client-context">
              <span className={`workspace-initial client-mark-${project.id}`} aria-hidden="true">{project.initial}</span>
              <span>{project.client}<small>{project.contact}</small></span>
            </div>
            <span className="client-deadline">Due {project.deadline}</span>
          </div>
          <h2 id="client-project-title">{project.name}</h2>
          <p className="client-deliverable">{project.deliverable}</p>
          <div className="client-progress">
            <span>Project progress</span><span>{projectDone} of {projectTasks.length} complete</span>
            <progress value={projectDone} max={projectTasks.length} aria-label="Project task progress" />
          </div>
          <div className="client-next" aria-live="polite">
            <ArrowRight size={19} aria-hidden="true" />
            <div>
              <h3>Next action</h3>
              <p>{nextTask?.name ?? 'All project tasks are complete.'}</p>
            </div>
            {nextTask && <span className={`workspace-due${nextTask.due === 'Overdue' ? ' is-overdue' : ''}`}>{nextTask.due}</span>}
          </div>
          <details className="client-checklist">
            <summary>Project checklist</summary>
            <ul className="workspace-task-list">
              {projectTasks.map(task => {
                const done = completed.has(task.id);
                return (
                  <li key={task.id} className="workspace-task">
                    <label>
                      <input type="checkbox" checked={done} onChange={() => toggleTask(task.id)} />
                      <span className="workspace-checkbox" aria-hidden="true">{done && <Check size={14} />}</span>
                      <span className={done ? 'workspace-task-name is-done' : 'workspace-task-name'}>{task.name}</span>
                    </label>
                    <span className={`workspace-due${task.due === 'Overdue' && !done ? ' is-overdue' : ''}`}>{done ? 'Done' : task.due}</span>
                  </li>
                );
              })}
            </ul>
          </details>
        </article>
      </div>
      <p className="workspace-note">Sample changes reset when you reload.</p>
    </main>
  );
}
