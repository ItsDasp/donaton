import type { ActivityItem, AlertItem, RegionStatus, DashboardKPI, Notification } from '../types';

export const MOCK_KPIs: DashboardKPI[] = [
  { label: 'Donaciones recibidas', value: 1247, change: 12.5, changeLabel: 'vs. semana anterior', icon: 'Package', color: 'cyan' },
  { label: 'Necesidades activas', value: 34, change: -8.1, changeLabel: 'vs. semana anterior', icon: 'AlertCircle', color: 'amber' },
  { label: 'Entregas completadas', value: 892, change: 23.4, changeLabel: 'vs. semana anterior', icon: 'CheckCircle2', color: 'green' },
  { label: 'Centros saturados', value: 3, change: 1, changeLabel: 'nuevos hoy', icon: 'Warehouse', color: 'red' },
  { label: 'Tiempo promedio de entrega', value: '14.2h', change: -18.3, changeLabel: 'vs. semana anterior', icon: 'Clock', color: 'blue' },
  { label: 'Rutas activas', value: 5, change: 2, changeLabel: 'en tránsito', icon: 'Truck', color: 'slate' }
];

export const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: 'a1', type: 'donation', title: 'Nueva donación recibida', description: 'DON-1034: 800kg de fideos desde Doña Juanita Ltda.', timestamp: '2026-04-29T12:00:00Z', region: 'Metropolitana', userName: 'Juan Pérez' },
  { id: 'a2', type: 'logistics', title: 'Ruta en tránsito', description: 'RUT-0089: Camión F350 con agua y leche hacia Providencia', timestamp: '2026-04-29T16:45:00Z', region: 'Metropolitana', userName: 'Carlos Ruiz' },
  { id: 'a3', type: 'alert', title: 'Centro colapsado', description: 'Centro Acopio La Serena al 100% de capacidad', timestamp: '2026-04-29T10:00:00Z', region: 'Coquimbo' },
  { id: 'a4', type: 'need', title: 'Necesidad urgente creada', description: 'NEC-0049: 1000 bidones de agua para Antofagasta', timestamp: '2026-04-29T11:00:00Z', region: 'Antofagasta', userName: 'Sandra Vega' },
  { id: 'a5', type: 'donation', title: 'Donación entregada', description: 'DON-1024: 500kg arroz entregado en Ñuñoa', timestamp: '2026-04-29T14:20:00Z', region: 'Metropolitana', userName: 'Carlos Ruiz' },
  { id: 'a6', type: 'logistics', title: 'Vehículo en mantención', description: 'V-004 Camión Volquete programado para revisión', timestamp: '2026-04-28T09:00:00Z', region: 'Araucanía' },
  { id: 'a7', type: 'need', title: 'Necesidad satisfecha', description: 'NEC-0047: Kits de higiene completados en Temuco', timestamp: '2026-04-27T13:00:00Z', region: 'Araucanía', userName: 'Miguel Torres' },
  { id: 'a8', type: 'donation', title: 'Empresa donante registrada', description: 'Unilever Chile compromete 600 kits higiene mensuales', timestamp: '2026-04-25T07:30:00Z', region: 'Araucanía' },
  { id: 'a9', type: 'alert', title: 'Demora en entrega', description: 'RUT-0092 retrasada por tráfico en sector centro', timestamp: '2026-04-29T17:30:00Z', region: 'Metropolitana' },
  { id: 'a10', type: 'user', title: 'Nuevo operador', description: 'Andrés Navarro asignado como coordinador Coquimbo', timestamp: '2026-04-05T08:00:00Z', region: 'Coquimbo' }
];

