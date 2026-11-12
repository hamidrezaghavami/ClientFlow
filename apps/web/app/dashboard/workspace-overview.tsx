'use client';

import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Check, CheckCircle2, Clock3, FolderOpen } from 'lucide-react';

const projects = [
  { id: 'northstar', name: 'Website refresh', client: 'Northstar Studio', deadline: 'Nov 16', initial: 'N' },
  { id: 'forma', name: 'Brand launch', client: 'Forma Coffee', deadline: 'Nov 20', initial: 'F' },
  { id: 'atlas', name: 'Pitch deck', client: 'Atlas Ventures', deadline: 'Nov 18', initial: 'A' },
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
  const [projectFilter, setProjectFilter] = useState<ProjectId | null>(null);
  const visibleTasks = projectFilter ? tasks.filter(task => task.project === projectFilter) : tasks;
  const selectedProject = projects.find(project => project.id === projectFilter);
  const overdue = tasks.filter(task => task.due === 'Overdue' && !completed.has(task.id)).length;
  const summary = [
    { label: 'Active projects', value: projects.length, icon: FolderOpen },
    { label: 'Tasks completed', value: `${completed.size} / ${tasks.length}`, icon: CheckCircle2 },
    { label: 'Overdue tasks', value: overdue, icon: Clock3 },
  ];

  function toggleTask(id: number) {
    setCompleted(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function filterTasks(id: ProjectId) {
    setProjectFilter(id);
    const heading = document.getElementById('workspace-tasks');
    heading?.focus();
  }

  return (
    <main id="workspace-main" className="workspace-width workspace-main">
      <div className="workspace-intro">
        <div>
          <h1>Dashboard</h1>
          <p>See what’s due and keep your projects moving.</p>
        </div>
        <span className="workspace-demo">Sample workspace</span>
      </div>

      <dl className="workspace-metrics" aria-label="Workspace summary" aria-live="polite">
        {summary.map(({ label, value, icon: Icon }) => (
          <div key={label} className="workspace-metric">
            <dt><Icon size={17} aria-hidden="true" />{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <div className="workspace-columns">
        <section className="workspace-panel" aria-labelledby="workspace-tasks">
          <div className="workspace-panel-title">
            <div>
              <h2 id="workspace-tasks" tabIndex={-1}>Tasks</h2>
              <p>{selectedProject ? selectedProject.name : 'Check off tasks as you finish them.'}</p>
            </div>
            {projectFilter && <button className="workspace-clear" onClick={() => setProjectFilter(null)}>Show all</button>}
          </div>
          <ul className="workspace-task-list">
            {visibleTasks.map(task => {
              const done = completed.has(task.id);
              return (
                <li key={task.id} className="workspace-task">
                  <label>
                    <input type="checkbox" checked={done} onChange={() => toggleTask(task.id)} />
                    <span className="workspace-checkbox" aria-hidden="true">{done && <Check size={14} />}</span>
                    <span>
                      <span className={done ? 'workspace-task-name is-done' : 'workspace-task-name'}>{task.name}</span>
                      <small>{projects.find(project => project.id === task.project)?.name}</small>
                    </span>
                  </label>
                  <span className={task.due === 'Overdue' && !done ? 'workspace-due is-overdue' : 'workspace-due'}>
                    {done ? 'Done' : task.due}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="workspace-panel" aria-labelledby="workspace-projects">
          <div className="workspace-panel-title">
            <div><h2 id="workspace-projects">Active projects</h2><p>Select a project to see its tasks.</p></div>
            <ArrowDownRight size={18} className="workspace-project-hint" aria-hidden="true" />
          </div>
          <ul className="workspace-project-list">
            {projects.map(project => {
              const projectTasks = tasks.filter(task => task.project === project.id);
              const done = projectTasks.filter(task => completed.has(task.id)).length;
              return (
                <li key={project.id}>
                  <button className="workspace-project" aria-pressed={projectFilter === project.id} onClick={() => filterTasks(project.id)}>
                    <span className="workspace-project-heading">
                      <span className="workspace-initial" aria-hidden="true">{project.initial}</span>
                      <span><strong>{project.name}</strong><small>{project.client}</small></span>
                      <ArrowUpRight size={16} className="workspace-project-arrow" aria-hidden="true" />
                    </span>
                    <progress max={projectTasks.length} value={done} aria-label={`${project.name} task progress`} />
                    <span className="workspace-project-meta"><span>{done} of {projectTasks.length} tasks</span><span>Due {project.deadline}</span></span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
      <p className="workspace-note">Changes in this sample workspace reset when you reload the page.</p>
    </main>
  );
}
