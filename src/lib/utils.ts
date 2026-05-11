import { FileType } from '@/types/repositoryFile';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return 'N/A';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getFileTypeFromName(filename: string): FileType {
  const ext = filename.split('.').pop()?.toLowerCase();
  const typeMap: Record<string, FileType> = {
    pdf: 'pdf',
    doc: 'doc',
    docx: 'docx',
    xls: 'xls',
    xlsx: 'xlsx',
    csv: 'csv',
    sheet: 'sheet',
  };
  return typeMap[ext || ''] || 'pdf';
}

export function isAllowedFileType(filename: string): boolean {
  const allowed = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv'];
  const ext = filename.split('.').pop()?.toLowerCase();
  return allowed.includes(ext || '');
}

export function isFileSizeValid(bytes: number, maxMB: number = 50): boolean {
  return bytes <= maxMB * 1024 * 1024;
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timeout: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  }) as T;
}

export function normalizeSearch(str: string): string {
  return str.toLowerCase().trim();
}

export function matchesSearch(text: string, query: string): boolean {
  return normalizeSearch(text).includes(normalizeSearch(query));
}

export function clsx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}
