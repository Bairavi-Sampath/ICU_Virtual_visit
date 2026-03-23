'use client';

import { AuthProvider, useAuth } from '@/lib/auth-context';
import { ToastProvider } from '@/components/toast-provider';
import { LoginPage } from '@/components/login-page';
import { NurseDashboard } from '@/components/nurse-dashboard';
import { FamilyDashboard } from '@/components/family-dashboard';

function AppContent() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (user?.role === 'family') {
    return <FamilyDashboard />;
  }

  return <NurseDashboard />;
}

export default function Home() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
