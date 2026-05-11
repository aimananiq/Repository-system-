const isBrowser = typeof window !== 'undefined';

export const storage = {
  get<T>(key: string): T | null {
    if (!isBrowser) return null;
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error('Failed to save to localStorage');
    }
  },

  remove(key: string): void {
    if (!isBrowser) return;
    localStorage.removeItem(key);
  },

  clear(): void {
    if (!isBrowser) return;
    localStorage.clear();
  },
};

export const STORAGE_KEYS = {
  AUTH_USER: 'repo_auth_user',
  USERS: 'repo_users',
  FILES: 'repo_files',
  INITIALIZED: 'repo_initialized',
} as const;
