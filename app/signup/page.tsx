import { SignUpPage } from '@/components/signup-page';
import { ToastProvider } from '@/components/toast-provider';

export default function SignUpRoute() {
  return (
    <ToastProvider>
      <SignUpPage />
    </ToastProvider>
  );
}
