'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Download,
  ExternalLink,
  Lock,
  Globe,
  Building2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { FileIcon, FileTypeBadge } from '@/components/files/FileIcon';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { fileService } from '@/lib/fileService';
import { authService } from '@/lib/auth';
import { RepositoryFile } from '@/types/repositoryFile';
import { formatDateTime, formatFileSize } from '@/lib/utils';

export default function FileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [file, setFile] = useState<RepositoryFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    const found = fileService.getFileById(id);
    setFile(found);

    if (found) {
      const accessible = fileService
        .getAccessibleFiles()
        .some((f) => f.id === id);
      setHasAccess(accessible);
    }
    setLoading(false);
  }, [params.id]);

  if (loading) return <LoadingSpinner fullPage text="Loading file details..." />;

  const accessLevelConfig = {
    public: { label: 'Public', icon: Globe, color: 'text-green-600 bg-green-50' },
    department: { label: 'Department', icon: Building2, color: 'text-blue-600 bg-blue-50' },
    restricted: { label: 'Restricted', icon: Lock, color: 'text-orange-600 bg-orange-50' },
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          {!file ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-gray-900 mb-1">File Not Found</h2>
              <p className="text-sm text-gray-500 mb-4">
                This file does not exist or has been removed.
              </p>
              <Link href="/files">
                <Button variant="primary">Browse Files</Button>
              </Link>
            </div>
          ) : !hasAccess ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
              <Lock className="w-12 h-12 text-orange-400 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Access Restricted</h2>
              <p className="text-sm text-gray-500 mb-4">
                You do not have permission to view this file.
              </p>
              <Link href="/files">
                <Button variant="primary">Browse Files</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <FileIcon fileType={file.fileType} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h1 className="text-xl font-bold text-gray-900">{file.title}</h1>
                        <p className="text-sm text-gray-400 mt-0.5">{file.originalFileName}</p>
                      </div>
                      <FileTypeBadge fileType={file.fileType} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {file.spreadsheetLink ? (
                    <a href={file.spreadsheetLink} target="_blank" rel="noopener noreferrer">
                      <Button variant="primary" icon={<ExternalLink className="w-4 h-4" />} size="lg">
                        Open Spreadsheet
                      </Button>
                    </a>
                  ) : (
                    <a href={file.fileUrl} download={file.originalFileName}>
                      <Button variant="primary" icon={<Download className="w-4 h-4" />} size="lg">
                        Download File
                      </Button>
                    </a>
                  )}
                  <Link href="/files">
                    <Button variant="outline" size="lg">
                      Back to Files
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Description
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {file.description || 'No description provided.'}
                  </p>

                  {file.tags.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500">Tags</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {file.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                  <h2 className="text-sm font-semibold text-gray-900">File Details</h2>

                  <dl className="space-y-3">
                    <div>
                      <dt className="text-xs text-gray-500">Category</dt>
                      <dd className="mt-0.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                          {file.category}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Department</dt>
                      <dd className="text-sm text-gray-900 font-medium mt-0.5">{file.department}</dd>
                    </div>
                    {file.fileSize > 0 && (
                      <div>
                        <dt className="text-xs text-gray-500">File Size</dt>
                        <dd className="text-sm text-gray-900 font-medium mt-0.5">{formatFileSize(file.fileSize)}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Uploaded
                      </dt>
                      <dd className="text-sm text-gray-900 font-medium mt-0.5">
                        {formatDateTime(file.uploadedAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 flex items-center gap-1">
                        <User className="w-3 h-3" /> Uploaded by
                      </dt>
                      <dd className="text-sm text-gray-900 font-medium mt-0.5">{file.uploadedByName}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Access Level</dt>
                      <dd className="mt-0.5">
                        {(() => {
                          const cfg = accessLevelConfig[file.accessLevel];
                          const Icon = cfg.icon;
                          return (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                              <Icon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                          );
                        })()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
