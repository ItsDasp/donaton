import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { donationService } from '../services/donationService';
import { needService } from '../services/needService';
import { logisticsService } from '../services/logisticsService';
import { dashboardService } from '../services/dashboardService';
import { usersService } from '../services/usersService';
import { MOCK_CENTERS, MOCK_VEHICLES, MOCK_ROUTES } from '../mock/logistics';

export function useDonations() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['donations'],
    queryFn: () => donationService.getAll(),
    enabled: Boolean(token),
    retry: (count, error) => (error as { status?: number })?.status !== 401 && count < 2,
  });
}

export function useDonation(id: string) {
  return useQuery({
    queryKey: ['donations', id],
    queryFn: () => donationService.getById(id),
    enabled: !!id,
  });
}

export function useNeeds() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['needs'],
    queryFn: () => needService.getAll(),
    enabled: Boolean(token),
    retry: (count, error) => (error as { status?: number })?.status !== 401 && count < 2,
  });
}

export function useNeed(id: string) {
  return useQuery({
    queryKey: ['needs', id],
    queryFn: () => needService.getById(id),
    enabled: !!id,
  });
}

export function useCenters() {
  return useQuery({
    queryKey: ['centers'],
    queryFn: () => Promise.resolve([...MOCK_CENTERS]),
  });
}

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: () => Promise.resolve([...MOCK_VEHICLES]),
  });
}

export function useRoutes() {
  return useQuery({
    queryKey: ['routes'],
    queryFn: () => Promise.resolve([...MOCK_ROUTES]),
  });
}

export function useUsers() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['auth', 'users'],
    queryFn: () => usersService.getAll(),
    enabled: Boolean(token),
    retry: (count, error) => (error as { status?: number })?.status !== 401 && count < 2,
  });
}

export function useEnvios() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['envios'],
    queryFn: () => logisticsService.getAll(),
    enabled: Boolean(token),
    retry: (count, error) => (error as { status?: number })?.status !== 401 && count < 2,
  });
}

function useAuthToken() {
  return useAuthStore((s) => s.token);
}

export function useDashboardKPIs() {
  const token = useAuthToken();
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => dashboardService.getKPIs(),
    enabled: Boolean(token),
    retry: (count, error) => (error as { status?: number })?.status !== 401 && count < 2,
  });
}

export function useActivities(limit?: number) {
  const token = useAuthToken();
  return useQuery({
    queryKey: ['dashboard', 'activities', limit],
    queryFn: () => dashboardService.getActivities(limit),
    enabled: Boolean(token),
    retry: (count, error) => (error as { status?: number })?.status !== 401 && count < 2,
  });
}

export function useAlerts() {
  const token = useAuthToken();
  return useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: () => dashboardService.getAlerts(),
    enabled: Boolean(token),
    retry: (count, error) => (error as { status?: number })?.status !== 401 && count < 2,
  });
}

export function useRegionStatus() {
  const token = useAuthToken();
  return useQuery({
    queryKey: ['dashboard', 'regions'],
    queryFn: () => dashboardService.getRegionStatus(),
    enabled: Boolean(token),
    retry: (count, error) => (error as { status?: number })?.status !== 401 && count < 2,
  });
}
