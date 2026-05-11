import { User, CreateUserInput, UpdateUserInput } from '@/types/user';
import { storage, STORAGE_KEYS } from './storage';
import { MOCK_USERS } from './mockData';
import { generateId } from './utils';

class StaffService {
  private ensureInitialized(): void {
    const initialized = storage.get<boolean>(STORAGE_KEYS.INITIALIZED);
    if (!initialized) {
      storage.set(STORAGE_KEYS.USERS, MOCK_USERS);
      storage.set(STORAGE_KEYS.INITIALIZED, true);
    }
  }

  getAllUsers(): User[] {
    this.ensureInitialized();
    return storage.get<User[]>(STORAGE_KEYS.USERS) || MOCK_USERS;
  }

  getStaffUsers(): User[] {
    return this.getAllUsers().filter((u) => u.role === 'staff');
  }

  getUserById(id: string): User | null {
    return this.getAllUsers().find((u) => u.id === id) || null;
  }

  getUserByEmail(email: string): User | null {
    return this.getAllUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  getUserByUsername(username: string): User | null {
    return this.getAllUsers().find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
  }

  createUser(input: CreateUserInput): { success: boolean; error?: string; user?: User } {
    const users = this.getAllUsers();

    if (users.find((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      return { success: false, error: 'A user with this email already exists.' };
    }

    if (users.find((u) => u.username.toLowerCase() === input.username.toLowerCase())) {
      return { success: false, error: 'A user with this username already exists.' };
    }

    const newUser: User = {
      ...input,
      id: generateId('usr'),
      createdAt: new Date().toISOString(),
    };

    const updated = [...users, newUser];
    storage.set(STORAGE_KEYS.USERS, updated);
    return { success: true, user: newUser };
  }

  updateUser(id: string, input: UpdateUserInput): { success: boolean; error?: string; user?: User } {
    const users = this.getAllUsers();
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return { success: false, error: 'User not found.' };
    }

    if (input.email) {
      const existing = users.find((u) => u.email.toLowerCase() === input.email!.toLowerCase() && u.id !== id);
      if (existing) return { success: false, error: 'Email already in use.' };
    }

    if (input.username) {
      const existing = users.find((u) => u.username.toLowerCase() === input.username!.toLowerCase() && u.id !== id);
      if (existing) return { success: false, error: 'Username already in use.' };
    }

    const updated = [...users];
    updated[index] = { ...updated[index], ...input };
    storage.set(STORAGE_KEYS.USERS, updated);
    return { success: true, user: updated[index] };
  }

  deleteUser(id: string): { success: boolean; error?: string } {
    const users = this.getAllUsers();
    const user = users.find((u) => u.id === id);

    if (!user) return { success: false, error: 'User not found.' };
    if (user.role === 'admin') return { success: false, error: 'Cannot delete admin accounts.' };

    const updated = users.filter((u) => u.id !== id);
    storage.set(STORAGE_KEYS.USERS, updated);
    return { success: true };
  }

  toggleUserStatus(id: string): { success: boolean; error?: string } {
    const users = this.getAllUsers();
    const user = users.find((u) => u.id === id);

    if (!user) return { success: false, error: 'User not found.' };
    if (user.role === 'admin') return { success: false, error: 'Cannot deactivate admin accounts.' };

    return this.updateUser(id, { isActive: !user.isActive });
  }
}

export const staffService = new StaffService();
