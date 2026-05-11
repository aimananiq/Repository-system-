'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  X,
  CheckCircle,
  FileText,
  AlertCircle,
  Link2,
} from 'lucide-react';
import { fileService } from '@/lib/fileService';
import { authService } from '@/lib/auth';
import { CATEGORIES, FileType } from '@/types/repositoryFile';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FileIcon } from '@/components/files/FileIcon';
import { getFileTypeFromName, isAllowedFileType, isFileSizeValid, formatFileSize } from '@/lib/utils';

interface FormData {
  title: string;
  description: string;
  category: string;
  department: string;
  accessLevel: 'public' | 'department' | 'restricted';
  accessPermissions: string[];
  spreadsheetLink: string;
  tags: string;
  uploadType: 'file' | 'link';
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  department?: string;
  file?: string;
  spreadsheetLink?: string;
  permissions?: string;
}

const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv'];

export default function UploadFilePage() {
  const user = authService.getCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    department: '',
    accessLevel: 'department',
    accessPermissions: [],
    spreadsheetLink: '',
    tags: '',
    uploadType: 'file',
  });

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  const togglePerm = (cat: string) => {
    set('accessPermissions', form.accessPermissions.includes(cat)
      ? form.accessPermissions.filter(p => p !== cat)
      : [...form.accessPermissions, cat]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAllowedFileType(file.name)) {
      setErrors(er => ({ ...er, file: 'File type not allowed. Use PDF, Word, Excel, or CSV.' }));
      return;
    }
    if (!isFileSizeValid(file.size, 50)) {
      setErrors(er => ({ ...er, file: 'File exceeds 50MB limit.' }));
      return;
    }

    setSelectedFile(file);
    setErrors(er => ({ ...er, file: undefined }));

    if (!form.title) {
      const nameWithoutExt = file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
      set('title', nameWithoutExt);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(fakeEvent);
    }
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.title.trim()) errs.title = 'File title is required.';
    if (!form.category) errs.category = 'Category is required.';
    if (!form.department) errs.department = 'Department is required.';
    if (form.accessPermissions.length === 0) errs.permissions = 'Select at least one permission.';

    if (form.uploadType === 'file') {
      if (!selectedFile) errs.file = 'Please select a file to upload.';
    } else {
      if (!form.spreadsheetLink.trim()) errs.spreadsheetLink = 'Spreadsheet link is required.';
      else if (!form.spreadsheetLink.startsWith('http')) errs.spreadsheetLink = 'Please enter a valid URL.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const simulateUpload = () =>
    new Promise<void>(resolve => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25 + 10;
        setUploadProgress(Math.min(Math.round(progress), 95));
        if (progress >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(100);
            resolve();
          }, 400);
        }
      }, 250);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setUploading(true);
    setUploadProgress(0);
    await simulateUpload();

    const fileType = form.uploadType === 'link' ? 'sheet' : getFileTypeFromName(selectedFile!.name);
    const fileUrl = form.uploadType === 'link' ? form.spreadsheetLink : URL.createObjectURL(selectedFile!);

    const result = fileService.createFile({
      title: form.title.trim(),
      originalFileName: form.uploadType === 'link' ? 'spreadsheet.sheet' : selectedFile!.name,
      description: form.description.trim(),
      fileType: fileType as FileType,
      fileSize: selectedFile?.size || 0,
      category: form.category,
      department: form.department,
      accessLevel: form.accessLevel,
      accessPermissions: form.accessPermissions,
      uploadedBy: user?.id || '',
      uploadedByName: user?.fullName || '',
      fileUrl,
      spreadsheetLink: form.uploadType === 'link' ? form.spreadsheetLink : undefined,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    });

    setUploading(false);

    if (!result.success) {
      setServerError(result.error || 'Upload failed. Please try again.');
      setUploadProgress(0);
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
          <p className="text-sm text-gray-500 mb-6">
            <strong>{form.title}</strong> has been uploaded and is now available in the repository.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button onClick={() => { setSuccess(false); setSelectedFile(null); setUploadProgress(0); setForm({ title: '', description: '', category: '', department: '', accessLevel: 'department', accessPermissions: [], spreadsheetLink: '', tags: '', uploadType: 'file' }); }}>
              <Upload className="w-4 h-4 mr-1.5" />
              Upload Another
            </Button>
            <Link href="/admin/files">
              <Button variant="outline">Manage Files</Button>
            </Link>
            <Link href="/files">
              <Button variant="ghost">Browse Files</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <Link href="/admin/files" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Files
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Upload File</h1>
        <p className="text-gray-500 text-sm mt-1">Upload a document to the repository.</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {serverError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {serverError}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">Upload Type</h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => set('uploadType', 'file')}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-colors ${form.uploadType === 'file' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                <FileText className="w-4 h-4" />
                Upload File
              </button>
              <button
                type="button"
                onClick={() => set('uploadType', 'link')}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-colors ${form.uploadType === 'link' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                <Link2 className="w-4 h-4" />
                Spreadsheet Link
              </button>
            </div>

            {form.uploadType === 'file' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File <span className="text-red-500">*</span>
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${errors.file ? 'border-red-300 bg-red-50' : selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'}`}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileIcon fileType={getFileTypeFromName(selectedFile.name) as FileType} size="sm" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="ml-2 p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">Drag & drop or click to upload</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, Word, Excel, CSV — max 50MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {errors.file && <p className="text-xs text-red-600 mt-1">{errors.file}</p>}
              </div>
            ) : (
              <Input
                label="Spreadsheet Link"
                type="url"
                value={form.spreadsheetLink}
                onChange={e => set('spreadsheetLink', e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/..."
                error={errors.spreadsheetLink}
                required
                hint="Google Sheets or other spreadsheet link."
              />
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">File Information</h2>
            <Input
              label="File Title"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Employee Handbook 2024"
              error={errors.title}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={3}
                placeholder="Brief description of the file contents..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <Input
              label="Tags"
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="policy, HR, 2024 (comma separated)"
              hint="Keywords to help staff find this file."
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">Access Control</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Category"
                value={form.category}
                onChange={e => set('category', e.target.value)}
                options={CATEGORIES.map(c => ({ value: c, label: c }))}
                placeholder="Select category"
                error={errors.category}
                required
              />
              <Select
                label="Department"
                value={form.department}
                onChange={e => set('department', e.target.value)}
                options={CATEGORIES.map(c => ({ value: c, label: c }))}
                placeholder="Select department"
                error={errors.department}
                required
              />
              <Select
                label="Access Level"
                value={form.accessLevel}
                onChange={e => set('accessLevel', e.target.value as 'public' | 'department' | 'restricted')}
                options={[
                  { value: 'public', label: 'Public — All staff can access' },
                  { value: 'department', label: 'Department — Selected depts only' },
                  { value: 'restricted', label: 'Restricted — Limited access' },
                ]}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Department Permissions <span className="text-red-500">*</span>
              </p>
              <p className="text-xs text-gray-500 mb-3">Select which departments can see this file.</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => togglePerm(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.accessPermissions.includes(cat) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {errors.permissions && <p className="text-xs text-red-600 mt-1">{errors.permissions}</p>}
              <div className="flex gap-2 mt-3">
                <button type="button" onClick={() => set('accessPermissions', CATEGORIES)} className="text-xs text-blue-600 hover:underline">
                  Select all
                </button>
                <span className="text-gray-300">|</span>
                <button type="button" onClick={() => set('accessPermissions', [])} className="text-xs text-gray-500 hover:underline">
                  Clear all
                </button>
              </div>
            </div>
          </div>

          {uploading && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-700">Uploading...</p>
                <p className="text-sm font-bold text-blue-700">{uploadProgress}%</p>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" loading={uploading} icon={<Upload className="w-4 h-4" />}>
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
            <Link href="/admin/files">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
