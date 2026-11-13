import { Suspense } from 'react';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="account-shell">
      <Suspense fallback={<p role="status">Loading account form…</p>}>
        {children}
      </Suspense>
    </main>
  );
}
