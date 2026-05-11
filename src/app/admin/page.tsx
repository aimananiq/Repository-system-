'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  FileText,
  Upload,
  UserPlus,
  TrendingUp,
  Clock,
  Shield,
  Files,
} from 'lucide-react';
import { fileService } from '@/lib/fileService';
import { staffService } from '@/lib/staffService';
import { authService } from '@/lib/auth';
import { RepositoryFile } from '@/types/repositoryFile';
import { User } from '@/types/user';
import { formatDate } from '@/lib/utils';
import { FileTypeBadge } from '@/components/files/FileIcon';

interface Stats {
  totalFiles: number;
  totalStaff: number;
  activeStaff: number;
  recentFiles: RepositoryFile[];
  filesByType: Record<string, number>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    const files = fileService.getAllFiles();
    const users = staffService.getAllUsers();
    const staff = users.filter((u) => u.role === 'staff');

    const filesByType = files.reduce(
      (acc, f) => {
        const key = ['xls', 'xlsx'].includes(f.fileType) ? 'excel' : ['doc', 'docx'].includes(f.fileType) ? 'word' : f.fileType;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    setStats({
      totalFiles: files.length,
      totalStaff: staff.length,
      activeStaff: staff.filter((u) => u.isActive).length,
      recentFiles: [...files]
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
        .slice(0, 5),
      filesByType,
    });
  }, []);

  const statCards = [
    {
      label: 'Total Files',
      value: stats?.totalFiles ?? '-',
      icon: Files,
      color: 'bg-blue-500',
      href: '/admin/files',
    },
    {
      label: 'Total Staff',
      value: stats?.totalStaff ?? '-',
      icon: Users,
      color: 'bg-indigo-500',
      href: '/admin/staff',
    },
    {
      label: 'Active Staff',
      value: stats?.activeStaff ?? '-',
      icon: TrendingUp,
      color: 'bg-green-500',
      href: '/admin/staff',
    },
    {
      label: 'File Categories',
      value: stats ? Object.keys(stats.filesByType).length : '-',
      icon: FileText,
      color: 'bg-purple-500',
      href: '/admin/files',
    },
  ];

  const quickActions = [
    { href: '/admin/staff/create', label: 'Register Staff', icon: UserPlus, desc: 'Add a new staff account' },
    { href: '/admin/files/upload', label: 'Upload File', icon: Upload, desc: 'Upload a new document' },
    { href: '/admin/staff', label: 'Manage Staff', icon: Users, desc: 'View and edit staff accounts' },
    { href: '/admin/files', label: 'Manage Files', icon: FileText, desc: 'View and manage all files' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
        </div>
        <p className="text-gray-500 text-sm ml-11">
          Welcome back, {user?.fullName}. Here&apos;s an overview of the repository system.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:border-blue-200 transition-all"
          >
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map(({ href, label, icon: Icon, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
              >
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Recent Files
            </h2>
            <Link href="/admin/files" className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {stats?.recentFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <FileTypeBadge fileType={file.fileType} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.title}</p>
                  <p className="text-xs text-gray-400">{formatDate(file.uploadedAt)} · {file.uploadedByName}</p>
                </div>
              </div>
            ))}
            {!stats && (
              <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
