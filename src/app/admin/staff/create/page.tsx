'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { staffService } from '@/lib/staffService';
import { authService } from '@/lib/auth';
import { CATEGORIES } from '@/types/repositoryFile';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface FormData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'staff';
  department: string;
  permissions: string[];
  isActive: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  department?: string;
  permissions?: string;
}

const initialForm: FormData = {
  fullName: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  role: 'staff',
  department: '',
  permissions: [],
  isActive: true,
};

export default function CreateStaffPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const togglePermission = (cat: string) => {
    set(
      'permissions',
      form.permissions.includes(cat)
        ? form.permissions.filter((p) => p !== cat)
        : [...form.permissions, cat]
    );
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.';
    if (!form.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!form.username.trim()) {
      errs.username = 'Username is required.';
    } else if (form.username.trim().length < 3) {
      errs.username = 'Username must be at least 3 characters.';
    }
    if (!form.password) {
      errs.password = 'Password is required.';
    } else if (form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    }
    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    if (!form.department) errs.department = 'Department is required.';
    if (form.permissions.length === 0) errs.permissions = 'Select at least one access permission.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const result = staffService.createUser({
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      username: form.username.trim().toLowerCase(),
      password: form.password,
      role: form.role,
      department: form.department,
      permissions: form.permissions,
      isActive: form.isActive,
    });

    setLoading(false);

    if (!result.success) {
      setServerError(result.error || 'Failed to create account.');
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="p-6 lg:p-8 max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-sm text-gray-500 mb-6">
            <strong>{form.fullName}</strong>&apos;s account has been successfully created.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => { setForm(initialForm); setSuccess(false); }}>
              <UserPlus className="w-4 h-4 mr-1.5" />
              Create Another
            </Button>
            <Link href="/admin/staff">
              <Button variant="outline">View All Staff</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <Link href="/admin/staff" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Staff
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Register Staff</h1>
        <p className="text-gray-500 text-sm mt-1">Create a new staff account with access permissions.</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {serverError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
              {serverError}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                placeholder="John Smith"
                error={errors.fullName}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="john.smith@company.com"
                error={errors.email}
                required
              />
              <Input
                label="Username"
                value={form.username}
                onChange={(e) => set('username', e.target.value)}
                placeholder="john.smith"
                error={errors.username}
                required
                hint="Minimum 3 characters. Used for login."
              />
              <Select
                label="Role"
                value={form.role}
                onChange={(e) => set('role', e.target.value as 'admin' | 'staff')}
                options={[
                  { value: 'staff', label: 'Staff' },
                  { value: 'admin', label: 'Admin' },
                ]}
                required
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">
              Security
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="Min. 8 characters"
                  error={errors.password}
                  required
                  hint="At least 8 characters."
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                  placeholder="Repeat password"
                  error={errors.confirmPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">
              Department & Access
            </h2>
            <Select
              label="Department"
              value={form.department}
              onChange={(e) => set('department', e.target.value)}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              placeholder="Select department"
              error={errors.department}
              required
            />
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Access Permissions <span className="text-red-500">*</span>
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Select which department folders this staff can access.
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => togglePermission(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      form.permissions.includes(cat)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {errors.permissions && (
                <p className="text-xs text-red-600 mt-1">{errors.permissions}</p>
              )}
              {form.permissions.length > 0 && (
                <p className="text-xs text-blue-600 mt-2">
                  {form.permissions.length} permission{form.permissions.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Account is active (staff can log in immediately)
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" loading={loading} icon={<UserPlus className="w-4 h-4" />}>
              Create Account
            </Button>
            <Link href="/admin/staff">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
