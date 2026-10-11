import { requestJson } from './api';
import type { ManagedUserRecord } from '../types';

export type AdminUserPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'USER' | 'ADMIN' | 'ONG';
};

export type RoleUpdatePayload = {
  role: 'USER' | 'ADMIN' | 'ONG';
};

class UsersService {
  async getAll(): Promise<ManagedUserRecord[]> {
    return requestJson<ManagedUserRecord[]>('/auth/users');
  }

  async create(user: AdminUserPayload): Promise<ManagedUserRecord> {
    return requestJson<ManagedUserRecord>('/auth/users', {
      method: 'POST',
      body: user,
    });
  }

  async updateRole(id: number, role: RoleUpdatePayload['role']): Promise<ManagedUserRecord> {
    return requestJson<ManagedUserRecord>(`/auth/users/${id}/role`, {
      method: 'PUT',
      body: { role },
    });
  }

  async delete(id: number): Promise<void> {
    await requestJson<null>(`/auth/users/${id}`, {
      method: 'DELETE',
    });
  }
}

export const usersService = new UsersService();
