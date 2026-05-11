'use client';

import Link from 'next/link';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { authService } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export default function UnauthorizedPage() {
  const user = authService.getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
          <ShieldOff className="w-10 h-10 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-8">
          You don&apos;t have permission to access this page. If you believe this is an error, please
          contact your administrator.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href={user?.role === 'admin' ? '/admin' : '/dashboard'}>
            <Button variant="primary" icon={<ArrowLeft className="w-4 h-4" />}>
              Go to Dashboard
            </Button>
          </Link>
          {!user && (
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
