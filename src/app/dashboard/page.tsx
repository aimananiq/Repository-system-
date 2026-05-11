'use client';

import { useState, useEffect, useCallback } from 'react';
import { LayoutGrid, List, Files, Search } from 'lucide-react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { SearchBar } from '@/components/files/SearchBar';
import { FileFilters } from '@/components/files/FileFilters';
import { FileCard } from '@/components/files/FileCard';
import { FileTable } from '@/components/files/FileTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Pagination } from '@/components/ui/Pagination';
import { fileService } from '@/lib/fileService';
import { authService } from '@/lib/auth';
import { RepositoryFile, FileType, SortOption, FileFilters as IFileFilters } from '@/types/repositoryFile';

const PAGE_SIZE = 12;

const defaultFilters: IFileFilters = {
  search: '',
  fileType: '',
  category: '',
  department: '',
  sortBy: 'latest',
};

export default function DashboardPage() {
  const user = authService.getCurrentUser();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<IFileFilters>(defaultFilters);
  const [searchInput, setSearchInput] = useState('');
  const [files, setFiles] = useState<RepositoryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const loadFiles = useCallback((currentFilters: IFileFilters) => {
    setLoading(true);
    setTimeout(() => {
      const result = fileService.searchAndFilter(currentFilters);
      setFiles(result);
      setPage(1);
      setLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    loadFiles(filters);
  }, [filters, loadFiles]);

  const handleSearch = (value: string) => {
    setFilters((f) => ({ ...f, search: value }));
  };

  const handleReset = () => {
    setSearchInput('');
    setFilters(defaultFilters);
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.fileType !== '' ||
    filters.category !== '' ||
    filters.sortBy !== 'latest';

  const totalPages = Math.ceil(files.length / PAGE_SIZE);
  const paginatedFiles = files.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting}, {user?.fullName.split(' ')[0]}!
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Browse and search all files you have access to.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-semibold text-gray-900">Search Files</h2>
            </div>
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSearch={handleSearch}
              loading={loading}
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
            <FileFilters
              fileType={filters.fileType}
              category={filters.category}
              sortBy={filters.sortBy}
              onFileTypeChange={(v) => setFilters((f) => ({ ...f, fileType: v }))}
              onCategoryChange={(v) => setFilters((f) => ({ ...f, category: v }))}
              onSortChange={(v) => setFilters((f) => ({ ...f, sortBy: v }))}
              onReset={handleReset}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Files className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-600">
                {loading ? (
                  'Searching...'
                ) : (
                  <>
                    <span className="font-semibold text-gray-900">{files.length}</span>{' '}
                    {files.length === 1 ? 'file' : 'files'} found
                    {filters.search && (
                      <span className="text-gray-500"> for &quot;{filters.search}&quot;</span>
                    )}
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('grid')}
                className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading files..." />
          ) : files.length === 0 ? (
            <EmptyState
              title="No files found"
              description={
                hasActiveFilters
                  ? 'No files match your search or filters. Try adjusting your criteria.'
                  : 'No files are available for your account yet.'
              }
              action={hasActiveFilters ? { label: 'Clear filters', onClick: handleReset } : undefined}
            />
          ) : (
            <>
              {view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedFiles.map((file) => (
                    <FileCard key={file.id} file={file} />
                  ))}
                </div>
              ) : (
                <FileTable files={paginatedFiles} />
              )}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={files.length}
                itemsPerPage={PAGE_SIZE}
              />
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
