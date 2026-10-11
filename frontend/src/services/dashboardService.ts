import type { DashboardKPI, ActivityItem, AlertItem, RegionStatus, Notification } from '../types';
import { MOCK_ALERTS, MOCK_REGIONS, MOCK_NOTIFICATIONS } from '../mock/dashboard';
import { donationService } from './donationService';
import { logisticsService } from './logisticsService';
import { needService } from './needService';

const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

class DashboardService {
  async getKPIs(): Promise<DashboardKPI[]> {
    try {
      const [donations, envios, needs] = await Promise.all([
        donationService.getAll().catch(() => []),
        logisticsService.getAll().catch(() => []),
        needService.getAll().catch(() => []),
      ]);

      const totalDonations = Array.isArray(donations) ? donations.length : 0;

      return [
        { label: 'Donaciones recibidas', value: totalDonations, icon: 'Package', color: 'cyan' },
        { label: 'Necesidades activas', value: Array.isArray(needs) ? needs.filter((n: any) => n.status === 'activa').length : 0, icon: 'AlertCircle', color: 'amber' },
        { label: 'Entregas completadas', value: Array.isArray(envios) ? envios.filter((e: any) => e.estado === 'entregado').length : 0, icon: 'CheckCircle2', color: 'green' },
        { label: 'Centros saturados', value: 0, icon: 'Warehouse', color: 'red' },
        { label: 'Tiempo promedio de entrega', value: '–', icon: 'Clock', color: 'blue' },
        { label: 'Rutas activas', value: 0, icon: 'Truck', color: 'slate' }
      ];
    } catch (e) {
      
      await delay();
      return [...MOCK_REGIONS].slice(0, 6).map((r: any, i: number) => ({ label: r.region, value: r.activeNeeds, icon: 'Package', color: ['cyan','amber','green','red','blue','slate'][i % 6] })) as DashboardKPI[];
    }
  }

  async getActivities(limit?: number): Promise<ActivityItem[]> {
    try {
      const [donations, envios] = await Promise.all([
        donationService.getAll().catch(() => []),
        logisticsService.getAll().catch(() => []),
      ]);

      const donationActivities: ActivityItem[] = (Array.isArray(donations) ? donations : [])
        .slice(-20)
        .reverse()
        .map(d => ({
          id: `don-${d.id}`,
          type: 'donation',
          title: `Nueva donación ${d.id}`,
          description: `${d.descripcion} · ${d.cantidad} ${d.unit ?? ''}`.trim(),
          timestamp: (d as any).createdAt ?? new Date().toISOString(),
          region: (d as any).region,
          userName: (d as any).donorName
        }));

      const logisticsActivities: ActivityItem[] = (Array.isArray(envios) ? envios : [])
        .slice(-20)
        .reverse()
        .map(e => ({
          id: `env-${e.id}`,
          type: 'logistics',
          title: `Envío ${e.id}`,
          description: `Donación ${e.donacionId} · ${e.direccion}`,
          timestamp: e.createdAt ?? new Date().toISOString(),
          region: e.region
        }));

      const merged = [...donationActivities, ...logisticsActivities].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return limit ? merged.slice(0, limit) : merged;
    } catch {
      await delay();
      return [...(MOCK_REGIONS as any[])].slice(0, limit ?? 8).map((r,i)=>({ id:`a${i}`, type: 'alert', title: `Región ${r.region}`, description: '', timestamp: new Date().toISOString(), region: r.region }));
    }
  }

  async getAlerts(): Promise<AlertItem[]> {
    try {
      
      const envios = await logisticsService.getAll().catch(() => []);
      const alerts: AlertItem[] = [];
      
      (Array.isArray(envios) ? envios : []).forEach((e: any) => {
        if (e.estado === 'inexistente' || e.estado === 'cancelado') {
          alerts.push({ id: `al-${e.id}`, type: 'demora', severity: 'media', title: `Problema envío ${e.id}`, description: `Estado: ${e.estado}`, timestamp: e.createdAt ?? new Date().toISOString(), region: e.region, resolved: false });
        }
      });
      if (alerts.length) return alerts;
      return [...MOCK_ALERTS];
    } catch {
      await delay();
      return [...MOCK_ALERTS];
    }
  }

  async getRegionStatus(): Promise<RegionStatus[]> {
    try {
      const needs = await needService.getAll().catch(() => []);
      const envios = await logisticsService.getAll().catch(() => []);

      const byRegion: Record<string, Partial<RegionStatus>> = {};

      (Array.isArray(needs) ? needs : []).forEach((n: any) => {
        const r = n.region ?? 'Sin región';
        byRegion[r] = byRegion[r] || { region: r, centersCount: 0, activeNeeds: 0, donationsReceived: 0, deliveriesCompleted: 0, avgDeliveryTime: 0, status: 'normal' };
        (byRegion[r]!.activeNeeds as number) = (byRegion[r]!.activeNeeds as number) + (n.status === 'activa' ? 1 : 0);
      });

      (Array.isArray(envios) ? envios : []).forEach((e: any) => {
        const r = e.region ?? 'Sin región';
        byRegion[r] = byRegion[r] || { region: r, centersCount: 0, activeNeeds: 0, donationsReceived: 0, deliveriesCompleted: 0, avgDeliveryTime: 0, status: 'normal' };
        (byRegion[r]!.donationsReceived as number) = (byRegion[r]!.donationsReceived as number) + 1;
        if (e.estado === 'entregado') (byRegion[r]!.deliveriesCompleted as number) = (byRegion[r]!.deliveriesCompleted as number) + 1;
      });

      const regions = Object.values(byRegion) as RegionStatus[];
      if (regions.length) return regions;
      return [...MOCK_REGIONS];
    } catch {
      await delay();
      return [...MOCK_REGIONS];
    }
  }

  async getNotifications(): Promise<Notification[]> {
    await delay();
    return [...MOCK_NOTIFICATIONS];
  }
}

export const dashboardService = new DashboardService();
