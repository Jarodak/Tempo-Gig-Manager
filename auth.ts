import { UserRole } from './types';

const STORAGE_KEY = 'tempo_user';

export interface StoredUser {
  role: UserRole;
  email?: string;
  name?: string;
  createdAt: number;
}

export const getCurrentUser = (): StoredUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: Omit<StoredUser, 'createdAt'>): void => {
  const stored: StoredUser = { ...user, createdAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const isLoggedIn = (): boolean => {
  return !!getCurrentUser();
};
