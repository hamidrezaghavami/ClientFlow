import { SignIn } from '@clerk/nextjs';
import { clerkConfigured } from '../../../../auth-config';
import { AuthUnavailable } from '../../../../components/auth-unavailable';

export default function SignInPage() {
  return clerkConfigured ? <SignIn /> : <AuthUnavailable />;
}
