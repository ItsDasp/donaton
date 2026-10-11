import type { User, UserRole } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1', name: 'Admin Central', email: 'admin@donaton.cl', role: 'admin',
    createdAt: '2026-01-15T10:00:00Z', lastLogin: '2026-04-29T08:00:00Z',
    permissions: [
      'dashboard:view', 'donations:view', 'donations:create', 'donations:edit', 'donations:delete',
      'needs:view', 'needs:create', 'needs:edit', 'needs:delete',
      'logistics:view', 'logistics:edit', 'users:manage', 'reports:view', 'settings:manage'
    ]
  },
  {
    id: 'u2', name: 'Juan Pérez', email: 'juan.perez@donaton.cl', role: 'operador',
    phone: '+56 9 1234 5678', region: 'Metropolitana',
    createdAt: '2026-02-01T09:00:00Z', lastLogin: '2026-04-29T07:30:00Z',
    permissions: [
      'dashboard:view', 'donations:view', 'donations:create', 'donations:edit',
      'needs:view', 'needs:create', 'needs:edit', 'logistics:view', 'logistics:edit'
    ]
  },
  {
    id: 'u3', name: 'Ana Silva', email: 'ana.silva@donaton.cl', role: 'operador',
    phone: '+56 9 2345 6789', region: 'Metropolitana',
    createdAt: '2026-02-10T10:00:00Z', lastLogin: '2026-04-29T08:15:00Z',
    permissions: [
      'dashboard:view', 'donations:view', 'donations:create', 'donations:edit',
      'needs:view', 'needs:create', 'needs:edit', 'logistics:view', 'logistics:edit'
    ]
  },
  {
    id: 'u4', name: 'Carlos Ruiz', email: 'carlos.ruiz@donaton.cl', role: 'voluntario',
    phone: '+56 9 1111 2222', region: 'Metropolitana',
    createdAt: '2026-03-01T11:00:00Z', lastLogin: '2026-04-28T18:00:00Z',
    permissions: ['dashboard:view', 'donations:view', 'logistics:view']
  },
  {
    id: 'u5', name: 'Pedro Morales', email: 'pedro.morales@donaton.cl', role: 'operador',
    phone: '+56 9 3456 7890', region: 'Biobío',
    createdAt: '2026-02-15T09:00:00Z', lastLogin: '2026-04-29T06:00:00Z',
    permissions: [
      'dashboard:view', 'donations:view', 'donations:create', 'donations:edit',
      'needs:view', 'needs:create', 'needs:edit', 'logistics:view', 'logistics:edit'
    ]
  },
  {
    id: 'u6', name: 'Laura Díaz', email: 'laura.diaz@donaton.cl', role: 'coordinador',
    phone: '+56 9 4567 8901', region: 'Biobío',
    createdAt: '2026-01-20T08:00:00Z', lastLogin: '2026-04-29T09:00:00Z',
    permissions: [
      'dashboard:view', 'donations:view', 'needs:view', 'needs:create', 'needs:edit',
      'logistics:view', 'logistics:edit', 'reports:view'
    ]
  },
  {
    id: 'u7', name: 'Diego Fuentes', email: 'diego.fuentes@donaton.cl', role: 'operador',
    phone: '+56 9 5678 9012', region: 'Valparaíso',
    createdAt: '2026-03-05T10:00:00Z', lastLogin: '2026-04-28T20:00:00Z',
    permissions: [
      'dashboard:view', 'donations:view', 'donations:create', 'donations:edit',
      'needs:view', 'needs:create', 'needs:edit', 'logistics:view', 'logistics:edit'
    ]
  },
  {
    id: 'u8', name: 'Francisca Álvarez', email: 'fran.alvarez@donaton.cl', role: 'coordinador',
    phone: '+56 9 6789 0123', region: 'Araucanía',
    createdAt: '2026-02-20T09:00:00Z', lastLogin: '2026-04-29T07:00:00Z',
    permissions: [
      'dashboard:view', 'donations:view', 'needs:view', 'needs:create', 'needs:edit',
      'logistics:view', 'logistics:edit', 'reports:view'
    ]
  },
  {
    id: 'u9', name: 'Miguel Torres', email: 'miguel.torres@donaton.cl', role: 'operador',
    phone: '+56 9 7890 1234', region: 'Araucanía',
    createdAt: '2026-03-10T08:00:00Z', lastLogin: '2026-04-29T08:30:00Z',
    permissions: [
      'dashboard:view', 'donations:view', 'donations:create', 'donations:edit',
      'needs:view', 'needs:create', 'needs:edit', 'logistics:view', 'logistics:edit'
    ]
  },
  {
    id: 'u10', name: 'Roberto Soto', email: 'roberto.soto@donaton.cl', role: 'voluntario',
    phone: '+56 9 2222 3333', region: 'Araucanía',
    createdAt: '2026-03-15T10:00:00Z', lastLogin: '2026-04-28T19:00:00Z',
    permissions: ['dashboard:view', 'donations:view', 'logistics:view']
  },
  {
    id: 'u11', name: 'Sandra Vega', email: 'sandra.vega@donaton.cl', role: 'operador',
    phone: '+56 9 6666 7777', region: 'Antofagasta',
    createdAt: '2026-03-20T09:00:00Z', lastLogin: '2026-04-29T11:00:00Z',
    permissions: [
      'dashboard:view', 'donations:view', 'donations:create', 'donations:edit',
      'needs:view', 'needs:create', 'needs:edit', 'logistics:view', 'logistics:edit'
    ]
  },
  {
    id: 'u12', name: 'Héctor Campos', email: 'hector.campos@donaton.cl', role: 'voluntario',
    phone: '+56 9 3333 4444', region: 'Biobío',
    createdAt: '2026-03-25T10:00:00Z', lastLogin: '2026-04-29T06:30:00Z',
    permissions: ['dashboard:view', 'donations:view', 'logistics:view']
  },
  {
    id: 'u13', name: 'Patricia López', email: 'patricia.lopez@donaton.cl', role: 'operador',
    phone: '+56 9 7890 1234', region: 'Coquimbo',
    createdAt: '2026-04-01T09:00:00Z', lastLogin: '2026-04-29T10:00:00Z',
    permissions: [
      'dashboard:view', 'donations:view', 'donations:create', 'donations:edit',
      'needs:view', 'needs:create', 'needs:edit', 'logistics:view', 'logistics:edit'
    ]
  },
  {
    id: 'u14', name: 'Andrés Navarro', email: 'andres.navarro@donaton.cl', role: 'coordinador',
    phone: '+56 9 5555 6666', region: 'Coquimbo',
    createdAt: '2026-04-05T08:00:00Z', lastLogin: '2026-04-29T07:45:00Z',
    permissions: [
      'dashboard:view', 'donations:view', 'needs:view', 'needs:create', 'needs:edit',
      'logistics:view', 'logistics:edit', 'reports:view'
    ]
  }
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  operador: 'Operador',
  coordinador: 'Coordinador',
  donante: 'Donante',
  voluntario: 'Voluntario'
};
