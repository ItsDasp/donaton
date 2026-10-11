import type { EnvioRecord } from '../types';
import { requestJson } from './api';

class LogisticsService {
  async getAll(acopioCenterId?: string): Promise<EnvioRecord[]> {
    return requestJson<EnvioRecord[]>('/logistics', {
      query: acopioCenterId ? { acopioCenterId } : undefined,
    });
  }

  async getById(id: string | number): Promise<EnvioRecord | null> {
    try {
      const envios = await this.getAll();
      return envios.find(envio => envio.id === Number(id)) ?? null;
    } catch {
      return null;
    }
  }

  async create(donacionId: number): Promise<EnvioRecord> {
    return requestJson<EnvioRecord>('/logistics', {
      method: 'POST',
      body: { donacionId },
    });
  }

  async updateState(id: string | number, estado: string): Promise<EnvioRecord> {
    return requestJson<EnvioRecord>(`/logistics/${id}/estado`, {
      method: 'PUT',
      query: { estado },
    });
  }
}

export const logisticsService = new LogisticsService();
