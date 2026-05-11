export type FileType = 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'csv' | 'sheet';

export type AccessLevel = 'public' | 'department' | 'restricted';

export interface RepositoryFile {
  id: string;
  title: string;
  originalFileName: string;
  description: string;
  fileType: FileType;
  fileSize: number;
  category: string;
  department: string;
  accessLevel: AccessLevel;
  accessPermissions: string[];
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  fileUrl: string;
  spreadsheetLink?: string;
  tags: string[];
  isActive: boolean;
}

export type CreateFileInput = Omit<RepositoryFile, 'id' | 'uploadedAt' | 'isActive'>;

export type UpdateFileInput = Partial<Omit<RepositoryFile, 'id' | 'uploadedAt'>>;

export interface FileFilters {
  search: string;
  fileType: FileType | '';
  category: string;
  department: string;
  sortBy: SortOption;
}

export type SortOption = 'latest' | 'oldest' | 'name_asc' | 'name_desc' | 'type';

export const FILE_TYPE_LABELS: Record<FileType, string> = {
  pdf: 'PDF',
  doc: 'Word',
  docx: 'Word',
  xls: 'Excel',
  xlsx: 'Excel',
  csv: 'CSV',
  sheet: 'Spreadsheet',
};

export const FILE_TYPE_COLORS: Record<FileType, string> = {
  pdf: 'text-red-600 bg-red-50',
  doc: 'text-blue-600 bg-blue-50',
  docx: 'text-blue-600 bg-blue-50',
  xls: 'text-green-600 bg-green-50',
  xlsx: 'text-green-600 bg-green-50',
  csv: 'text-orange-600 bg-orange-50',
  sheet: 'text-purple-600 bg-purple-50',
};

export const CATEGORIES = [
  'IT',
  'HR',
  'Finance',
  'Operations',
  'Marketing',
  'Legal',
  'Administration',
  'Procurement',
  'Engineering',
  'Sales',
];
