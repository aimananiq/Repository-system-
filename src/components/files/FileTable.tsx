'use client';

import Link from 'next/link';
import { Eye, Download, ExternalLink } from 'lucide-react';
import { RepositoryFile } from '@/types/repositoryFile';
import { formatDate, formatFileSize } from '@/lib/utils';
import { FileIcon, FileTypeBadge } from './FileIcon';
import { Button } from '@/components/ui/Button';

interface FileTableProps {
  files: RepositoryFile[];
}

export function FileTable({ files }: FileTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              File
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
              Uploaded
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden xl:table-cell">
              Size
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {files.map((file) => (
            <tr key={file.id} className="hover:bg-gray-50/50 transition-colors group">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileIcon fileType={file.fileType} size="sm" />
                  <div className="min-w-0">
                    <Link
                      href={`/files/${file.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors block truncate max-w-[180px] sm:max-w-xs"
                    >
                      {file.title}
                    </Link>
                    <p className="text-xs text-gray-400 truncate max-w-[180px] sm:max-w-xs">
                      {file.originalFileName}
                    </p>
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
              <td className="px-4 py-3 hidden lg:table-cell">
                <div>
                  <p className="text-xs text-gray-700">{formatDate(file.uploadedAt)}</p>
                  <p className="text-xs text-gray-400">{file.uploadedByName}</p>
                </div>
              </td>
              <td className="px-4 py-3 hidden xl:table-cell text-xs text-gray-500">
                {file.fileSize > 0 ? formatFileSize(file.fileSize) : 'N/A'}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1.5">
                  <Link href={`/files/${file.id}`}>
                    <Button variant="ghost" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                      <span className="hidden sm:inline">View</span>
                    </Button>
                  </Link>
                  {file.spreadsheetLink ? (
                    <a href={file.spreadsheetLink} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                        <span className="hidden sm:inline">Open</span>
                      </Button>
                    </a>
                  ) : (
                    <a href={file.fileUrl} download={file.originalFileName}>
                      <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    </a>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
