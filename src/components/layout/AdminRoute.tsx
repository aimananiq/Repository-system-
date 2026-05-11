'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.replace('/login');
    } else if (!authService.isAdmin()) {
      router.replace('/unauthorized');
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return <LoadingSpinner fullPage text="Checking permissions..." />;
  }

  return <>{children}</>;
}
