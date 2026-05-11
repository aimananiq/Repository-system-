'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.replace(authService.isAdmin() ? '/admin' : '/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return <LoadingSpinner fullPage text="Redirecting..." />;
}
