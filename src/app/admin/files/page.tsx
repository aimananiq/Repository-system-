'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Upload,
  Search,
  Pencil,
  Trash2,
  CheckCircle,
  ExternalLink,
  Download,
  Eye,
} from 'lucide-react';
import { fileService } from '@/lib/fileService';
import { RepositoryFile, FileType, CATEGORIES } from '@/types/repositoryFile';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FileIcon, FileTypeBadge } from '@/components/files/FileIcon';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate, formatFileSize } from '@/lib/utils';

const PAGE_SIZE = 15;

export default function AdminFilesPage() {
  const [files, setFiles] = useState<RepositoryFile[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(1);
  const [editFile, setEditFile] = useState<RepositoryFile | null>(null);
  const [deleteFile, setDeleteFile] = useState<RepositoryFile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadFiles = () => {
    const result = fileService.getAdminFiles({
      search,
      fileType: filterType as FileType | undefined,
      category: filterCategory,
    });
    setFiles(result);
    setPage(1);
  };

  useEffect(() => { loadFiles(); }, [search, filterType, filterCategory]);

  const handleDelete = async () => {
    if (!deleteFile) return;
    setActionLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const result = fileService.deleteFile(deleteFile.id);
    setActionLoading(false);
    if (result.success) {
      setMessage({ type: 'success', text: `"${deleteFile.title}" has been deleted.` });
      loadFiles();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to delete file.' });
    }
    setDeleteFile(null);
    setTimeout(() => setMessage(null), 3000);
  };

  const totalPages = Math.ceil(files.length / PAGE_SIZE);
  const paginatedFiles = files.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">File Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all repository files and metadata.</p>
        </div>
        <Link href="/admin/files/upload">
          <Button icon={<Upload className="w-4 h-4" />}>Upload File</Button>
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
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Types</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word</option>
            <option value="xlsx">Excel</option>
            <option value="csv">CSV</option>
            <option value="sheet">Spreadsheet</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">{files.length}</span> {files.length === 1 ? 'file' : 'files'} found
          </p>
        </div>

        {paginatedFiles.length === 0 ? (
          <EmptyState
            title="No files found"
            description="No files match your search criteria."
            action={{ label: 'Upload File', onClick: () => window.location.href = '/admin/files/upload' }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">File</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden xl:table-cell">Uploaded</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileIcon fileType={file.fileType} size="sm" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">{file.title}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">{file.originalFileName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <FileTypeBadge fileType={file.fileType} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                        {file.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">
                      {file.fileSize > 0 ? formatFileSize(file.fileSize) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <p className="text-xs text-gray-700">{formatDate(file.uploadedAt)}</p>
                      <p className="text-xs text-gray-400">{file.uploadedByName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/files/${file.id}`}>
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                        <button
                          onClick={() => setEditFile(file)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {file.spreadsheetLink ? (
                          <a href={file.spreadsheetLink} target="_blank" rel="noopener noreferrer">
                            <button className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Open sheet">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </a>
                        ) : (
                          <a href={file.fileUrl} download={file.originalFileName}>
                            <button className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Download">
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </a>
                        )}
                        <button
                          onClick={() => setDeleteFile(file)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {files.length > 0 && (
          <div className="px-4 pb-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={files.length}
              itemsPerPage={PAGE_SIZE}
            />
          </div>
        )}
      </div>

      {editFile && (
        <EditFileModal
          file={editFile}
          onClose={() => setEditFile(null)}
          onSaved={() => {
            loadFiles();
            setEditFile(null);
            setMessage({ type: 'success', text: 'File updated successfully.' });
            setTimeout(() => setMessage(null), 3000);
          }}
        />
      )}

      <Modal isOpen={!!deleteFile} onClose={() => setDeleteFile(null)} title="Delete File" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <strong>{deleteFile?.title}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteFile(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={actionLoading}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function EditFileModal({ file, onClose, onSaved }: { file: RepositoryFile; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: file.title,
    description: file.description,
    category: file.category,
    department: file.department,
    accessLevel: file.accessLevel,
    accessPermissions: file.accessPermissions,
    spreadsheetLink: file.spreadsheetLink || '',
    tags: file.tags.join(', '),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const togglePerm = (cat: string) => {
    setForm(f => ({
      ...f,
      accessPermissions: f.accessPermissions.includes(cat)
        ? f.accessPermissions.filter(p => p !== cat)
        : [...f.accessPermissions, cat],
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = fileService.updateFile(file.id, {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      spreadsheetLink: form.spreadsheetLink || undefined,
    });
    setLoading(false);
    if (!result.success) { setError(result.error || 'Failed to update.'); return; }
    onSaved();
  };

  return (
    <Modal isOpen onClose={onClose} title="Edit File Metadata" size="lg">
      <div className="space-y-4">
        {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">{error}</div>}
        <Input label="File Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} options={CATEGORIES.map(c => ({ value: c, label: c }))} required />
          <Select label="Department" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} options={CATEGORIES.map(c => ({ value: c, label: c }))} required />
          <Select
            label="Access Level"
            value={form.accessLevel}
            onChange={e => setForm(f => ({ ...f, accessLevel: e.target.value as 'public' | 'department' | 'restricted' }))}
            options={[
              { value: 'public', label: 'Public (All staff)' },
              { value: 'department', label: 'Department' },
              { value: 'restricted', label: 'Restricted' },
            ]}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Access Permissions</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} type="button" onClick={() => togglePerm(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${form.accessPermissions.includes(cat) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <Input label="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="policy, HR, 2024" />
        <Input label="Spreadsheet Link (optional)" type="url" value={form.spreadsheetLink} onChange={e => setForm(f => ({ ...f, spreadsheetLink: e.target.value }))} placeholder="https://docs.google.com/..." />
        <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={loading}>Save Changes</Button>
        </div>
      </div>
    </Modal>
  );
}
