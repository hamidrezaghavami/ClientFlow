import { SignIn } from '@clerk/nextjs';
import { clerkConfigured } from '../../../../auth-config';
import { AuthUnavailable } from '../../../../components/auth-unavailable';

export default function SignInPage() {
  if (!clerkConfigured) return <AuthUnavailable />;

  return <SignIn appearance={{ options: { unsafe_disableDevelopmentModeWarnings: true } }} />;
}
