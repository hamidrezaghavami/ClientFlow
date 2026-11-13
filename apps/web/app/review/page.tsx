import { headers } from 'next/headers';
import { readLanguage } from '../../components/landing-language';
import type { Metadata } from 'next';
import { ReviewClient } from './review-client';
import '../dashboard/workspace.css';

export const metadata: Metadata = {
  title: 'Review a scope change | ClientFlow',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default async function ReviewPage() {
  return <ReviewClient language={readLanguage((await headers()).get('x-clientflow-language'))} />;
}
