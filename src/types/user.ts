export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  department: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

export type CreateUserInput = Omit<User, 'id' | 'createdAt'>;

export type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt'>>;

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: UserRole;
  department: string;
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}
