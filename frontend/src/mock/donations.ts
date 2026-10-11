import type { Donation, DonationType, DonationStatus } from '../types';

export const MOCK_DONATIONS: Donation[] = [
  {
    id: '1', code: 'DON-1024', type: 'alimentos', description: 'Arroz en bolsa de 1kg', quantity: 500, unit: 'kg',
    status: 'entregada', donorId: 'd1', donorName: 'María González', donorEmail: 'maria.g@email.com',
    centerId: 'c1', centerName: 'Centro Acopio Ñuñoa', region: 'Metropolitana',
    createdAt: '2026-04-28T08:30:00Z', updatedAt: '2026-04-29T14:20:00Z',
    assignedNeedId: 'n1', deliveryDate: '2026-04-29T14:20:00Z',
    timeline: [
      { id: 't1', status: 'recibida', timestamp: '2026-04-28T08:30:00Z', userId: 'u2', userName: 'Juan Pérez' },
      { id: 't2', status: 'en_inventario', timestamp: '2026-04-28T10:15:00Z', userId: 'u2', userName: 'Juan Pérez' },
      { id: 't3', status: 'asignada', timestamp: '2026-04-28T12:00:00Z', userId: 'u3', userName: 'Ana Silva' },
      { id: 't4', status: 'en_transito', timestamp: '2026-04-29T09:00:00Z', userId: 'u4', userName: 'Carlos Ruiz' },
      { id: 't5', status: 'entregada', timestamp: '2026-04-29T14:20:00Z', userId: 'u4', userName: 'Carlos Ruiz' }
    ]
  },
  {
    id: '2', code: 'DON-1025', type: 'agua', description: 'Agua embotellada 1.5L', quantity: 1200, unit: 'litros',
    status: 'en_transito', donorId: 'd2', donorName: 'Empresas del Sur S.A.', donorEmail: 'contacto@edsur.cl', donorPhone: '+56 2 2345 6789',
    centerId: 'c2', centerName: 'Centro Acopio Providencia', region: 'Metropolitana',
    createdAt: '2026-04-29T06:00:00Z', updatedAt: '2026-04-29T16:45:00Z',
    assignedNeedId: 'n2',
    timeline: [
      { id: 't6', status: 'recibida', timestamp: '2026-04-29T06:00:00Z', userId: 'u2', userName: 'Juan Pérez' },
      { id: 't7', status: 'en_inventario', timestamp: '2026-04-29T08:30:00Z', userId: 'u2', userName: 'Juan Pérez' },
      { id: 't8', status: 'asignada', timestamp: '2026-04-29T12:00:00Z', userId: 'u3', userName: 'Ana Silva' },
      { id: 't9', status: 'en_transito', timestamp: '2026-04-29T16:45:00Z', userId: 'u4', userName: 'Carlos Ruiz' }
    ]
  },
  {
    id: '3', code: 'DON-1026', type: 'medicamentos', description: 'Paracetamol 500mg cajas', quantity: 200, unit: 'cajas',
    status: 'asignada', donorId: 'd3', donorName: 'Farmacias Cruz Verde', donorEmail: 'donaciones@cruzverde.cl',
    centerId: 'c3', centerName: 'Centro Acopio Concepción', region: 'Biobío',
    createdAt: '2026-04-27T14:00:00Z', updatedAt: '2026-04-29T11:00:00Z',
    assignedNeedId: 'n5',
    timeline: [
      { id: 't10', status: 'recibida', timestamp: '2026-04-27T14:00:00Z', userId: 'u5', userName: 'Pedro Morales' },
      { id: 't11', status: 'en_inventario', timestamp: '2026-04-27T16:30:00Z', userId: 'u5', userName: 'Pedro Morales' },
      { id: 't12', status: 'asignada', timestamp: '2026-04-29T11:00:00Z', userId: 'u6', userName: 'Laura Díaz' }
    ]
  },
  {
    id: '4', code: 'DON-1027', type: 'ropa', description: 'Ropa de abrigo mixta adulto', quantity: 350, unit: 'piezas',
    status: 'recibida', donorId: 'd4', donorName: 'Camila Rojas', donorEmail: 'camila.r@email.com', donorPhone: '+56 9 8765 4321',
    centerId: 'c1', centerName: 'Centro Acopio Ñuñoa', region: 'Metropolitana',
    createdAt: '2026-04-29T10:00:00Z', updatedAt: '2026-04-29T10:30:00Z',
    timeline: [
      { id: 't13', status: 'recibida', timestamp: '2026-04-29T10:00:00Z', userId: 'u2', userName: 'Juan Pérez' }
    ]
  },
  {
    id: '5', code: 'DON-1028', type: 'herramientas', description: 'Palas y picotas', quantity: 80, unit: 'unidades',
    status: 'en_inventario', donorId: 'd5', donorName: 'Constructora Delpac', donorEmail: 'logistica@delpac.cl',
    centerId: 'c4', centerName: 'Centro Acopio Valparaíso', region: 'Valparaíso',
    createdAt: '2026-04-26T09:00:00Z', updatedAt: '2026-04-28T11:00:00Z',
    timeline: [
      { id: 't14', status: 'recibida', timestamp: '2026-04-26T09:00:00Z', userId: 'u7', userName: 'Diego Fuentes' },
      { id: 't15', status: 'en_inventario', timestamp: '2026-04-28T11:00:00Z', userId: 'u7', userName: 'Diego Fuentes' }
    ]
  },
  {
    id: '6', code: 'DON-1029', type: 'higiene', description: 'Kits de higiene personal', quantity: 600, unit: 'kits',
    status: 'entregada', donorId: 'd6', donorName: 'Unilever Chile', donorEmail: 'rrhh@unilever.cl',
    centerId: 'c5', centerName: 'Centro Acopio Temuco', region: 'Araucanía',
    createdAt: '2026-04-25T07:30:00Z', updatedAt: '2026-04-27T13:00:00Z',
    assignedNeedId: 'n8', deliveryDate: '2026-04-27T13:00:00Z',
    timeline: [
      { id: 't16', status: 'recibida', timestamp: '2026-04-25T07:30:00Z', userId: 'u8', userName: 'Francisca Álvarez' },
      { id: 't17', status: 'en_inventario', timestamp: '2026-04-25T10:00:00Z', userId: 'u8', userName: 'Francisca Álvarez' },
      { id: 't18', status: 'asignada', timestamp: '2026-04-26T09:00:00Z', userId: 'u9', userName: 'Miguel Torres' },
      { id: 't19', status: 'en_transito', timestamp: '2026-04-27T08:00:00Z', userId: 'u10', userName: 'Roberto Soto' },
      { id: 't20', status: 'entregada', timestamp: '2026-04-27T13:00:00Z', userId: 'u10', userName: 'Roberto Soto' }
    ]
  },
  {
    id: '7', code: 'DON-1030', type: 'alimentos', description: 'Leche en polvo bolsa 900g', quantity: 400, unit: 'kg',
    status: 'en_transito', donorId: 'd7', donorName: 'Nestlé Chile', donorEmail: 'comunicaciones@nestle.cl',
    centerId: 'c2', centerName: 'Centro Acopio Providencia', region: 'Metropolitana',
    createdAt: '2026-04-28T05:00:00Z', updatedAt: '2026-04-29T15:30:00Z',
    assignedNeedId: 'n3',
    timeline: [
      { id: 't21', status: 'recibida', timestamp: '2026-04-28T05:00:00Z', userId: 'u2', userName: 'Juan Pérez' },
      { id: 't22', status: 'en_inventario', timestamp: '2026-04-28T07:00:00Z', userId: 'u2', userName: 'Juan Pérez' },
      { id: 't23', status: 'asignada', timestamp: '2026-04-29T10:00:00Z', userId: 'u3', userName: 'Ana Silva' },
      { id: 't24', status: 'en_transito', timestamp: '2026-04-29T15:30:00Z', userId: 'u4', userName: 'Carlos Ruiz' }
    ]
  },
  {
    id: '8', code: 'DON-1031', type: 'agua', description: 'Bidones 20L', quantity: 300, unit: 'bidones',
    status: 'recibida', donorId: 'd8', donorName: 'José Martínez', donorEmail: 'jose.m@email.com',
    centerId: 'c6', centerName: 'Centro Acopio Antofagasta', region: 'Antofagasta',
    createdAt: '2026-04-29T11:00:00Z', updatedAt: '2026-04-29T11:30:00Z',
    timeline: [
      { id: 't25', status: 'recibida', timestamp: '2026-04-29T11:00:00Z', userId: 'u11', userName: 'Sandra Vega' }
    ]
  },
  {
    id: '9', code: 'DON-1032', type: 'medicamentos', description: 'Suero fisiológico 500ml', quantity: 500, unit: 'unidades',
    status: 'entregada', donorId: 'd9', donorName: 'Laboratorio Chile', donorEmail: 'donaciones@labchile.cl',
    centerId: 'c3', centerName: 'Centro Acopio Concepción', region: 'Biobío',
    createdAt: '2026-04-24T08:00:00Z', updatedAt: '2026-04-26T12:00:00Z',
    assignedNeedId: 'n6', deliveryDate: '2026-04-26T12:00:00Z',
    timeline: [
      { id: 't26', status: 'recibida', timestamp: '2026-04-24T08:00:00Z', userId: 'u5', userName: 'Pedro Morales' },
      { id: 't27', status: 'en_inventario', timestamp: '2026-04-24T10:00:00Z', userId: 'u5', userName: 'Pedro Morales' },
      { id: 't28', status: 'asignada', timestamp: '2026-04-25T09:00:00Z', userId: 'u6', userName: 'Laura Díaz' },
      { id: 't29', status: 'en_transito', timestamp: '2026-04-26T07:00:00Z', userId: 'u12', userName: 'Héctor Campos' },
      { id: 't30', status: 'entregada', timestamp: '2026-04-26T12:00:00Z', userId: 'u12', userName: 'Héctor Campos' }
    ]
  },
  {
    id: '10', code: 'DON-1033', type: 'otros', description: 'Generadores eléctricos portátiles', quantity: 25, unit: 'unidades',
    status: 'asignada', donorId: 'd10', donorName: 'Ferretería El Martillo', donorEmail: 'ventas@elmartillo.cl',
    centerId: 'c7', centerName: 'Centro Acopio La Serena', region: 'Coquimbo',
    createdAt: '2026-04-27T13:00:00Z', updatedAt: '2026-04-29T09:00:00Z',
    assignedNeedId: 'n10',
    timeline: [
      { id: 't31', status: 'recibida', timestamp: '2026-04-27T13:00:00Z', userId: 'u13', userName: 'Patricia López' },
      { id: 't32', status: 'en_inventario', timestamp: '2026-04-27T15:00:00Z', userId: 'u13', userName: 'Patricia López' },
      { id: 't33', status: 'asignada', timestamp: '2026-04-29T09:00:00Z', userId: 'u14', userName: 'Andrés Navarro' }
    ]
  },
  {
    id: '11', code: 'DON-1034', type: 'alimentos', description: 'Fideos cabello de ángel', quantity: 800, unit: 'kg',
    status: 'recibida', donorId: 'd11', donorName: 'Doña Juanita Ltda.', donorEmail: 'juanita@correo.cl',
    centerId: 'c1', centerName: 'Centro Acopio Ñuñoa', region: 'Metropolitana',
    createdAt: '2026-04-29T12:00:00Z', updatedAt: '2026-04-29T12:30:00Z',
    timeline: [
      { id: 't34', status: 'recibida', timestamp: '2026-04-29T12:00:00Z', userId: 'u2', userName: 'Juan Pérez' }
    ]
  },
  {
    id: '12', code: 'DON-1035', type: 'ropa', description: 'Zapatos deportivos niños', quantity: 120, unit: 'pares',
    status: 'en_inventario', donorId: 'd12', donorName: 'Tiendas Paris', donorEmail: 'sustentabilidad@paris.cl',
    centerId: 'c2', centerName: 'Centro Acopio Providencia', region: 'Metropolitana',
    createdAt: '2026-04-28T09:30:00Z', updatedAt: '2026-04-29T08:00:00Z',
    timeline: [
      { id: 't35', status: 'recibida', timestamp: '2026-04-28T09:30:00Z', userId: 'u2', userName: 'Juan Pérez' },
      { id: 't36', status: 'en_inventario', timestamp: '2026-04-29T08:00:00Z', userId: 'u2', userName: 'Juan Pérez' }
    ]
  }
];

export const DONATION_TYPE_LABELS: Record<DonationType, string> = {
  alimentos: 'Alimentos',
  agua: 'Agua',
  ropa: 'Ropa',
  medicamentos: 'Medicamentos',
  herramientas: 'Herramientas',
  higiene: 'Higiene',
  otros: 'Otros'
};

export const DONATION_STATUS_LABELS: Record<DonationStatus, string> = {
  recibida: 'Recibida',
  en_inventario: 'En inventario',
  asignada: 'Asignada',
  en_transito: 'En tránsito',
  entregada: 'Entregada'
};
