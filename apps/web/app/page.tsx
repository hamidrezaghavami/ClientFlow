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

export default function Page() {
  return <>
    {/* Run before the landing markup so the browser cannot jump to an old section on reload. */}
    <script dangerouslySetInnerHTML={{ __html: restoreHeroOnReload }} />
    <Landing />
  </>;
}
