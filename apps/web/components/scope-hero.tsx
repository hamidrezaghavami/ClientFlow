import Link from 'next/link';
import { useState } from 'react';
import { ArrowDown, ArrowLeftRight, ArrowUpRight, CalendarDays, Check, FileCheck2, Link2, MessageSquare, MousePointer2, Pause, Play, Plus, Send } from 'lucide-react';

export function ScopeHero({ onTour }: { onTour: () => void }) {
  const [paused, setPaused] = useState(false);

  return (
    <section className="scope-hero" aria-labelledby="landing-title">
      <div className="scope-hero-stage" data-motion-paused={paused}>
        <h1 id="landing-title">
          <span>Client work</span>
          <span>from brief</span>
          <em>to delivered.</em>
        </h1>

        <div className="scope-hero-stack" aria-hidden="true">
          <div className="scope-hero-tile scope-hero-brief">
            <span><MessageSquare /> Client request</span>
            <strong>Add a pricing page?</strong>
            <small>Northstar Studio</small>
          </div>
          <div className="scope-hero-tile scope-hero-swap">
            <span><ArrowLeftRight /> Option 1</span>
            <strong>Swap it in</strong>
            <small>Same price and deadline</small>
          </div>
          <div className="scope-hero-tile scope-hero-addon">
            <span><Plus /> Option 2</span>
            <strong>Add to scope</strong>
            <small>+$350 · +2 days</small>
          </div>
          <span className="scope-hero-tray"><Link2 /> One review link</span>
          <span className="scope-hero-sticker scope-hero-pointer"><MousePointer2 /></span>
          <span className="scope-hero-sticker scope-hero-send"><Send /></span>
        </div>

        <div className="scope-hero-outcome" aria-hidden="true">
          <div className="scope-hero-tile scope-hero-calendar"><CalendarDays /><span>Deadline updated</span></div>
          <div className="scope-hero-tile scope-hero-approved"><Check /><span>Client approved</span></div>
          <span className="scope-hero-sticker scope-hero-file"><FileCheck2 /></span>
        </div>
      </div>

      <p>Keep projects moving. Give clients clear options when the scope changes, and keep every decision with the project.</p>
      <div className="scope-hero-actions">
        <Link className="scope-hero-cta" href="/sign-up">Get started <ArrowUpRight aria-hidden="true" size={21} /></Link>
        <button className="scope-hero-tour" onClick={onTour}>Take a tour <ArrowUpRight aria-hidden="true" size={14} /></button>
      </div>
      <div className="scope-hero-controls">
        <a className="scope-hero-down" href="#features" aria-label="See how ClientFlow works"><ArrowDown size={18} aria-hidden="true" /></a>
        <button type="button" className="scope-hero-motion" onClick={() => setPaused(value => !value)}
          aria-label={paused ? 'Play hero motion' : 'Pause hero motion'} title={paused ? 'Play motion' : 'Pause motion'}>
          {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}
