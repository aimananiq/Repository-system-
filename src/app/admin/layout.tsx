'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { AdminRoute } from '@/components/layout/AdminRoute';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { LayoutDashboard, Users, Upload, FileText, UserPlus, Files, Home, LogOut, Shield } from 'lucide-react';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { getInitials } from '@/lib/utils';

const mobileNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/staff', label: 'Staff', icon: Users },
  { href: '/admin/staff/create', label: 'Add Staff', icon: UserPlus },
  { href: '/admin/files', label: 'Files', icon: FileText },
  { href: '/admin/files/upload', label: 'Upload', icon: Upload },
  { href: '/dashboard', label: 'Portal', icon: Home },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="flex items-center justify-between px-4 h-14">
              <Link href="/admin" className="flex items-center gap-2">
                <Image src="/iuc-logo.png" alt="IUC Drive" width={72} height={25} className="h-7 w-auto object-contain" priority />
                <span className="text-sm font-bold text-purple-700">IUC Drive</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="border-t border-gray-100 bg-white px-4 py-3">
                <div className="flex items-center gap-3 px-2 py-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {user ? getInitials(user.fullName) : 'A'}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">{user?.fullName}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Admin
                    </p>
                  </div>
                </div>
                <div className="space-y-0.5">
                  {mobileNavItems.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        pathname === href || pathname.startsWith(href + '/')
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </header>

          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </AdminRoute>
  );
}
