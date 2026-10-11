import type { DonationRecord } from '../types';
import { requestJson } from './api';

class DonationService {
  async getAll(): Promise<DonationRecord[]> {
    return requestJson<DonationRecord[]>('/donations');
  }

  async getById(id: string | number): Promise<DonationRecord | null> {
    try {
      return await requestJson<DonationRecord>(`/donations/${id}`);
    } catch {
      return null;
    }
  }

  async create(donation: Omit<DonationRecord, 'id'>): Promise<DonationRecord> {
    return requestJson<DonationRecord>('/donations', {
      method: 'POST',
      body: donation,
    });
  }

  async update(id: string | number, donation: Omit<DonationRecord, 'id'>): Promise<DonationRecord> {
    return requestJson<DonationRecord>(`/donations/${id}`, {
      method: 'PUT',
      body: donation,
    });
  }

  async delete(id: string | number): Promise<void> {
    await requestJson<null>(`/donations/${id}`, {
      method: 'DELETE',
    });
  }
}

export const donationService = new DonationService();
