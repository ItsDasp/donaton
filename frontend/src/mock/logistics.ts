import type { Center, Vehicle, Route } from '../types';

export const MOCK_CENTERS: Center[] = [
  {
    id: 'c1', name: 'Centro Acopio Ñuñoa', address: 'Av. Irarrázaval 3850, Ñuñoa',
    region: 'Metropolitana', city: 'Santiago', status: 'saturado',
    capacity: 10000, currentLoad: 9200, saturationRate: 92,
    contactName: 'Juan Pérez', contactPhone: '+56 9 1234 5678',
    lat: -33.456, lng: -70.593, donationsCount: 340, needsCount: 12, activeRoutes: 4
  },
  {
    id: 'c2', name: 'Centro Acopio Providencia', address: 'Av. Providencia 1234',
    region: 'Metropolitana', city: 'Santiago', status: 'operativo',
    capacity: 8000, currentLoad: 5600, saturationRate: 70,
    contactName: 'Ana Silva', contactPhone: '+56 9 2345 6789',
    lat: -33.431, lng: -70.614, donationsCount: 280, needsCount: 15, activeRoutes: 3
  },
  {
    id: 'c3', name: 'Centro Acopio Concepción', address: 'Calle Chacabuco 890',
    region: 'Biobío', city: 'Concepción', status: 'operativo',
    capacity: 12000, currentLoad: 8400, saturationRate: 70,
    contactName: 'Laura Díaz', contactPhone: '+56 9 3456 7890',
    lat: -36.828, lng: -73.053, donationsCount: 420, needsCount: 18, activeRoutes: 5
  },
  {
    id: 'c4', name: 'Centro Acopio Valparaíso', address: 'Av. Argentina 2345',
    region: 'Valparaíso', city: 'Valparaíso', status: 'saturado',
    capacity: 6000, currentLoad: 5700, saturationRate: 95,
    contactName: 'Diego Fuentes', contactPhone: '+56 9 4567 8901',
    lat: -33.047, lng: -71.613, donationsCount: 190, needsCount: 9, activeRoutes: 2
  },
  {
    id: 'c5', name: 'Centro Acopio Temuco', address: 'Av. Alemania 456',
    region: 'Araucanía', city: 'Temuco', status: 'operativo',
    capacity: 7000, currentLoad: 4900, saturationRate: 70,
    contactName: 'Francisca Álvarez', contactPhone: '+56 9 5678 9012',
    lat: -38.739, lng: -72.590, donationsCount: 210, needsCount: 8, activeRoutes: 3
  },
  {
    id: 'c6', name: 'Centro Acopio Antofagasta', address: 'Av. Argentina 789',
    region: 'Antofagasta', city: 'Antofagasta', status: 'operativo',
    capacity: 5000, currentLoad: 2100, saturationRate: 42,
    contactName: 'Sandra Vega', contactPhone: '+56 9 6789 0123',
    lat: -23.650, lng: -70.397, donationsCount: 85, needsCount: 6, activeRoutes: 1
  },
  {
    id: 'c7', name: 'Centro Acopio La Serena', address: 'Av. El Santo 567',
    region: 'Coquimbo', city: 'La Serena', status: 'colapsado',
    capacity: 4000, currentLoad: 4000, saturationRate: 100,
    contactName: 'Patricia López', contactPhone: '+56 9 7890 1234',
    lat: -29.902, lng: -71.252, donationsCount: 95, needsCount: 5, activeRoutes: 0
  }
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v1', code: 'V-001', name: 'Camión F350', type: 'Camión',
    plate: 'BB-ZX-12', status: 'en_ruta', capacity: 5000,
    currentLoad: 4200, lastMaintenance: '2026-04-15', driverName: 'Carlos Ruiz',
    driverPhone: '+56 9 1111 2222', region: 'Metropolitana'
  },
  {
    id: 'v2', code: 'V-002', name: 'Furgón Sprinter', type: 'Furgón',
    plate: 'CC-YW-34', status: 'disponible', capacity: 2000,
    lastMaintenance: '2026-04-20', driverName: 'Roberto Soto',
    driverPhone: '+56 9 2222 3333', region: 'Araucanía'
  },
  {
    id: 'v3', code: 'V-003', name: 'Pickup Hilux', type: 'Pickup',
    plate: 'DD-VU-56', status: 'en_ruta', capacity: 1000,
    currentLoad: 850, lastMaintenance: '2026-04-10', driverName: 'Héctor Campos',
    driverPhone: '+56 9 3333 4444', region: 'Biobío'
  },
  {
    id: 'v4', code: 'V-004', name: 'Camión Volquete', type: 'Camión',
    plate: 'EE-TS-78', status: 'mantencion', capacity: 8000,
    lastMaintenance: '2026-04-28', driverName: 'Miguel Torres',
    driverPhone: '+56 9 4444 5555', region: 'Araucanía'
  },
  {
    id: 'v5', code: 'V-005', name: 'Furgón Daily', type: 'Furgón',
    plate: 'FF-RQ-90', status: 'en_ruta', capacity: 1500,
    currentLoad: 1200, lastMaintenance: '2026-04-18', driverName: 'Andrés Navarro',
    driverPhone: '+56 9 5555 6666', region: 'Coquimbo'
  },
  {
    id: 'v6', code: 'V-006', name: 'Camión Scania', type: 'Camión',
    plate: 'GG-PO-12', status: 'no_disponible', capacity: 12000,
    lastMaintenance: '2026-04-25', region: 'Valparaíso'
  },
  {
    id: 'v7', code: 'V-007', name: 'Pickup Nissan', type: 'Pickup',
    plate: 'HH-NM-34', status: 'disponible', capacity: 800,
    lastMaintenance: '2026-04-22', driverName: 'Sandra Vega',
    driverPhone: '+56 9 6666 7777', region: 'Antofagasta'
  }
];