export const MOCK_ALERTS: AlertItem[] = [
  { id: 'al1', type: 'saturacion', severity: 'alta', title: 'Centro saturado', description: 'Centro Acopio La Serena al 100% de capacidad. No recibe más donaciones.', timestamp: '2026-04-29T10:00:00Z', region: 'Coquimbo', centerName: 'Centro Acopio La Serena', resolved: false },
  { id: 'al2', type: 'demora', severity: 'media', title: 'Demora en ruta', description: 'RUT-0092 retrasada 45 minutos por congestión vial.', timestamp: '2026-04-29T17:30:00Z', region: 'Metropolitana', resolved: false },
  { id: 'al3', type: 'urgencia', severity: 'alta', title: 'Falta agua urgente', description: 'Antofagasta requiere 700 bidones adicionales antes de mañana.', timestamp: '2026-04-29T11:00:00Z', region: 'Antofagasta', resolved: false },
  { id: 'al4', type: 'saturacion', severity: 'media', title: 'Centro cercano a saturación', description: 'Centro Acopio Ñuñoa al 92%. Se recomienda redistribuir.', timestamp: '2026-04-29T09:00:00Z', region: 'Metropolitana', centerName: 'Centro Acopio Ñuñoa', resolved: false },
  { id: 'al5', type: 'vehiculo', severity: 'media', title: 'Vehículo fuera de servicio', description: 'V-004 Camión Volquete en mantención programada.', timestamp: '2026-04-28T09:00:00Z', region: 'Araucanía', resolved: true },
  { id: 'al6', type: 'inventario', severity: 'baja', title: 'Stock bajo de medicamentos', description: 'Paracetamol en Concepción solo cubre 2 días de demanda.', timestamp: '2026-04-29T11:00:00Z', region: 'Biobío', centerName: 'Centro Acopio Concepción', resolved: false }
];

export const MOCK_REGIONS: RegionStatus[] = [
  { region: 'Metropolitana', centersCount: 2, activeNeeds: 15, donationsReceived: 587, deliveriesCompleted: 423, avgDeliveryTime: 8.5, status: 'alerta' },
  { region: 'Biobío', centersCount: 1, activeNeeds: 8, donationsReceived: 312, deliveriesCompleted: 198, avgDeliveryTime: 22.3, status: 'critica' },
  { region: 'Valparaíso', centersCount: 1, activeNeeds: 4, donationsReceived: 145, deliveriesCompleted: 89, avgDeliveryTime: 18.1, status: 'alerta' },
  { region: 'Araucanía', centersCount: 1, activeNeeds: 5, donationsReceived: 198, deliveriesCompleted: 156, avgDeliveryTime: 26.7, status: 'normal' },
  { region: 'Antofagasta', centersCount: 1, activeNeeds: 3, donationsReceived: 67, deliveriesCompleted: 45, avgDeliveryTime: 31.2, status: 'critica' },
  { region: 'Coquimbo', centersCount: 1, activeNeeds: 2, donationsReceived: 78, deliveriesCompleted: 52, avgDeliveryTime: 24.5, status: 'alerta' }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'urgent', title: 'Centro colapsado', message: 'La Serena al 100% de capacidad', read: false, timestamp: '2026-04-29T10:00:00Z', link: '/logistics' },
  { id: 'n2', type: 'warning', title: 'Demora en ruta', message: 'RUT-0092 retrasada 45 minutos', read: false, timestamp: '2026-04-29T17:30:00Z', link: '/logistics' },
  { id: 'n3', type: 'success', title: 'Donación entregada', message: 'DON-1024 entregada exitosamente', read: true, timestamp: '2026-04-29T14:20:00Z', link: '/donations' },
  { id: 'n4', type: 'info', title: 'Nueva necesidad', message: 'NEC-0049 creada en Antofagasta', read: false, timestamp: '2026-04-29T11:00:00Z', link: '/needs' },
  { id: 'n5', type: 'success', title: 'Necesidad satisfecha', message: 'NEC-0047 completada en Temuco', read: true, timestamp: '2026-04-27T13:00:00Z', link: '/needs' }
];

export const DONATIONS_BY_CATEGORY = [
  { name: 'Alimentos', value: 35, color: '#06b6d4' },
  { name: 'Agua', value: 28, color: '#3b82f6' },
  { name: 'Medicamentos', value: 15, color: '#22c55e' },
  { name: 'Ropa', value: 10, color: '#f59e0b' },
  { name: 'Higiene', value: 7, color: '#8b5cf6' },
  { name: 'Herramientas', value: 3, color: '#ef4444' },
  { name: 'Otros', value: 2, color: '#64748b' }
];

export const DONATIONS_BY_WEEK = [
  { week: 'S1', donations: 156, entregas: 98 },
  { week: 'S2', donations: 203, entregas: 145 },
  { week: 'S3', donations: 178, entregas: 134 },
  { week: 'S4', donations: 245, entregas: 189 },
  { week: 'S5', donations: 198, entregas: 156 },
  { week: 'S6', donations: 267, entregas: 214 }
];
