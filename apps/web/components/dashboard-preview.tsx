import { Archive, ArrowLeftRight, ArrowUpRight, CalendarDays, ChevronDown, Handshake, LayoutGrid, Search, Sparkles, UserPlus } from 'lucide-react';
import { stages } from '../app/lib/client-board';
import { formatDeadline, initialClients } from '../app/lib/sample-engagements';
import './dashboard-preview.css';

export function DashboardPreview() {
  return (
    <figure className="app-preview dashboard-preview" aria-label="ClientFlow dashboard preview">
      <div className="dashboard-preview-header">
        <span className="dashboard-preview-brand">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>clientflow
        </span>
        <strong>Client engagements</strong>
        <span className="dashboard-preview-account">My workspace <b>AM</b></span>
      </div>
      <div className="dashboard-preview-body">
        <aside className="dashboard-preview-rail" aria-hidden="true">
          <span>Client Board</span>
          <LayoutGrid /><CalendarDays /><UserPlus className="dashboard-preview-add" /><Archive /><Handshake />
        </aside>
        <div className="dashboard-preview-main">
          <div className="dashboard-preview-search" aria-hidden="true"><Search /> Search clients or projects</div>
          <div className="dashboard-preview-grid">
            {stages.map((stage, index) => {
              const clients = initialClients.filter(client => client.stage === stage);
              return <section key={stage} className="preview-client-stage" data-stage={index}>
                <h4><i aria-hidden="true" />{stage}<span>{clients.length}</span></h4>
                {clients.map(client => <article key={client.id} className="dashboard-preview-card">
                  <div className="dashboard-preview-client">
                    <span className="dashboard-preview-avatar" aria-hidden="true">{client.client[0]}</span>
                    <div><strong>{client.client}</strong><small>{client.project}</small></div>
                    <ArrowUpRight className="dashboard-preview-open" aria-hidden="true" />
                  </div>
                  {client.actionOwner === 'client' && <span className="dashboard-preview-pill">Waiting on client</span>}
                  <p><CalendarDays aria-hidden="true" /> Due {formatDeadline(client.deadline)}</p>
                  {client.nextAction && <p className="dashboard-preview-next"><strong>Next action</strong>{client.nextAction}</p>}
                  <span className="dashboard-preview-pill"><ArrowLeftRight aria-hidden="true" /> Scope changes</span>
                  <div className="dashboard-preview-stage">Stage <span className="dashboard-preview-pill">{stage} <ChevronDown aria-hidden="true" /></span></div>
                </article>)}
              </section>;
            })}
          </div>
        </div>
      </div>
      <span className="dashboard-preview-assistant" aria-hidden="true"><Sparkles size={15} /></span>
    </figure>
  );
}
