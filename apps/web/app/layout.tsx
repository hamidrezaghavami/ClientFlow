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
              colorPrimary: '#ca9ff9',
              colorPrimaryForeground: '#181122',
              colorBackground: '#201729',
              colorForeground: '#f1edf7',
              colorMutedForeground: '#c3b4d0',
              colorInput: '#17111f',
              colorInputForeground: '#f1edf7',
              colorBorder: '#524064',
              borderRadius: '.65rem',
            },
          }}
        >
          {children}
        </ClerkProvider> : children}
      </body>
    </html>
  );
}
