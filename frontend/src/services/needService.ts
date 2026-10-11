import type { Need, NeedPriority, NeedStatus } from '../types';
import { requestJson } from './api';

class NeedService {
  async getAll(): Promise<Need[]> {
    return requestJson<Need[]>('/needs');
  }

  async getById(id: string): Promise<Need | null> {
    try {
      return await requestJson<Need>(`/needs/${id}`);
    } catch {
      return null;
    }
  }

  async getByPriority(priority: NeedPriority): Promise<Need[]> {
    const all = await this.getAll();
    return all.filter(n => n.priority === priority);
  }

  async getByStatus(status: NeedStatus): Promise<Need[]> {
    const all = await this.getAll();
    return all.filter(n => n.status === status);
  }

  async getByRegion(region: string): Promise<Need[]> {
    const all = await this.getAll();
    return all.filter(n => n.region === region);
  }

  async search(query: string): Promise<Need[]> {
    const all = await this.getAll();
    const q = query.toLowerCase();
    return all.filter(n =>
      n.code.toLowerCase().includes(q) ||
      n.productName.toLowerCase().includes(q) ||
      n.centerName.toLowerCase().includes(q) ||
      n.region.toLowerCase().includes(q)
    );
  }

  async create(need: Omit<Need, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'matchedDonations'>): Promise<Need> {
    return requestJson<Need>('/needs', {
      method: 'POST',
      body: {
        ...need,
        quantityReceived: 0,
        matchedDonations: 0,
      },
    });
  }

  async updateStatus(id: string, status: NeedStatus): Promise<Need | null> {
    const existing = await this.getById(id);
    if (!existing) return null;
    return requestJson<Need>(`/needs/${id}`, {
      method: 'PUT',
      body: {
        ...existing,
        status,
      },
    });
  }

  async update(id: string, need: Need): Promise<Need> {
    return requestJson<Need>(`/needs/${id}`, {
      method: 'PUT',
      body: need,
    });
  }

  async receive(id: string, amount: number): Promise<Need> {
    return requestJson<Need>(`/needs/${id}/receive`, {
      method: 'PUT',
      query: { amount },
    });
  }

  async delete(id: string): Promise<void> {
    await requestJson<null>(`/needs/${id}`, { method: 'DELETE' });
  }
}

export const needService = new NeedService();
