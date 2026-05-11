'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Upload,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Files,
  Home,
  Shield,
} from 'lucide-react';
import { authService } from '@/lib/auth';
import { getInitials } from '@/lib/utils';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Staff Management',
    items: [
      { href: '/admin/staff', label: 'All Staff', icon: Users, exact: false },
      { href: '/admin/staff/create', label: 'Register Staff', icon: UserPlus, exact: true },
    ],
  },
  {
    label: 'File Management',
    items: [
      { href: '/admin/files', label: 'All Files', icon: FileText, exact: false },
      { href: '/admin/files/upload', label: 'Upload File', icon: Upload, exact: true },
    ],
  },
  {
    label: 'Portal',
    items: [
      { href: '/dashboard', label: 'Staff Dashboard', icon: Home, exact: false },
      { href: '/files', label: 'Browse Files', icon: Files, exact: false },
    ],
  },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = authService.getCurrentUser();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  if (!user) return null;

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen sticky top-0 bg-slate-900 text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-700/50">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2 min-w-0">
            <Image src="/iuc-logo.png" alt="IUC Drive" width={72} height={25} className="h-7 w-auto object-contain brightness-0 invert" priority />
            <span className="text-xs font-bold text-white whitespace-nowrap">IUC Drive</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/admin" className="mx-auto">
            <Image src="/iuc-logo.png" alt="IUC" width={28} height={28} className="h-7 w-auto object-contain brightness-0 invert" priority />
          </Link>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, exact }) => {
                const active = isActive(href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    title={collapsed ? label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/70'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>{label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-700/50 px-2 py-3">
        <div className={`flex items-center gap-3 px-3 py-2 mb-1 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {getInitials(user.fullName)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.fullName}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Admin
              </p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign out' : undefined}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-red-600/20 hover:text-red-400 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && 'Sign out'}
        </button>
      </div>
    </aside>
  );
}
