'use client';

import Link from 'next/link';
import { Calendar, User, Eye, ExternalLink } from 'lucide-react';
import { RepositoryFile } from '@/types/repositoryFile';
import { formatDate, formatFileSize, truncate } from '@/lib/utils';
import { FileIcon, FileTypeBadge } from './FileIcon';
import { Button } from '@/components/ui/Button';

interface FileCardProps {
  file: RepositoryFile;
}

export function FileCard({ file }: FileCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex items-start gap-3 mb-3">
          <FileIcon fileType={file.fileType} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                {file.title}
              </h3>
              <FileTypeBadge fileType={file.fileType} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{file.originalFileName}</p>
          </div>
        </div>

        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
          {truncate(file.description, 120)}
        </p>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium text-xs">
              {file.category}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{formatDate(file.uploadedAt)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{file.uploadedByName}</span>
          </div>
          {file.fileSize > 0 && (
            <p className="text-xs text-gray-400">{formatFileSize(file.fileSize)}</p>
          )}
        </div>
      </div>

      <div className="px-5 pb-4 pt-3 border-t border-gray-50 flex gap-2">
        <Link href={`/files/${file.id}`} className="flex-1">
          <Button variant="outline" size="sm" fullWidth icon={<Eye className="w-3.5 h-3.5" />}>
            View Details
          </Button>
        </Link>
        {file.spreadsheetLink ? (
          <a href={file.spreadsheetLink} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />}>
              Open
            </Button>
          </a>
        ) : (
          <a href={file.fileUrl} download={file.originalFileName}>
            <Button variant="primary" size="sm">
              Download
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
