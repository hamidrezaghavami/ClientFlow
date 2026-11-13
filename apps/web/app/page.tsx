import { readLanguage } from '../components/landing-language';
import { headers } from 'next/headers';
import Landing from '../components/landing';

const restoreHeroOnReload = `
(() => {
  if (performance.getEntriesByType('navigation')[0]?.type !== 'reload') return;

  const previousRestoration = history.scrollRestoration;
  history.scrollRestoration = 'manual';
  if (location.hash) {
    history.replaceState(history.state, '', location.pathname + location.search);
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
  window.addEventListener('pageshow', () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    history.scrollRestoration = previousRestoration;
  }, { once: true });
})();
`;

export default async function Page({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }) {
  const { lang } = await searchParams;
  const language = readLanguage(lang ?? (await headers()).get('x-clientflow-language'));
  return <>
    {/* Run before the landing markup so the browser cannot jump to an old section on reload. */}
    <script dangerouslySetInnerHTML={{ __html: restoreHeroOnReload }} />
    <Landing language={language} />
  </>;
}
