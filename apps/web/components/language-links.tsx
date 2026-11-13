import { languageHref, type Language } from './landing-language';

export function LanguageLinks({ language, path = "/", query }: { language: Language; path?: string; query?: Record<string, string | string[]> }) {
  return <div className="landing-languages" dir="ltr">
    {(['en', 'tr', 'fa'] as const).map(code => (
      <a key={code} href={languageHref(path, code, query)} hrefLang={code} lang={code}
        aria-label={{ en: 'English', tr: 'Türkçe', fa: 'فارسی' }[code]}
        aria-current={code === language ? 'page' : undefined}>{code.toUpperCase()}</a>
    ))}
  </div>;
}

