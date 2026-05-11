import { AuthUser, LoginCredentials, User } from '@/types/user';
import { storage, STORAGE_KEYS } from './storage';
import { staffService } from './staffService';

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    username: user.username,
    role: user.role,
    department: user.department,
    permissions: user.permissions,
  };
}

class AuthService {
  getCurrentUser(): AuthUser | null {
    return storage.get<AuthUser>(STORAGE_KEYS.AUTH_USER);
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  login(credentials: LoginCredentials): { success: boolean; error?: string; user?: AuthUser } {
    const users = staffService.getAllUsers();
    const user = users.find(
      (u) =>
        (u.email.toLowerCase() === credentials.email.toLowerCase() ||
          u.username.toLowerCase() === credentials.email.toLowerCase()) &&
        u.password === credentials.password
    );

    if (!user) {
      return { success: false, error: 'Invalid email/username or password.' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Your account has been deactivated. Please contact an administrator.' };
    }

    const authUser = toAuthUser(user);
    storage.set(STORAGE_KEYS.AUTH_USER, authUser);
    return { success: true, user: authUser };
  }

  logout(): void {
    storage.remove(STORAGE_KEYS.AUTH_USER);
  }

  hasPermission(category: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions.includes(category);
  }
}

export const authService = new AuthService();
