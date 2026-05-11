'use client';

import { FileType, SortOption, CATEGORIES } from '@/types/repositoryFile';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { RotateCcw } from 'lucide-react';

interface FileFiltersProps {
  fileType: FileType | '';
  category: string;
  sortBy: SortOption;
  onFileTypeChange: (value: FileType | '') => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const fileTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'Word (DOC/DOCX)' },
  { value: 'xlsx', label: 'Excel (XLS/XLSX)' },
  { value: 'csv', label: 'CSV' },
  { value: 'sheet', label: 'Spreadsheet' },
];

const sortOptions = [
  { value: 'latest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name (A–Z)' },
  { value: 'name_desc', label: 'Name (Z–A)' },
  { value: 'type', label: 'File Type' },
];

const categoryOptions = [
  { value: '', label: 'All Categories' },
  ...CATEGORIES.map((c) => ({ value: c, label: c })),
];

export function FileFilters({
  fileType,
  category,
  sortBy,
  onFileTypeChange,
  onCategoryChange,
  onSortChange,
  onReset,
  hasActiveFilters,
}: FileFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[140px]">
        <Select
          label="File Type"
          value={fileType}
          onChange={(e) => onFileTypeChange(e.target.value as FileType | '')}
          options={fileTypeOptions}
        />
      </div>
      <div className="flex-1 min-w-[140px]">
        <Select
          label="Category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          options={categoryOptions}
        />
      </div>
      <div className="flex-1 min-w-[140px]">
        <Select
          label="Sort By"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          options={sortOptions}
        />
      </div>
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="md"
          onClick={onReset}
          icon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset
        </Button>
      )}
    </div>
  );
}
