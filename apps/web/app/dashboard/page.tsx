import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { clerkConfigured } from '../../auth-config';

export default async function DashboardPage() {
  if (!clerkConfigured) redirect('/sign-in');
  await auth.protect();

  return (
    <main className="account-shell">
      <Link href="/" className="account-home">← ClientFlow</Link>
      <section className="account-summary">
        <UserButton />
        <h1>Welcome to ClientFlow</h1>
        <p>You’re signed in. Your client and project workspace is coming next.</p>
      </section>
    </main>
  );
}
