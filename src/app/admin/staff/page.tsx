'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Pencil,
  Trash2,
  Shield,
  User,
} from 'lucide-react';
import { staffService } from '@/lib/staffService';
import { authService } from '@/lib/auth';
import { User as UserType } from '@/types/user';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CATEGORIES } from '@/types/repositoryFile';
import { formatDate, getInitials } from '@/lib/utils';

export default function AdminStaffPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<UserType | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const currentUser = authService.getCurrentUser();

  const loadUsers = () => {
    setUsers(staffService.getAllUsers().filter((u) => u.id !== currentUser?.id));
  };

  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.department.toLowerCase().includes(q);
    const matchRole = !filterRole || u.role === filterRole;
    const matchStatus = !filterStatus || (filterStatus === 'active' ? u.isActive : !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  const handleToggleStatus = async (user: UserType) => {
    setActionLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const result = staffService.toggleUserStatus(user.id);
    setActionLoading(false);
    if (result.success) {
      setMessage({ type: 'success', text: `${user.fullName} has been ${user.isActive ? 'deactivated' : 'activated'}.` });
      loadUsers();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update status.' });
    }
    setOpenMenuId(null);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setActionLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const result = staffService.deleteUser(deleteUser.id);
    setActionLoading(false);
    if (result.success) {
      setMessage({ type: 'success', text: `${deleteUser.fullName} has been removed.` });
      loadUsers();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to delete user.' });
    }
    setDeleteUser(null);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage staff accounts and permissions.</p>
        </div>
        <Link href="/admin/staff/create">
          <Button icon={<UserPlus className="w-4 h-4" />}>Register Staff</Button>
        </Link>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No staff found"
            description={search ? 'No staff match your search.' : 'No staff accounts yet.'}
            icon={<User className="w-8 h-8" />}
            action={{ label: 'Register Staff', onClick: () => window.location.href = '/admin/staff/create' }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {getInitials(u.fullName)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.fullName}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">{u.department}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {u.role === 'admin' && <Shield className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditUser(u)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          aria-label="Edit user"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                          aria-label={u.isActive ? 'Deactivate' : 'Activate'}
                          title={u.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {u.isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => setDeleteUser(u)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={() => { loadUsers(); setEditUser(null); setMessage({ type: 'success', text: 'User updated successfully.' }); setTimeout(() => setMessage(null), 3000); }}
        />
      )}

      <Modal isOpen={!!deleteUser} onClose={() => setDeleteUser(null)} title="Delete Staff Account" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <strong>{deleteUser?.fullName}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteUser(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={actionLoading}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function EditUserModal({ user, onClose, onSaved }: { user: UserType; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    fullName: user.fullName,
    email: user.email,
    username: user.username,
    department: user.department,
    permissions: user.permissions,
    isActive: user.isActive,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePermToggle = (cat: string) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(cat)
        ? f.permissions.filter((p) => p !== cat)
        : [...f.permissions, cat],
    }));
  };

  const handleSave = async () => {
    if (!form.fullName || !form.email || !form.username) {
      setError('Name, email, and username are required.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = staffService.updateUser(user.id, form);
    setLoading(false);
    if (!result.success) { setError(result.error || 'Failed to update.'); return; }
    onSaved();
  };

  return (
    <Modal isOpen onClose={onClose} title="Edit Staff Account" size="lg">
      <div className="space-y-4">
        {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={form.fullName} onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input label="Username" value={form.username} onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))} required />
          <Select label="Department" value={form.department} onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))} options={CATEGORIES.map(c => ({ value: c, label: c }))} required />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Access Permissions</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handlePermToggle(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.permissions.includes(cat) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <label htmlFor="isActive" className="text-sm text-gray-700">Account is active</label>
        </div>
        <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={loading}>Save Changes</Button>
        </div>
      </div>
    </Modal>
  );
}
