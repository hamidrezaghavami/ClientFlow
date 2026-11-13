import { headers } from 'next/headers';
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { clerkConfigured } from '../../../../auth-config';
import { AuthUnavailable } from '../../../../components/auth-unavailable';
import { LanguageLinks } from '../../../../components/language-links';
import { languageHref, readLanguage, translate } from '../../../../components/landing-language';

export default async function SignInPage({ params, searchParams }: {
  params: Promise<{ 'sign-in'?: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const [segments, query] = await Promise.all([params, searchParams]);
  const language = readLanguage(query.lang ?? (await headers()).get('x-clientflow-language'));
  const t = translate(language);
  const path = ['sign-in', ...(segments['sign-in'] ?? []).map(encodeURIComponent)].join('/');

  return <>
    <Link href={languageHref('/', language)} className="account-home brand" aria-label={t('ClientFlow home')}>
      <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>clientflow
    </Link>
    <div className="account-language"><LanguageLinks language={language} path={`/${path}`} query={query} /></div>
    {clerkConfigured ? <SignIn
      signUpUrl={languageHref('/sign-up', language)}
      fallbackRedirectUrl={languageHref('/dashboard', language)}
      appearance={{ options: { unsafe_disableDevelopmentModeWarnings: true } }} /> : <AuthUnavailable />}
  </>;
}
