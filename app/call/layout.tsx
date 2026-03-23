'use client';

import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/components/toast-provider';

export default function CallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
