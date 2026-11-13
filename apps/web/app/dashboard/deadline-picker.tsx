'use client';

import { translate, type Language } from '../../components/landing-language';

import { useId, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

function dateValue(date: Date) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((part, index) =>
    String(part).padStart(index ? 2 : 4, '0')).join('-');
}

export function DeadlinePicker({ language = 'en', initialValue, name = 'deadline', label = 'Deadline' }: { language?: Language;
  initialValue: string;
  name?: string;
  label?: string;
}) {
  const t = translate(language);
  const locale = language === 'fa' ? 'fa-IR-u-ca-gregory' : language;
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
  const dayLabel = new Intl.DateTimeFormat(locale, { dateStyle: 'long' });
  const shortDate = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
  const weekdayLabel = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  const weekdays = Array.from({ length: 7 }, (_, index) => weekdayLabel.format(new Date(Date.UTC(2024, 0, index + 1))));

  const calendarId = useId();
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | null>(null);
  const today = new Date();
  const selected = value ? new Date(`${value}T12:00:00`) : null;

  function choose(date: string) {
    setValue(date);
    setOpen(false);
    document.getElementById(`${calendarId}-trigger`)?.focus();
  }

  function toggle() {
    if (!open) {
      const date = selected ?? today;
      setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
    setOpen(!open);
  }

  const year = month?.getFullYear() ?? 0;
  const monthIndex = month?.getMonth() ?? 0;
  const offset = month ? (month.getDay() + 6) % 7 : 0;
  const days = month ? new Date(year, monthIndex + 1, 0).getDate() : 0;

  return (
    <div className="deadline-picker" onKeyDown={event => {
      if (open && event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        document.getElementById(`${calendarId}-trigger`)?.focus();
      }
    }}>
      <input type="hidden" name={name} value={value} />
      <span className="deadline-label" id={`${calendarId}-label`}>{t(label)}</span>
      <button type="button" id={`${calendarId}-trigger`} className="deadline-trigger"
        aria-labelledby={`${calendarId}-label ${calendarId}-value`} aria-expanded={open}
        aria-controls={open ? calendarId : undefined} onClick={toggle}>
        <span id={`${calendarId}-value`}>{selected ? shortDate.format(selected) : t("Choose a date")}</span>
        <CalendarDays size={17} aria-hidden="true" />
      </button>
      {open && month && (
        <div className="deadline-calendar" id={calendarId} role="group" aria-label={`Choose ${label.toLowerCase()}`}>
          <div className="deadline-calendar-header">
            <button type="button" aria-label={t("Previous month")}  onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}><ChevronLeft size={18} /></button>
            <strong aria-live="polite">{monthLabel.format(month)}</strong>
            <button type="button" aria-label={t("Next month")}  onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}><ChevronRight size={18} /></button>
          </div>
          <div className="deadline-calendar-days">
            {weekdays.map(day => <span key={day} aria-hidden="true">{day}</span>)}
            {Array.from({ length: offset }, (_, i) => <span key={`space-${i}`} aria-hidden="true" />)}
            {Array.from({ length: days }, (_, i) => {
              const date = new Date(year, monthIndex, i + 1);
              const key = dateValue(date);
              return <button key={key} type="button" aria-label={dayLabel.format(date)} aria-pressed={key === value}
                aria-current={key === dateValue(today) ? 'date' : undefined} onClick={() => choose(key)}>{i + 1}</button>;
            })}
          </div>
          <div className="deadline-calendar-footer">
            <button type="button" onClick={() => choose('')}>{t("Clear")}</button>
            <button type="button" onClick={() => choose(dateValue(today))}>{t("Today")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
