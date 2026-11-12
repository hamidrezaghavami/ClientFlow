import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { clerkConfigured } from '../auth-config';
import '@fontsource/barlow-condensed/900.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClientFlow — Client projects and scope approvals',
  description: 'Manage freelance client projects, track deadlines, and get scope changes approved with a single link.',
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
            elements: { headerTitle: 'clientflow-account-title', footerActionLink: 'clientflow-auth-link', formFieldAction: 'clientflow-auth-link' },
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
