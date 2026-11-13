import type { Translate } from './landing-language';
import Link from 'next/link';
import { ArrowDown, ArrowLeftRight, ArrowUpRight, CalendarDays, Check, FileCheck2, Link2, MessageSquare, MousePointer2, Plus, Send } from 'lucide-react';

export function ScopeHero({ onTour, t, signUpHref }: { onTour: () => void; t: Translate; signUpHref: string }) {
  return (
    <section className="scope-hero" aria-labelledby="landing-title">
      <div className="scope-hero-stage">
        <h1 id="landing-title">
          <span>{t("Client work")} </span>
          <span>{t("from brief")} </span>
          <em>{t("to delivered.")} </em>
        </h1>

        <div className="scope-hero-stack" aria-hidden="true">
          <div className="scope-hero-tile scope-hero-brief">
            <span><MessageSquare /> {t("Client request")} </span>
            <strong>{t("Add a pricing page?")} </strong>
            <small>Northstar Studio</small>
          </div>
          <div className="scope-hero-tile scope-hero-swap">
            <span><ArrowLeftRight /> {t("Option 1")} </span>
            <strong>{t("Swap it in")} </strong>
            <small>{t("Same price and deadline")} </small>
          </div>
          <div className="scope-hero-tile scope-hero-addon">
            <span><Plus /> {t("Option 2")} </span>
            <strong>{t("Add to scope")} </strong>
            <small>{t("+$350 · +2 days")} </small>
          </div>
          <span className="scope-hero-tray"><Link2 /> {t("One review link")} </span>
          <span className="scope-hero-sticker scope-hero-pointer"><MousePointer2 /></span>
          <span className="scope-hero-sticker scope-hero-send"><Send /></span>
        </div>

        <div className="scope-hero-outcome" aria-hidden="true">
          <div className="scope-hero-tile scope-hero-calendar"><CalendarDays /><span>{t("Deadline updated")} </span></div>
          <div className="scope-hero-tile scope-hero-approved"><Check /><span>{t("Client approved")} </span></div>
          <span className="scope-hero-sticker scope-hero-file"><FileCheck2 /></span>
        </div>
      </div>

      <p>{t("Keep projects moving. Give clients clear options when the scope changes, and keep every decision with the project.")} </p>
      <div className="scope-hero-actions">
        <Link className="scope-hero-cta" href={signUpHref}>{t("Get started")} <ArrowUpRight aria-hidden="true" size={21} /></Link>
        <button className="scope-hero-tour" onClick={onTour}>{t("Take a tour")} <ArrowUpRight aria-hidden="true" size={14} /></button>
      </div>
      <a className="scope-hero-down" href="#features" aria-label={t("See how ClientFlow works")}><ArrowDown size={18} aria-hidden="true" /></a>
    </section>
  );
}
