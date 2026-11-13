import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { clerkConfigured } from '../../auth-config';
import { WorkspaceOverview } from './workspace-overview';
import './workspace.css';
import { LanguageLinks } from '../../components/language-links';
import { languageHref, readLanguage, translate } from '../../components/landing-language';

export default async function DashboardPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const query = await searchParams;
  const language = readLanguage(query.lang);
  const t = translate(language);
  if (!clerkConfigured) redirect('/sign-in');
  const { userId } = await auth.protect();

  return (
    <div className="workspace">
      <a className="skip-link" href="#workspace-main">{t("Skip to dashboard")}</a>
      <header className="workspace-header">
        <div className="workspace-width workspace-header-inner">
          <Link href={languageHref("/", language)} className="brand" aria-label="ClientFlow home">
            <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
            clientflow
          </Link>
          <h1 lang={language} id="workspace-title" className="workspace-title">{t("Client engagements")}</h1>
          <div className="workspace-header-tools">
            <LanguageLinks language={language} path="/dashboard" query={query} />
            <div className="workspace-account">
              <span lang={language}>{t("My workspace")}</span>
              <UserButton appearance={{
                options: { unsafe_disableDevelopmentModeWarnings: true },
                elements: {
                  userButtonPopoverActionButton: {
                    color: '#26231f',
                    '&:is(:hover, :focus-visible, :active)': { backgroundColor: '#f4e9db', color: '#26231f' },
                  },
                  userButtonPopoverActionButtonText: { color: '#26231f !important' },
                  userButtonPopoverActionButtonIcon: { color: '#634b36 !important' },
                },
              }} />
            </div>
          </div>
        </div>
      </header>
      <WorkspaceOverview language={language} key={userId} storageKey={`clientflow:board:v1:${userId}`} />
    </div>
  );
}
