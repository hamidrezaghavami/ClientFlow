import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { clerkConfigured } from '../auth-config';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClientFlow — Make room for your best work',
  description: 'A calmer home for your clients, projects, and tasks.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {clerkConfigured ? <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
          afterSignOutUrl="/"
          appearance={{
            variables: {
              colorPrimary: '#fa6519',
              colorPrimaryForeground: '#28180f',
              colorBackground: '#fffdf9',
              colorForeground: '#26231f',
              colorMutedForeground: '#5e564d',
              colorInput: '#fffaf3',
              colorInputForeground: '#26231f',
              colorBorder: '#ded6ca',
              borderRadius: '.85rem',
              colorRing: '#ae3b00',
            },
          }}
        >
          {children}
        </ClerkProvider> : children}
      </body>
    </html>
  );
}
