import Link from 'next/link';
import { Suspense } from 'react';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="account-shell">
      <Link href="/" className="account-home brand" aria-label="Back to ClientFlow home">
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>clientflow
      </Link>
      <Suspense fallback={<p role="status">Loading account form…</p>}>
        {children}
      </Suspense>
    </main>
  );
}
