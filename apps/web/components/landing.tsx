'use client';

import Link from 'next/link';
import { DashboardPreview } from './dashboard-preview';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, ArrowDown, ArrowUp, Check, CheckCheck, Users, Folder, X, Menu, Play, RotateCcw } from 'lucide-react';

type Panel = 'demo' | null;
const initialTasks = [
  { id: 1, title: 'Accessibility review', priority: 'High', date: 'Nov 14', status: 'To Do' },
  { id: 2, title: 'Prepare handoff', priority: 'Medium', date: 'Nov 16', status: 'To Do' },
  { id: 3, title: 'Review homepage wireframes', priority: 'High', date: 'Nov 10', status: 'In Progress' },
  { id: 4, title: 'Build responsive layouts', priority: 'High', date: 'Nov 13', status: 'In Progress' },
  { id: 5, title: 'Discovery workshop', priority: 'Medium', date: 'Nov 4', status: 'Done' },
  { id: 6, title: 'Sitemap approval', priority: 'Low', date: 'Nov 6', status: 'Done' },
];
function Mark() { return <span className="brand-mark" aria-hidden="true"><i/><i/><i/></span>; }
function Brand() { return <a className="brand" href="#" aria-label="ClientFlow home"><Mark/>clientflow<span className="brand-dot">®</span></a>; }