export const MOCK_ROUTES: Route[] = [
  {
    id: 'r1', code: 'RUT-0089', vehicleId: 'v1', vehicleName: 'Camión F350',
    driverName: 'Carlos Ruiz', driverPhone: '+56 9 1111 2222',
    originCenterId: 'c1', originCenterName: 'Centro Acopio Ñuñoa',
    destinationCenterId: 'c2', destinationCenterName: 'Centro Acopio Providencia',
    status: 'activa', startTime: '2026-04-29T16:45:00Z', estimatedEndTime: '2026-04-29T18:30:00Z',
    cargoDescription: 'Agua embotellada, leche en polvo', cargoWeight: 1800, distance: 8,
    region: 'Metropolitana',
    stops: [
      { id: 's1', centerId: 'c1', centerName: 'Centro Acopio Ñuñoa', lat: -33.456, lng: -70.593, completed: true },
      { id: 's2', centerId: 'c2', centerName: 'Centro Acopio Providencia', lat: -33.431, lng: -70.614, completed: false }
    ]
  },
  {
    id: 'r2', code: 'RUT-0090', vehicleId: 'v3', vehicleName: 'Pickup Hilux',
    driverName: 'Héctor Campos', driverPhone: '+56 9 3333 4444',
    originCenterId: 'c3', originCenterName: 'Centro Acopio Concepción',
    destinationCenterId: 'c5', destinationCenterName: 'Centro Acopio Temuco',
    status: 'activa', startTime: '2026-04-29T14:00:00Z', estimatedEndTime: '2026-04-29T20:00:00Z',
    cargoDescription: 'Medicamentos, suero fisiológico', cargoWeight: 350, distance: 320,
    region: 'Biobío/Araucanía',
    stops: [
      { id: 's3', centerId: 'c3', centerName: 'Centro Acopio Concepción', lat: -36.828, lng: -73.053, completed: true },
      { id: 's4', centerId: 'c5', centerName: 'Centro Acopio Temuco', lat: -38.739, lng: -72.590, completed: false }
    ]
  },
  {
    id: 'r3', code: 'RUT-0091', vehicleId: 'v5', vehicleName: 'Furgón Daily',
    driverName: 'Andrés Navarro', driverPhone: '+56 9 5555 6666',
    originCenterId: 'c7', originCenterName: 'Centro Acopio La Serena',
    destinationCenterId: 'c6', destinationCenterName: 'Centro Acopio Antofagasta',
    status: 'completada', startTime: '2026-04-28T06:00:00Z', estimatedEndTime: '2026-04-28T18:00:00Z',
    actualEndTime: '2026-04-28T17:30:00Z',
    cargoDescription: 'Generadores eléctricos', cargoWeight: 2000, distance: 420,
    region: 'Coquimbo/Antofagasta',
    stops: [
      { id: 's5', centerId: 'c7', centerName: 'Centro Acopio La Serena', lat: -29.902, lng: -71.252, completed: true, arrivalTime: '2026-04-28T06:00:00Z' },
      { id: 's6', centerId: 'c6', centerName: 'Centro Acopio Antofagasta', lat: -23.650, lng: -70.397, completed: true, arrivalTime: '2026-04-28T17:30:00Z' }
    ]
  },
  {
    id: 'r4', code: 'RUT-0092', vehicleId: 'v1', vehicleName: 'Camión F350',
    driverName: 'Carlos Ruiz', driverPhone: '+56 9 1111 2222',
    originCenterId: 'c2', originCenterName: 'Centro Acopio Providencia',
    destinationCenterId: 'c1', destinationCenterName: 'Centro Acopio Ñuñoa',
    status: 'activa', startTime: '2026-04-29T17:00:00Z', estimatedEndTime: '2026-04-29T18:00:00Z',
    cargoDescription: 'Ropa de abrigo, zapatos', cargoWeight: 600, distance: 5,
    region: 'Metropolitana',
    stops: [
      { id: 's7', centerId: 'c2', centerName: 'Centro Acopio Providencia', lat: -33.431, lng: -70.614, completed: true },
      { id: 's8', centerId: 'c1', centerName: 'Centro Acopio Ñuñoa', lat: -33.456, lng: -70.593, completed: false }
    ]
  },
  {
    id: 'r5', code: 'RUT-0093', vehicleId: 'v2', vehicleName: 'Furgón Sprinter',
    driverName: 'Roberto Soto', driverPhone: '+56 9 2222 3333',
    originCenterId: 'c5', originCenterName: 'Centro Acopio Temuco',
    destinationCenterId: 'c3', destinationCenterName: 'Centro Acopio Concepción',
    status: 'en_espera',
    cargoDescription: 'Higiene kits', cargoWeight: 400, distance: 320,
    region: 'Araucanía/Biobío',
    stops: [
      { id: 's9', centerId: 'c5', centerName: 'Centro Acopio Temuco', lat: -38.739, lng: -72.590, completed: false },
      { id: 's10', centerId: 'c3', centerName: 'Centro Acopio Concepción', lat: -36.828, lng: -73.053, completed: false }
    ]
  }
];
