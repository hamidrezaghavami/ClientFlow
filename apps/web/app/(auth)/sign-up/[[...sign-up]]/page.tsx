import { SignUp } from '@clerk/nextjs';
import { clerkConfigured } from '../../../../auth-config';
import { AuthUnavailable } from '../../../../components/auth-unavailable';

export default function SignUpPage() {
  if (!clerkConfigured) return <AuthUnavailable />;

  return <SignUp appearance={{ options: { unsafe_disableDevelopmentModeWarnings: true } }} />;
}
