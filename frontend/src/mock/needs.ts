import type { Need, NeedPriority, NeedStatus } from '../types';

export const MOCK_NEEDS: Need[] = [
  {
    id: '1', code: 'NEC-0041', category: 'agua', productName: 'Agua embotellada 1.5L',
    quantityRequired: 5000, quantityReceived: 3200, unit: 'litros',
    priority: 'alta', status: 'activa', region: 'Metropolitana',
    centerId: 'c2', centerName: 'Centro Acopio Providencia',
    description: 'Urgente por corte de suministro en sector oriente',
    deadline: '2026-05-01T23:59:00Z', createdAt: '2026-04-27T10:00:00Z',
    updatedAt: '2026-04-29T16:00:00Z', verifiedBy: 'Ana Silva',
    matchedDonations: 3
  },
  {
    id: '2', code: 'NEC-0042', category: 'alimentos', productName: 'Leche en polvo',
    quantityRequired: 800, quantityReceived: 400, unit: 'kg',
    priority: 'alta', status: 'activa', region: 'Metropolitana',
    centerId: 'c1', centerName: 'Centro Acopio Ñuñoa',
    description: 'Para familias con lactantes',
    deadline: '2026-05-02T23:59:00Z', createdAt: '2026-04-28T09:00:00Z',
    updatedAt: '2026-04-29T15:00:00Z', verifiedBy: 'Juan Pérez',
    matchedDonations: 1
  },
  {
    id: '3', code: 'NEC-0043', category: 'medicamentos', productName: 'Paracetamol 500mg',
    quantityRequired: 300, quantityReceived: 200, unit: 'cajas',
    priority: 'alta', status: 'en_proceso', region: 'Biobío',
    centerId: 'c3', centerName: 'Centro Acopio Concepción',
    description: 'Medicamentos básicos para primeros auxilios',
    deadline: '2026-04-30T23:59:00Z', createdAt: '2026-04-26T14:00:00Z',
    updatedAt: '2026-04-29T11:00:00Z', verifiedBy: 'Laura Díaz',
    matchedDonations: 2
  },
  {
    id: '4', code: 'NEC-0044', category: 'ropa', productName: 'Ropa de abrigo infantil',
    quantityRequired: 500, quantityReceived: 350, unit: 'piezas',
    priority: 'media', status: 'activa', region: 'Araucanía',
    centerId: 'c5', centerName: 'Centro Acopio Temuco',
    description: 'Preparación para frente de mal tiempo',
    deadline: '2026-05-05T23:59:00Z', createdAt: '2026-04-25T11:00:00Z',
    updatedAt: '2026-04-28T10:00:00Z', verifiedBy: 'Francisca Álvarez',
    matchedDonations: 2
  },
  {
    id: '5', code: 'NEC-0045', category: 'herramientas', productName: 'Palas',
    quantityRequired: 150, quantityReceived: 80, unit: 'unidades',
    priority: 'media', status: 'activa', region: 'Valparaíso',
    centerId: 'c4', centerName: 'Centro Acopio Valparaíso',
    description: 'Para remoción de escombros',
    createdAt: '2026-04-27T08:00:00Z',
    updatedAt: '2026-04-29T09:00:00Z', matchedDonations: 1
  },
  {
    id: '6', code: 'NEC-0046', category: 'medicamentos', productName: 'Suero fisiológico',
    quantityRequired: 1000, quantityReceived: 500, unit: 'unidades',
    priority: 'alta', status: 'en_proceso', region: 'Biobío',
    centerId: 'c3', centerName: 'Centro Acopio Concepción',
    description: 'Hidratación oral',
    deadline: '2026-04-30T23:59:00Z', createdAt: '2026-04-24T10:00:00Z',
    updatedAt: '2026-04-26T14:00:00Z', verifiedBy: 'Pedro Morales',
    matchedDonations: 1
  },
  {
    id: '7', code: 'NEC-0047', category: 'higiene', productName: 'Kits higiene personal',
    quantityRequired: 1200, quantityReceived: 600, unit: 'kits',
    priority: 'media', status: 'satisfecha', region: 'Araucanía',
    centerId: 'c5', centerName: 'Centro Acopio Temuco',
    description: 'Jabón, shampoo, cepillo dental, pasta',
    deadline: '2026-04-28T23:59:00Z', createdAt: '2026-04-22T09:00:00Z',
    updatedAt: '2026-04-27T13:00:00Z', verifiedBy: 'Miguel Torres',
    matchedDonations: 2
  },
  {
    id: '8', code: 'NEC-0048', category: 'alimentos', productName: 'Arroz',
    quantityRequired: 2000, quantityReceived: 1800, unit: 'kg',
    priority: 'media', status: 'en_proceso', region: 'Metropolitana',
    centerId: 'c1', centerName: 'Centro Acopio Ñuñoa',
    description: 'Grano básico',
    createdAt: '2026-04-26T07:00:00Z',
    updatedAt: '2026-04-29T14:00:00Z', matchedDonations: 3
  },
  {
    id: '9', code: 'NEC-0049', category: 'agua', productName: 'Bidones 20L',
    quantityRequired: 1000, quantityReceived: 300, unit: 'bidones',
    priority: 'alta', status: 'activa', region: 'Antofagasta',
    centerId: 'c6', centerName: 'Centro Acopio Antofagasta',
    description: 'Urgente desierto de Atacama',
    deadline: '2026-04-30T23:59:00Z', createdAt: '2026-04-28T12:00:00Z',
    updatedAt: '2026-04-29T11:00:00Z', verifiedBy: 'Sandra Vega',
    matchedDonations: 1
  },
  {
    id: '10', code: 'NEC-0050', category: 'otros', productName: 'Generadores eléctricos',
    quantityRequired: 50, quantityReceived: 25, unit: 'unidades',
    priority: 'alta', status: 'en_proceso', region: 'Coquimbo',
    centerId: 'c7', centerName: 'Centro Acopio La Serena',
    description: 'Cortes eléctricos prolongados',
    deadline: '2026-05-03T23:59:00Z', createdAt: '2026-04-25T08:00:00Z',
    updatedAt: '2026-04-29T09:00:00Z', verifiedBy: 'Andrés Navarro',
    matchedDonations: 1
  },
  {
    id: '11', code: 'NEC-0051', category: 'alimentos', productName: 'Fideos',
    quantityRequired: 1500, quantityReceived: 800, unit: 'kg',
    priority: 'baja', status: 'activa', region: 'Metropolitana',
    centerId: 'c2', centerName: 'Centro Acopio Providencia',
    description: 'Pasta seca',
    createdAt: '2026-04-29T10:00:00Z',
    updatedAt: '2026-04-29T16:00:00Z', matchedDonations: 2
  },
  {
    id: '12', code: 'NEC-0052', category: 'ropa', productName: 'Zapatos deportivos',
    quantityRequired: 200, quantityReceived: 120, unit: 'pares',
    priority: 'baja', status: 'activa', region: 'Metropolitana',
    centerId: 'c2', centerName: 'Centro Acopio Providencia',
    description: 'Para evacuados',
    createdAt: '2026-04-28T08:00:00Z',
    updatedAt: '2026-04-29T08:00:00Z', matchedDonations: 1
  }
];

export const NEED_PRIORITY_LABELS: Record<NeedPriority, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja'
};

export const NEED_STATUS_LABELS: Record<NeedStatus, string> = {
  activa: 'Activa',
  en_proceso: 'En proceso',
  satisfecha: 'Satisfecha',
  cancelada: 'Cancelada'
};
