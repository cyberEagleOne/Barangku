// Demo implementation. Replace with real API calls.

import { inMemoryStore } from './mockData';
import type { User, UserRole } from './types';

export async function getCurrentUser(): Promise<User | null> {
  return Promise.resolve(inMemoryStore.currentUser);
}

export async function login(
  identity: string,
  _password?: string,
  role: UserRole = 'pelanggan'
): Promise<User> {
  const trimmed = identity.trim();
  const existing = inMemoryStore.users.find(
    u => u.contact === trimmed || u.email === trimmed || u.phone === trimmed
  );

  let user: User;
  if (existing) {
    user = { ...existing, role };
  } else {
    const derivedName = trimmed.includes('@')
      ? trimmed.split('@')[0].replace(/[._-]/g, ' ').trim() || 'Kamu'
      : role === 'tukang'
      ? 'Mas Dedi'
      : 'Pelanggan Barangku';

    user = {
      id: `user-${Date.now()}`,
      name: derivedName,
      contact: trimmed,
      email: trimmed.includes('@') ? trimmed : undefined,
      phone: !trimmed.includes('@') ? trimmed : undefined,
      role,
      fresh: false,
    };
    inMemoryStore.users.push(user);
  }

  inMemoryStore.currentUser = user;
  return Promise.resolve(user);
}

export async function register(userData: {
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  password?: string;
  agreed?: boolean;
}): Promise<User> {
  const contact = userData.email?.trim() || userData.phone?.trim() || '0812-0000-0000';
  const newUser: User = {
    id: `user-${Date.now()}`,
    name: userData.name.trim(),
    contact,
    email: userData.email?.trim(),
    phone: userData.phone?.trim(),
    role: userData.role,
    fresh: true,
  };

  inMemoryStore.users.push(newUser);
  inMemoryStore.currentUser = newUser;
  return Promise.resolve(newUser);
}

export async function logout(): Promise<void> {
  inMemoryStore.currentUser = null;
  return Promise.resolve();
}

export async function requestPasswordReset(_identity: string): Promise<void> {
  return Promise.resolve();
}