export default function Landing() {
  const [panel, setPanel] = useState<Panel>(null);
  const [menu, setMenu] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);
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
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header id="top" tabIndex={-1} className="site-header"><div className="header-inner"><Brand/><nav className="desktop-nav" aria-label="Main navigation"><a href="#features">Why ClientFlow</a><a href="#how-it-works">How it works</a><button onClick={() => open('demo')}>Take a tour <ArrowUpRight size={14}/></button></nav><div className="header-actions"><Link className="signin" href="/sign-in">Sign in</Link><Link className="button dark small" href="/sign-up">Get started <ArrowUpRight size={16}/></Link></div><button className="menu-toggle" aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button></div>{menu && <nav className="mobile-nav" aria-label="Mobile navigation"><a href="#features" onClick={() => setMenu(false)}>Why ClientFlow</a><a href="#how-it-works" onClick={() => setMenu(false)}>How it works</a><button onClick={() => open('demo')}>Explore demo</button><Link href="/sign-in">Sign in</Link><Link href="/sign-up">Get started</Link></nav>}</header>
    <main id="main">
      <section className="hero">
        <div className="hero-copy" data-reveal>
          <p className="eyebrow"><span/> PROJECT MANAGEMENT FOR FREELANCERS</p>
          <h1>From brief<br/>to <em className="draw-underline">delivered.</em></h1>
          <p className="hero-description">Keep client details, project deadlines, and the next task in one place.</p>
          <div className="hero-actions">
            <Link className="button teal" href="/sign-up">Get started <ArrowUpRight size={19}/></Link>
            <button className="demo-link" onClick={() => open('demo')}><span><Play size={12} fill="currentColor"/></span>Explore the demo</button>
          </div>
        </div>
        <figure className="hero-snapshots" aria-label="Client brief, project plan, and finished delivery for the Northstar website refresh">
          <div className="snapshot-glow" aria-hidden="true"/>
          <div className="hero-snapshot snapshot-brief">
            <div className="snapshot-kicker"><Users size={15}/> CLIENT BRIEF</div>
            <strong>Northstar Studio</strong>
            <p>A new home for their best work.</p>
          </div>
          <div className="hero-snapshot snapshot-plan">
            <div className="snapshot-kicker"><Folder size={15}/> PROJECT PLAN</div>
            <strong>Website refresh</strong>
            <div className="snapshot-task"><Check size={14}/> Approve sitemap</div>
            <div className="snapshot-task"><Check size={14}/> Review wireframes</div>
            <div className="snapshot-task"><Check size={14}/> Prepare handoff</div>
          </div>
          <div className="hero-snapshot snapshot-delivery">
            <span className="snapshot-check"><Check size={22}/></span>
            <div><strong>Delivered</strong><p>Website refresh · Northstar Studio</p></div>
          </div>
        </figure>
        <div className="hero-bottom" data-reveal><a href="#features"><ArrowDown size={16}/> See how it works</a></div>
      </section>
      <div className="manifesto-strip" data-reveal><span>FOR THE ONE-PERSON POWERHOUSE</span><p>Less keeping track. <span className="draw-underline">More moving forward.</span></p><span className="strip-symbol">✳</span></div>
      <section className="features-section section-wrap" id="features"><div className="section-heading" data-reveal><p className="eyebrow">YOUR WORK. A LITTLE LIGHTER.</p><h2>You do the brilliant part.<br/><span className="draw-underline">We’ll hold it together.</span></h2><p>Good work needs room to happen. Give every client,<br className="desktop-break"/> deadline, and little detail a home.</p></div><div className="feature-grid"><article data-reveal><span className="feature-number">01 / PEOPLE</span><div className="feature-art people-art"><span className="person-circle">MC</span><div><strong>Northstar Studio</strong><span>Maya Chen</span></div><span className="mini-tag">Client</span></div><h3>Clients, not loose ends.</h3><p>Keep contacts, notes, and their projects connected. Pick up every conversation with context.</p></article><article data-reveal><span className="feature-number">02 / PROJECTS</span><div className="feature-art projects-art"><span><Folder size={20}/> Website refresh</span><div><i/><i/><i/><i/><i/><i/></div><small>Every step has its place.</small></div><h3>See the bigger picture.</h3><p>From the first idea to the final handoff. Know what’s moving and what needs your attention.</p></article><article data-reveal><span className="feature-number">03 / MOMENTUM</span><div className="feature-art tasks-art"><span><CheckCheck size={20}/> Discovery workshop</span><span><span className="checkbox-outline"/> Build responsive layouts</span></div><h3>A next step, not a pile.</h3><p>Turn projects into manageable tasks. Set priorities, move work forward, and enjoy checking it off.</p></article></div></section>
      <section className="showcase-section section-wrap" id="how-it-works"><div className="showcase-copy" data-reveal><p className="eyebrow">FROM SCATTERED TO SORTED</p><h2>Everything in view.<br/><span className="draw-underline">Space to breathe.</span></h2><p>A simple rhythm for your working day.<br/>No complicated setup. No extra noise.</p><ol><li><span>01</span><div><strong>Make the connection</strong><p>Add a client and the details that matter.</p></div></li><li><span>02</span><div><strong>Give the work a home</strong><p>Create a project, set a deadline, find your direction.</p></div></li><li><span>03</span><div><strong>Keep your momentum</strong><p>Move client projects from first contact to delivery.</p></div></li></ol><button className="text-link" onClick={() => open('demo')}>Step inside the demo <ArrowRight size={18}/></button></div><div className="preview-reveal" data-reveal><DashboardPreview /></div></section>
      <section className="final-cta" data-reveal><div className="cta-decoration" aria-hidden="true">✳</div><p className="eyebrow">LESS ADMIN. MORE POSSIBILITY.</p><h2>Make room for<br/>your <em className="draw-underline">best work.</em></h2><Link className="button dark" href="/sign-up">Let’s find your flow <ArrowUpRight size={19}/></Link><p>Your next chapter looks a little clearer.</p></section>
    </main><footer className="site-footer" data-reveal><Brand/><span>Built for the way you work.</span><p>© {new Date().getFullYear()} ClientFlow</p></footer>
    {showBackToTop && (
      <a href="#top" className="back-to-top" aria-label="Back to top" title="Back to top">
        <ArrowUp size={22} aria-hidden="true" />
      </a>
    )}
    <dialog ref={dialog} className={`review-dialog ${panel==='demo' ? 'demo-dialog' : ''}`} onCancel={() => setPanel(null)} onClose={() => setPanel(null)} onClick={e=>{if(e.target===e.currentTarget)setPanel(null);}} aria-labelledby="dialog-title"><button className="close-dialog" autoFocus aria-label="Close" onClick={()=>setPanel(null)}><X size={21}/></button>{panel==='demo' ? <><p className="eyebrow">INTERACTIVE PREVIEW · FICTIONAL DATA</p><h2 id="dialog-title">Website refresh</h2><p className="dialog-description">Northstar Studio · Try moving a task. Changes last for this visit only.</p><div className="demo-summary"><span>{tasks.filter(t=>t.status==='Done').length} of 6 tasks complete</span><button className="text-link" onClick={()=>{setTasks(initialTasks);setAnnouncement('Demo tasks reset.');}}><RotateCcw size={14}/> Reset demo</button></div><div className="demo-board">{['To Do','In Progress','Done'].map(s=><section key={s}><h3>{s}<span>{tasks.filter(t=>t.status===s).length}</span></h3>{tasks.filter(t=>t.status===s).map(t=><article key={t.id}><span className="demo-priority">{t.priority} priority</span><h4>{t.title}</h4><p>{t.date}{t.id===3&&t.status!=='Done'?' · Overdue':''}</p><label>Move to<select value={t.status} onChange={e=>{const next=e.target.value;setTasks(ts=>ts.map(x=>x.id===t.id?{...x,status:next}:x));setAnnouncement(`${t.title} moved to ${next}.`);}}>{['To Do','In Progress','Done'].map(v=><option key={v}>{v}</option>)}</select></label></article>)}</section>)}</div></> : null}</dialog><div className="sr-only" aria-live="polite">{announcement}</div>
  </>;
}
