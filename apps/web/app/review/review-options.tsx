'use client';

import { translate, type Language } from '../../components/landing-language';

import { ArrowLeftRight, Plus } from 'lucide-react';

export type ReviewChoice = 'swap' | 'add';
export type ReviewTerms = {
  requested: string;
  replaced: string;
  originalDeadline: string;
  extraCents: number;
  newDeadline: string;
};

export const dollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const formatDate = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' });
export function dateLabel(value: string) {
  return value ? formatDate.format(new Date(`${value}T00:00:00Z`)) : 'No deadline';
}

export function ReviewOptions({ language = 'en', terms, selected, onSelect, disabled }: { language?: Language;
  terms: ReviewTerms;
  selected: ReviewChoice | null;
  onSelect: (choice: ReviewChoice) => void;
  disabled?: boolean;
}) {
  const t = translate(language);
  return <fieldset className="scope-options" disabled={disabled}>
    <legend>{t("Review the two options")}</legend>
    <label>
      <input type="radio" name="scope-choice" checked={selected === 'swap'} onChange={() => onSelect('swap')} />
      <ArrowLeftRight size={18} aria-hidden="true" />
      <strong>{t("Swap it in")}</strong>
      <span>{t("Replaces")} {terms.replaced}</span>
      <span>No extra charge · {(terms.originalDeadline ? dateLabel(terms.originalDeadline) : t("No deadline"))}</span>
    </label>
    <label>
      <input type="radio" name="scope-choice" checked={selected === 'add'} onChange={() => onSelect('add')} />
      <Plus size={18} aria-hidden="true" />
      <strong>{t("Add to scope")}</strong>
      <span>{t("Keeps")} {terms.replaced}</span>
      <span>+{dollars.format(terms.extraCents / 100)} · {dateLabel(terms.newDeadline)}</span>
    </label>
  </fieldset>;
}
