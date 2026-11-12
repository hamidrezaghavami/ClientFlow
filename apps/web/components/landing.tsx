'use client';

import Link from 'next/link';
import { DashboardPreview } from './dashboard-preview';
import { ScopeHero } from './scope-hero';
import { stages, type Engagement } from '../app/lib/client-board';
import { formatDeadline, initialClients } from '../app/lib/sample-engagements';
import './landing-theme.css';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, ArrowUp, Check, Folder, X, Menu, RotateCcw, ArrowLeftRight, Plus } from 'lucide-react';

type Panel = 'demo' | null;
function Mark() { return <span className="brand-mark" aria-hidden="true"><i/><i/><i/></span>; }
function Brand() { return <a className="brand" href="#" aria-label="ClientFlow home"><Mark/>clientflow<span className="brand-dot">®</span></a>; }

export default function Landing() {
  const [panel, setPanel] = useState<Panel>(null);
  const [menu, setMenu] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [demoClients, setDemoClients] = useState(initialClients);
  const [announcement, setAnnouncement] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (panel) { dialog.current?.showModal(); document.body.style.overflow = 'hidden'; }
    else { dialog.current?.close(); document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [panel]);
  useEffect(() => {
    const items = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setShowBackToTop(window.scrollY > 320);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const open = (p: Panel) => { setMenu(false); setPanel(p); };
  return <div className="landing-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <header id="top" tabIndex={-1} className="site-header"><div className="header-inner"><Brand/><nav className="desktop-nav" aria-label="Main navigation"><a href="#features">Why ClientFlow</a><a href="#how-it-works">How it works</a><button onClick={() => open('demo')}>Take a tour <ArrowUpRight size={14}/></button></nav><div className="header-actions"><Link className="signin" href="/sign-in">Sign in</Link><Link className="button dark small" href="/sign-up">Get started <ArrowUpRight size={16}/></Link></div><button className="menu-toggle" aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button></div>{menu && <nav className="mobile-nav" aria-label="Mobile navigation"><a href="#features" onClick={() => setMenu(false)}>Why ClientFlow</a><a href="#how-it-works" onClick={() => setMenu(false)}>How it works</a><button onClick={() => open('demo')}>Explore demo</button><Link href="/sign-in">Sign in</Link><Link href="/sign-up">Get started</Link></nav>}</header>
    <main id="main">
      <ScopeHero onTour={() => open('demo')} />
      <section className="features-section section-wrap" id="features"><div className="section-heading" data-reveal><p className="eyebrow">THE WORKSPACE</p><h2>Run your client work.<br/><span className="draw-underline">Keep scope clear.</span></h2><p>Track what’s due, what’s waiting, and what your clients have agreed to.</p></div><div className="feature-grid"><article data-reveal><div className="feature-art people-art"><span className="person-circle">MC</span><div><strong>Northstar Studio</strong><span>Maya Chen</span></div><span className="mini-tag">Client</span></div><h3>Keep client details together.</h3><p>Keep clients, project details, and deadlines together so you can pick up where you left off.</p></article><article data-reveal><div className="feature-art projects-art"><span><Folder size={20}/> Website refresh</span><div><i/><i/><i/><i/><i/><i/></div><small>Every step has its place.</small></div><h3>Know what comes next.</h3><p>From the first idea to the final handoff. Know what’s moving and what needs your attention.</p></article><article data-reveal><div className="feature-art scope-feature-art"><span><ArrowLeftRight size={16}/> Swap it in</span><span><Plus size={16}/> Add to scope</span><span><Check size={16}/> Client approved</span></div><h3>Get scope changes approved.</h3><p>Share two clear options with one link and keep the client’s decision with the project.</p></article></div></section>
      <section className="showcase-section section-wrap" id="how-it-works"><div className="showcase-copy" data-reveal><p className="eyebrow">THE CLIENT BOARD</p><h2>See the next move.<br/><span className="draw-underline">Stay on track.</span></h2><p>Follow each engagement from first contact to delivery.</p><ol><li><span>01</span><div><strong>Add an engagement</strong><p>Record the client, project, and deadline.</p></div></li><li><span>02</span><div><strong>Set the next action</strong><p>See whether it’s your move or you’re waiting on the client.</p></div></li><li><span>03</span><div><strong>Agree on scope changes</strong><p>Share two options and save the client’s decision.</p></div></li></ol><button className="text-link" onClick={() => open('demo')}>Step inside the demo <ArrowRight size={18}/></button></div><div className="preview-reveal" data-reveal><DashboardPreview /></div></section>
      <section className="final-cta" data-reveal>
        <h2>Take on your <em className="draw-underline">next client.</em></h2>
        <Link className="scope-hero-cta" href="/sign-up">Get started <ArrowUpRight size={21} aria-hidden="true" /></Link>
      </section>
    </main><footer className="site-footer" data-reveal><Brand/><p>© {new Date().getFullYear()} ClientFlow</p></footer>
    {showBackToTop && (
      <a href="#top" className="back-to-top" aria-label="Back to top" title="Back to top">
        <ArrowUp size={22} aria-hidden="true" />
      </a>
    )}
    <dialog ref={dialog} className="review-dialog demo-dialog" onCancel={() => setPanel(null)}
      onClose={() => setPanel(null)} onClick={event => { if (event.target === event.currentTarget) setPanel(null); }}
      aria-labelledby="dialog-title">
      {panel === 'demo' && <>
        <button type="button" className="close-dialog" autoFocus aria-label="Close" onClick={() => setPanel(null)}><X size={21} aria-hidden="true" /></button>
        <h2 id="dialog-title">Explore the client board</h2>
        <p className="dialog-description">Move a sample engagement to another stage. Demo changes last for this visit.</p>
        <div className="demo-summary">
          <span>{demoClients.filter(client => client.stage === 'Delivered').length} of {demoClients.length} delivered</span>
          <button type="button" className="text-link" onClick={() => {
            setDemoClients(initialClients);
            setAnnouncement('Demo board reset.');
          }}><RotateCcw size={14} aria-hidden="true" /> Reset demo</button>
        </div>
        <div className="demo-board">
          {stages.map((stage, index) => {
            const clients = demoClients.filter(client => client.stage === stage);
            return <section key={stage} className="preview-client-stage" data-stage={index}>
              <h3>{stage}<span>{clients.length}</span></h3>
              {clients.map(client => <article key={client.id}>
                <h4>{client.client}</h4>
                <p>{client.project} · Due {formatDeadline(client.deadline)}</p>
                <label>Stage<select value={client.stage} aria-label={`Stage for ${client.client}`} onChange={event => {
                  const next = event.target.value as Engagement['stage'];
                  setDemoClients(current => current.map(item => item.id === client.id ? { ...item, stage: next } : item));
                  setAnnouncement(`${client.client} moved to ${next}.`);
                  requestAnimationFrame(() => document.getElementById(`demo-stage-${client.id}`)?.focus());
                }} id={`demo-stage-${client.id}`}>
                  {stages.map(option => <option key={option}>{option}</option>)}
                </select></label>
              </article>)}
            </section>;
          })}
        </div>
      </>}
      <p className="sr-only" aria-live="polite">{announcement}</p>
    </dialog>
  </div>;
}
