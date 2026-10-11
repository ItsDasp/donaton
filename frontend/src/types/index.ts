export type UserRole = 'admin' | 'operador' | 'coordinador' | 'donante' | 'voluntario';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  region?: string;
  createdAt: string;
  lastLogin?: string;
  permissions: Permission[];
}

export type Permission =
  | 'dashboard:view'
  | 'donations:view'
  | 'donations:create'
  | 'donations:edit'
  | 'donations:delete'
  | 'needs:view'
  | 'needs:create'
  | 'needs:edit'
  | 'needs:delete'
  | 'logistics:view'
  | 'logistics:edit'
  | 'users:manage'
  | 'reports:view'
  | 'settings:manage';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'dashboard:view', 'donations:view', 'donations:create', 'donations:edit', 'donations:delete',
    'needs:view', 'needs:create', 'needs:edit', 'needs:delete',
    'logistics:view', 'logistics:edit', 'users:manage', 'reports:view', 'settings:manage'
  ],
  operador: [
    'dashboard:view', 'donations:view', 'donations:create', 'donations:edit',
    'needs:view', 'needs:create', 'needs:edit', 'logistics:view', 'logistics:edit'
  ],
  coordinador: [
    'dashboard:view', 'donations:view', 'needs:view', 'needs:create', 'needs:edit',
    'logistics:view', 'logistics:edit', 'reports:view'
  ],
  donante: [
    'dashboard:view', 'donations:view', 'donations:create'
  ],
  voluntario: [
    'dashboard:view', 'donations:view', 'logistics:view'
  ]
};

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface ManagedUserRecord {
  id: number;
  name?: string | null;
  email: string;
  phone?: string | null;
  role: 'USER' | 'ADMIN' | 'ONG';
}

export interface DonationRecord {
  id: number;
  descripcion: string;
  unit: string;
  cantidad: number;
  tipo: string;
  direccion: string;
  needId?: string | null;
}

export type EnvioEstado =
  | 'pendiente_acopio'
  | 'recibida'
  | 'en_camino'
  | 'entregado'
  | 'inexistente';

export interface EnvioRecord {
  id: number;
  direccion: string;
  estado: EnvioEstado | string;
  unit: string;
  donacionId: number;
  needId?: string;
  region: string;
  acopioCenterId?: string;
  acopioCenterName?: string;
  createdAt?: string;
  acopioDeadline?: string;
  cantidadDonada?: number;
}

export type DonationStatus = 'recibida' | 'en_inventario' | 'asignada' | 'en_transito' | 'entregada';
export type DonationType = 'alimentos' | 'agua' | 'ropa' | 'medicamentos' | 'herramientas' | 'higiene' | 'otros';

export interface Donation {
  id: string;
  code: string;
  type: DonationType;
  description: string;
  quantity: number;
  unit: string;
  status: DonationStatus;
  donorId: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  centerId: string;
  centerName: string;
  region: string;
  createdAt: string;
  updatedAt: string;
  assignedNeedId?: string;
  deliveryDate?: string;
  notes?: string;
  timeline: DonationTimelineEvent[];
}

export interface DonationTimelineEvent {
  id: string;
  status: DonationStatus;
  timestamp: string;
  notes?: string;
  userId: string;
  userName: string;
}

export type NeedPriority = 'alta' | 'media' | 'baja';
export type NeedStatus = 'activa' | 'en_proceso' | 'satisfecha' | 'cancelada';

export interface Need {
  id: string;
  code: string;
  category: DonationType;
  productName: string;
  quantityRequired: number;
  quantityReceived: number;
  unit: string;
  priority: NeedPriority;
  status: NeedStatus;
  region: string;
  centerId: string;
  centerName: string;
  address?: string;
  createdByEmail?: string;
  description?: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  verifiedBy?: string;
  matchedDonations: number;
}

export type CenterStatus = 'operativo' | 'saturado' | 'colapsado' | 'inactivo';

export interface Center {
  id: string;
  name: string;
  address: string;
  region: string;
  city: string;
  status: CenterStatus;
  capacity: number;
  currentLoad: number;
  saturationRate: number;
  contactName: string;
  contactPhone: string;
  lat: number;
  lng: number;
  donationsCount: number;
  needsCount: number;
  activeRoutes: number;
}

export type RouteStatus = 'activa' | 'completada' | 'cancelada' | 'en_espera';

export interface Route {
  id: string;
  code: string;
  vehicleId: string;
  vehicleName: string;
  driverName: string;
  driverPhone: string;
  originCenterId: string;
  originCenterName: string;
  destinationCenterId: string;
  destinationCenterName: string;
  status: RouteStatus;
  startTime?: string;
  estimatedEndTime?: string;
  actualEndTime?: string;
  stops: RouteStop[];
  cargoDescription: string;
  cargoWeight: number;
  distance: number;
  region: string;
}

export interface RouteStop {
  id: string;
  centerId: string;
  centerName: string;
  lat: number;
  lng: number;
  arrivalTime?: string;
  completed: boolean;
}

export type VehicleStatus = 'disponible' | 'en_ruta' | 'mantencion' | 'no_disponible';

export interface Vehicle {
  id: string;
  code: string;
  name: string;
  type: string;
  plate: string;
  status: VehicleStatus;
  capacity: number;
  currentLoad?: number;
  lastMaintenance?: string;
  driverName?: string;
  driverPhone?: string;
  region: string;
}

export interface DashboardKPI {
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon: string;
  color: 'cyan' | 'green' | 'amber' | 'red' | 'blue' | 'slate';
}

export interface ActivityItem {
  id: string;
  type: 'donation' | 'need' | 'logistics' | 'alert' | 'user';
  title: string;
  description: string;
  timestamp: string;
  region?: string;
  userName?: string;
}

export interface AlertItem {
  id: string;
  type: 'saturacion' | 'demora' | 'urgencia' | 'vehiculo' | 'inventario';
  severity: 'alta' | 'media' | 'baja';
  title: string;
  description: string;
  timestamp: string;
  region?: string;
  centerName?: string;
  resolved: boolean;
}

export interface RegionStatus {
  region: string;
  centersCount: number;
  activeNeeds: number;
  donationsReceived: number;
  deliveriesCompleted: number;
  avgDeliveryTime: number;
  status: 'normal' | 'alerta' | 'critica';
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  link?: string;
}
