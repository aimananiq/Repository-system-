import { RepositoryFile, CreateFileInput, UpdateFileInput, FileFilters, FileType } from '@/types/repositoryFile';
import { storage, STORAGE_KEYS } from './storage';
import { MOCK_FILES } from './mockData';
import { generateId, matchesSearch } from './utils';
import { authService } from './auth';

class FileService {
  private getAll(): RepositoryFile[] {
    const stored = storage.get<RepositoryFile[]>(STORAGE_KEYS.FILES);
    if (!stored) {
      storage.set(STORAGE_KEYS.FILES, MOCK_FILES);
      return MOCK_FILES;
    }
    return stored;
  }

  private save(files: RepositoryFile[]): void {
    storage.set(STORAGE_KEYS.FILES, files);
  }

  getAllFiles(): RepositoryFile[] {
    return this.getAll().filter((f) => f.isActive);
  }

  getAccessibleFiles(): RepositoryFile[] {
    const user = authService.getCurrentUser();
    if (!user) return [];

    const files = this.getAllFiles();
    if (user.role === 'admin') return files;

    return files.filter((f) =>
      f.accessPermissions.some((perm) => user.permissions.includes(perm))
    );
  }

  getFileById(id: string): RepositoryFile | null {
    return this.getAll().find((f) => f.id === id) || null;
  }

  searchAndFilter(filters: FileFilters): RepositoryFile[] {
    let files = this.getAccessibleFiles();

    if (filters.search.trim()) {
      const q = filters.search.trim();
      files = files.filter(
        (f) =>
          matchesSearch(f.title, q) ||
          matchesSearch(f.description, q) ||
          matchesSearch(f.category, q) ||
          matchesSearch(f.fileType, q) ||
          matchesSearch(f.uploadedByName, q) ||
          matchesSearch(f.originalFileName, q) ||
          f.tags.some((tag) => matchesSearch(tag, q))
      );
    }

    if (filters.fileType) {
      const ft = filters.fileType;
      files = files.filter((f) => {
        if (ft === 'xls' || ft === 'xlsx') return f.fileType === 'xls' || f.fileType === 'xlsx';
        if (ft === 'doc' || ft === 'docx') return f.fileType === 'doc' || f.fileType === 'docx';
        return f.fileType === ft;
      });
    }

    if (filters.category) {
      files = files.filter((f) => f.category === filters.category);
    }

    if (filters.department) {
      files = files.filter((f) => f.department === filters.department);
    }

    switch (filters.sortBy) {
      case 'latest':
        files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        break;
      case 'oldest':
        files.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
        break;
      case 'name_asc':
        files.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name_desc':
        files.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'type':
        files.sort((a, b) => a.fileType.localeCompare(b.fileType));
        break;
    }

    return files;
  }

  createFile(input: CreateFileInput): { success: boolean; error?: string; file?: RepositoryFile } {
    const files = this.getAll();
    const newFile: RepositoryFile = {
      ...input,
      id: generateId('file'),
      uploadedAt: new Date().toISOString(),
      isActive: true,
    };
    this.save([...files, newFile]);
    return { success: true, file: newFile };
  }

  updateFile(id: string, input: UpdateFileInput): { success: boolean; error?: string; file?: RepositoryFile } {
    const files = this.getAll();
    const index = files.findIndex((f) => f.id === id);

    if (index === -1) return { success: false, error: 'File not found.' };

    const updated = [...files];
    updated[index] = { ...updated[index], ...input };
    this.save(updated);
    return { success: true, file: updated[index] };
  }

  deleteFile(id: string): { success: boolean; error?: string } {
    const files = this.getAll();
    const index = files.findIndex((f) => f.id === id);

    if (index === -1) return { success: false, error: 'File not found.' };

    const updated = [...files];
    updated[index] = { ...updated[index], isActive: false };
    this.save(updated);
    return { success: true };
  }

  getCategories(): string[] {
    const files = this.getAllFiles();
    const seen = new Set<string>();
    const categories: string[] = [];
    for (const f of files) {
      if (!seen.has(f.category)) { seen.add(f.category); categories.push(f.category); }
    }
    return categories.sort();
  }

  getAdminFiles(filters?: Partial<FileFilters>): RepositoryFile[] {
    let files = this.getAllFiles();

    if (filters?.search) {
      const q = filters.search.trim();
      files = files.filter(
        (f) =>
          matchesSearch(f.title, q) ||
          matchesSearch(f.description, q) ||
          matchesSearch(f.category, q) ||
          matchesSearch(f.fileType, q) ||
          matchesSearch(f.uploadedByName, q)
      );
    }

    if (filters?.fileType) {
      files = files.filter((f) => f.fileType === filters.fileType);
    }

    if (filters?.category) {
      files = files.filter((f) => f.category === filters.category);
    }

    files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    return files;
  }
}

export const fileService = new FileService();
