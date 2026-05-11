'use client';

import { FileText, FileSpreadsheet, Table2, FileType, File } from 'lucide-react';
import { FileType as FT } from '@/types/repositoryFile';

interface FileIconProps {
  fileType: FT;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { wrapper: 'w-8 h-8', icon: 'w-4 h-4' },
  md: { wrapper: 'w-10 h-10', icon: 'w-5 h-5' },
  lg: { wrapper: 'w-14 h-14', icon: 'w-7 h-7' },
};

export function FileIcon({ fileType, size = 'md' }: FileIconProps) {
  const { wrapper, icon } = sizeMap[size];

  const config: Record<FT, { bg: string; text: string; Icon: React.ElementType; label: string }> = {
    pdf: { bg: 'bg-red-50', text: 'text-red-600', Icon: FileText, label: 'PDF' },
    doc: { bg: 'bg-blue-50', text: 'text-blue-600', Icon: FileText, label: 'DOC' },
    docx: { bg: 'bg-blue-50', text: 'text-blue-600', Icon: FileText, label: 'DOCX' },
    xls: { bg: 'bg-green-50', text: 'text-green-600', Icon: FileSpreadsheet, label: 'XLS' },
    xlsx: { bg: 'bg-green-50', text: 'text-green-600', Icon: FileSpreadsheet, label: 'XLSX' },
    csv: { bg: 'bg-orange-50', text: 'text-orange-600', Icon: Table2, label: 'CSV' },
    sheet: { bg: 'bg-purple-50', text: 'text-purple-600', Icon: FileSpreadsheet, label: 'SHEET' },
  };

  const { bg, text, Icon } = config[fileType] || { bg: 'bg-gray-50', text: 'text-gray-500', Icon: File, label: 'FILE' };

  return (
    <div className={`${wrapper} ${bg} ${text} rounded-xl flex items-center justify-center shrink-0`}>
      <Icon className={icon} />
    </div>
  );
}

export function FileTypeBadge({ fileType }: { fileType: FT }) {
  const labels: Record<FT, string> = {
    pdf: 'PDF',
    doc: 'DOC',
    docx: 'DOCX',
    xls: 'XLS',
    xlsx: 'XLSX',
    csv: 'CSV',
    sheet: 'SHEET',
  };

  const colors: Record<FT, string> = {
    pdf: 'bg-red-100 text-red-700',
    doc: 'bg-blue-100 text-blue-700',
    docx: 'bg-blue-100 text-blue-700',
    xls: 'bg-green-100 text-green-700',
    xlsx: 'bg-green-100 text-green-700',
    csv: 'bg-orange-100 text-orange-700',
    sheet: 'bg-purple-100 text-purple-700',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold uppercase ${colors[fileType]}`}>
      {labels[fileType] || fileType.toUpperCase()}
    </span>
  );
}
