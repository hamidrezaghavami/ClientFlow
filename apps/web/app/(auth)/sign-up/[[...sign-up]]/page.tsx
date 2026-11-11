import { SignUp } from '@clerk/nextjs';
import { clerkConfigured } from '../../../../auth-config';
import { AuthUnavailable } from '../../../../components/auth-unavailable';

export default function SignUpPage() {
  return clerkConfigured ? <SignUp /> : <AuthUnavailable />;
}
