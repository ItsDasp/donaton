import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { needService } from '../services/needService';
import { useNeeds, useCenters } from '../hooks/useQueries';
import { useAuthStore } from '../store/authStore';
import { 
  Search, Plus, Eye, AlertTriangle, X,
  CheckCircle2, Clock
} from 'lucide-react';
import type { Need, NeedPriority, NeedStatus } from '../types';
import { NEED_PRIORITY_LABELS, NEED_STATUS_LABELS } from '../mock/needs';
import { DONATION_TYPE_LABELS } from '../mock/donations';
import { STREET_SUGGESTIONS } from '../mock/streets';

type CreateForm = {
  productName: string;
  category: string;
  quantityRequired: number;
  unit: string;
  priority: NeedPriority;
  region: string;
  centerId: string;
  centerName: string;
  address: string;
  description: string;
  deadline: string;
};
const REGION_CENTROIDS: { name: string; lat: number; lng: number }[] = [
  { name: 'Arica y Parinacota', lat: -18.4783, lng: -70.3126 },
  { name: 'Tarapacá', lat: -20.2120, lng: -69.6614 },
  { name: 'Antofagasta', lat: -23.6500, lng: -70.3970 },
  { name: 'Atacama', lat: -27.3668, lng: -70.3319 },
  { name: 'Coquimbo', lat: -29.9537, lng: -71.3432 },
  { name: 'Valparaíso', lat: -33.0472, lng: -71.6127 },
  { name: 'Metropolitana', lat: -33.4489, lng: -70.6693 },
  { name: "O'Higgins", lat: -34.1685, lng: -70.7396 },
  { name: 'Maule', lat: -35.4264, lng: -71.6554 },
  { name: 'Ñuble', lat: -36.6060, lng: -72.1034 },
  { name: 'Biobío', lat: -36.8201, lng: -73.0444 },
  { name: 'Araucanía', lat: -38.7359, lng: -72.5904 },
  { name: 'Los Ríos', lat: -39.8161, lng: -73.2459 },
  { name: 'Los Lagos', lat: -41.4696, lng: -72.9425 },
  { name: 'Aysén', lat: -45.5740, lng: -72.0653 },
  { name: 'Magallanes', lat: -53.1638, lng: -70.9171 }
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => v * Math.PI / 180;
  const R = 6371; 
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function AddressInput({ region, address, setAddress }: { region: string; address: string; setAddress: (val: string) => void }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAddressChange = (val: string) => {
    setAddress(val);
    if (!val || !region) {
      setSuggestions([]);
      return;
    }
    const regionSuggestions = STREET_SUGGESTIONS[region] || [];
    const filtered = regionSuggestions.filter(s => s.toLowerCase().includes(val.toLowerCase()));
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Ej: Calle Principal 123, Ñuñoa"
        value={address}
        onChange={e => handleAddressChange(e.target.value)}
        onFocus={() => address && suggestions.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        className="w-full px-3 py-2 rounded-sm border border-border bg-background text-sm"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-sm shadow-lg">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setAddress(s);
                setShowSuggestions(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-secondary text-sm text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


function CentersSelect({ form, setForm }: { form: CreateForm; setForm: React.Dispatch<React.SetStateAction<CreateForm>> }) {
  const { data: centers = [] } = useCenters();
  const region = form.region;
  
  useEffect(() => {
    if (!region || !centers || centers.length === 0) return;
    const centroid = REGION_CENTROIDS.find(r => r.name === region);
    if (!centroid) return;
    let nearest = centers[0];
    let bestDist = Infinity;
    for (const c of centers) {
      if (typeof c.lat !== 'number' || typeof c.lng !== 'number') continue;
      const d = haversineKm(centroid.lat, centroid.lng, c.lat, c.lng);
      if (d < bestDist) { bestDist = d; nearest = c; }
    }
    if (nearest) {
      setForm(prev => ({ ...prev, centerId: nearest.id, centerName: nearest.name }));
    }
  }, [region, centers]);

  const options = (() => {
    if (!region) return centers;
    const centroid = REGION_CENTROIDS.find(r => r.name === region);
    if (!centroid) return centers;
    
    return [...centers].sort((a: any, b: any) => {
      const da = (typeof a.lat === 'number' && typeof a.lng === 'number') ? haversineKm(centroid.lat, centroid.lng, a.lat, a.lng) : Infinity;
      const db = (typeof b.lat === 'number' && typeof b.lng === 'number') ? haversineKm(centroid.lat, centroid.lng, b.lat, b.lng) : Infinity;
      return da - db;
    });
  })();

  return (
    <select value={form.centerId} onChange={e => {
      const id = e.target.value;
      const c = centers.find((x: any) => x.id === id);
      setForm(prev => ({ ...prev, centerId: id, centerName: c ? c.name : '' }));
    }} className="w-full px-3 py-2 rounded-sm border border-border bg-background text-sm">
      <option value="">Sin centro</option>
      {options.map((c: any) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );
}

const priorityConfig: Record<NeedPriority, { color: string; bg: string }> = {
  alta:  { color: 'text-[#9e5a5a]', bg: 'bg-[#9e5a5a]/10' },
  media: { color: 'text-foreground/60', bg: 'bg-white/5' },
  baja:  { color: 'text-foreground/40', bg: 'bg-white/5' },
};

const statusConfig: Record<NeedStatus, { color: string; icon: React.ReactNode }> = {
  activa:      { color: 'bg-white/5 text-foreground/50',        icon: <AlertTriangle className="w-3 h-3" /> },
  en_proceso:  { color: 'bg-white/5 text-foreground/60',        icon: <Clock className="w-3 h-3" /> },
  satisfecha:  { color: 'bg-[#7a9e7e]/10 text-[#7a9e7e]',      icon: <CheckCircle2 className="w-3 h-3" /> },
  cancelada:   { color: 'bg-[#9e5a5a]/10 text-[#9e5a5a]',      icon: <X className="w-3 h-3" /> },
};

export function NeedsPage() {
  const { data: needs, isLoading } = useNeeds();
  const { hasPermission, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<NeedPriority | 'all'>('all');
  const [selectedNeed, setSelectedNeed] = useState<Need | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    productName: '', category: '', quantityRequired: 0, unit: '', priority: 'media' as NeedPriority,
    region: '', centerId: '', centerName: '', address: '', description: '', deadline: ''
  });

  const UNIT_CATEGORY_MAP: Record<string, string[]> = {
    litros: ['agua', 'alimentos', 'medicamentos', 'otros'],
    kg: ['alimentos', 'ropa', 'herramientas', 'otros'],
    piezas: ['ropa', 'herramientas', 'higiene', 'otros'],
    unidades: ['herramientas', 'medicamentos', 'otros'],
    pares: ['ropa'],
    kits: ['higiene', 'otros'],
  };

  const ALL_UNITS = Object.keys(UNIT_CATEGORY_MAP);

  
  const CATEGORY_UNIT_MAP: Record<string, string[]> = {};
  for (const [unit, cats] of Object.entries(UNIT_CATEGORY_MAP)) {
    for (const c of cats) {
      CATEGORY_UNIT_MAP[c] = CATEGORY_UNIT_MAP[c] || [];
      if (!CATEGORY_UNIT_MAP[c].includes(unit)) CATEGORY_UNIT_MAP[c].push(unit);
    }
  }

  const PREFERRED_UNIT: Record<string, string> = {
    agua: 'litros',
    alimentos: 'kg',
    medicamentos: 'unidades',
    ropa: 'piezas',
    higiene: 'kits',
    herramientas: 'unidades',
    otros: 'unidades'
  };

  const REGION_CENTROIDS: { name: string; lat: number; lng: number }[] = [
    { name: 'Arica y Parinacota', lat: -18.4783, lng: -70.3126 },
    { name: 'Tarapacá', lat: -20.2120, lng: -69.6614 },
    { name: 'Antofagasta', lat: -23.6500, lng: -70.3970 },
    { name: 'Atacama', lat: -27.3668, lng: -70.3319 },
    { name: 'Coquimbo', lat: -29.9537, lng: -71.3432 },
    { name: 'Valparaíso', lat: -33.0472, lng: -71.6127 },
    { name: 'Metropolitana', lat: -33.4489, lng: -70.6693 },
    { name: "O'Higgins", lat: -34.1685, lng: -70.7396 },
    { name: 'Maule', lat: -35.4264, lng: -71.6554 },
    { name: 'Ñuble', lat: -36.6060, lng: -72.1034 },
    { name: 'Biobío', lat: -36.8201, lng: -73.0444 },
    { name: 'Araucanía', lat: -38.7359, lng: -72.5904 },
    { name: 'Los Ríos', lat: -39.8161, lng: -73.2459 },
    { name: 'Los Lagos', lat: -41.4696, lng: -72.9425 },
    { name: 'Aysén', lat: -45.5740, lng: -72.0653 },
    { name: 'Magallanes', lat: -53.1638, lng: -70.9171 }
  ];


  const allCategories = Object.keys(DONATION_TYPE_LABELS);
  
  const allowedCategories = allCategories;

  const allowedUnitsForCategory = form.category && CATEGORY_UNIT_MAP[form.category]
    ? CATEGORY_UNIT_MAP[form.category]
    : ALL_UNITS;

  const createMutation = useMutation({
    mutationFn: (payload: any) => needService.create(payload),
    onSuccess: async () => {
      setShowCreate(false);
      setForm({ productName: '', category: '', quantityRequired: 0, unit: '', priority: 'media', region: '', centerId: '', centerName: '', address: '', description: '', deadline: '' });
      await queryClient.invalidateQueries({ queryKey: ['needs'] });
    },
    onError: (err: any) => {
      const msg = err?.message ?? err?.response?.message ?? 'No se pudo crear la necesidad';
      alert(`Error: ${msg}`);
      console.error('Create need error:', err);
    }
  });

  const filtered = needs?.filter(n => {
    const matchesSearch = !search || 
      n.code.toLowerCase().includes(search.toLowerCase()) ||
      n.productName.toLowerCase().includes(search.toLowerCase()) ||
      n.centerName.toLowerCase().includes(search.toLowerCase()) ||
      n.region.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || n.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  }) || [];

  const sorted = [...filtered].sort((a, b) => {
    const priorityOrder = { alta: 3, media: 2, baja: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  const stats = {
    total: needs?.length || 0,
    alta: needs?.filter(n => n.priority === 'alta').length || 0,
    satisfechas: needs?.filter(n => n.status === 'satisfecha').length || 0,
    cobertura: needs?.length 
      ? Math.round(needs.reduce((acc, n) => acc + (n.quantityReceived / n.quantityRequired), 0) / needs.length * 100)
      : 0
  };

  const progressPercent = (need: Need) => 
    Math.min(100, Math.round((need.quantityReceived / need.quantityRequired) * 100));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Necesidades</h2>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">
            Monitorea y gestiona las necesidades prioritarias por región
          </p>
        </div>
        {hasPermission('needs:create') && (
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:opacity-90 shrink-0">
            <Plus className="w-4 h-4" />
            Nueva necesidad
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-0.5">Necesidades activas</p>
        </div>
        <div className="kpi-card">
          <p className="text-2xl font-bold text-[#9e5a5a]">{stats.alta}</p>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-0.5">Prioridad alta</p>
        </div>
        <div className="kpi-card">
          <p className="text-2xl font-bold text-[#7a9e7e]">{stats.satisfechas}</p>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-0.5">Satisfechas</p>
        </div>
        <div className="kpi-card">
          <p className="text-2xl font-bold text-foreground/70">{stats.cobertura}%</p>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-0.5">Cobertura promedio</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por código, producto, región..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-sm border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value as NeedPriority | 'all')}
          className="px-3 py-2 rounded-sm border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
        >
          <option value="all">Todas las prioridades</option>
          {Object.entries(NEED_PRIORITY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="section-card overflow-x-auto">
        <table className="data-table min-w-full">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Prioridad</th>
              <th>Progreso</th>
              <th>Estado</th>
              <th>Centro</th>
              <th>Región</th>
              <th>Actualización</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={10} className="py-4">
                    <div className="h-8 bg-secondary/50 rounded-sm animate-pulse" />
                  </td>
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-muted-foreground">
                  No se encontraron necesidades
                </td>
              </tr>
            ) : (
              sorted.map(need => (
                <tr key={need.id} className="cursor-pointer" onClick={() => setSelectedNeed(need)}>
                  <td className="font-mono text-sm text-muted-foreground">{need.code}</td>
                  <td className="text-sm font-medium">{need.productName}</td>
                  <td className="text-sm">{need.category}</td>
                  <td>
                    <span className={`status-badge ${priorityConfig[need.priority].bg} ${priorityConfig[need.priority].color}`}>
                      {NEED_PRIORITY_LABELS[need.priority]}
                    </span>
                  </td>
                  <td>
                    <div className="w-full max-w-[120px]">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{need.quantityReceived}/{need.quantityRequired}</span>
                        <span className="text-foreground/70 font-medium">{progressPercent(need)}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-sm overflow-hidden">
                        <div 
                          className={`h-full rounded-sm ${
                            progressPercent(need) >= 80 ? 'bg-[#7a9e7e]' :
                            progressPercent(need) >= 50 ? 'bg-foreground/30' : 'bg-[#9e5a5a]'
                          }`}
                          style={{ width: `${progressPercent(need)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${statusConfig[need.status].color}`}>
                      {statusConfig[need.status].icon}
                      {NEED_STATUS_LABELS[need.status]}
                    </span>
                  </td>
                  <td className="text-sm">{need.centerName}</td>
                  <td className="text-sm">{need.region}</td>
                  <td className="text-sm text-muted-foreground">
                    {new Date(need.updatedAt).toLocaleDateString('es-CL')}
                  </td>
                  <td>
                    <button className="p-1 hover:bg-secondary rounded-sm">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedNeed && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedNeed(null)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-card border-l border-border overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">{selectedNeed.code}</h3>
                <span className={`status-badge ${priorityConfig[selectedNeed.priority].bg} ${priorityConfig[selectedNeed.priority].color}`}>
                  {NEED_PRIORITY_LABELS[selectedNeed.priority]}
                </span>
              </div>
              <button onClick={() => setSelectedNeed(null)} className="p-1 hover:bg-secondary rounded-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Producto</p>
                  <p className="text-sm font-medium text-foreground mt-1">{selectedNeed.productName}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Categoría</p>
                  <p className="text-sm font-medium text-foreground mt-1 capitalize">{selectedNeed.category}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Cantidad requerida</p>
                  <p className="text-sm font-medium text-foreground mt-1">{selectedNeed.quantityRequired} {selectedNeed.unit}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Cantidad recibida</p>
                  <p className="text-sm font-medium text-foreground mt-1">{selectedNeed.quantityReceived} {selectedNeed.unit}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Progreso</p>
                <div className="h-2 bg-secondary rounded-sm overflow-hidden">
                  <div 
                    className={`h-full rounded-sm transition-all ${
                      progressPercent(selectedNeed) >= 80 ? 'bg-[#7a9e7e]' :
                      progressPercent(selectedNeed) >= 50 ? 'bg-foreground/30' : 'bg-[#9e5a5a]'
                    }`}
                    style={{ width: `${progressPercent(selectedNeed)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedNeed.quantityReceived} de {selectedNeed.quantityRequired} {selectedNeed.unit} ({progressPercent(selectedNeed)}%)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Centro destino</p>
                  <p className="text-sm font-medium text-foreground mt-1">{selectedNeed.centerName}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Región</p>
                  <p className="text-sm font-medium text-foreground mt-1">{selectedNeed.region}</p>
                </div>
              </div>

              {selectedNeed.deadline && (
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Fecha límite</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(selectedNeed.deadline).toLocaleDateString('es-CL', { 
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </p>
                </div>
              )}

              {selectedNeed.description && (
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Descripción</p>
                  <p className="text-sm text-foreground bg-secondary/30 p-3 rounded-sm">{selectedNeed.description}</p>
                </div>
              )}

              {selectedNeed.verifiedBy && (
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Verificado por</p>
                  <p className="text-sm text-foreground">{selectedNeed.verifiedBy}</p>
                </div>
              )}

              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Donaciones asociadas</p>
                <p className="text-sm text-foreground">{selectedNeed.matchedDonations} donaciones vinculadas a esta necesidad</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreate(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-card border-l border-border overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-lg">Crear nueva necesidad</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-secondary rounded-sm"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Producto</label>
                <input value={form.productName} onChange={e => setForm({...form, productName: e.target.value})} className="w-full px-3 py-2 rounded-sm border border-border bg-background text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Categoría</label>
                  <select value={form.category} onChange={e => {
                    const newCat = e.target.value;
                    const unitsForCat = newCat && CATEGORY_UNIT_MAP[newCat] ? CATEGORY_UNIT_MAP[newCat] : ALL_UNITS;
                    const preferred = PREFERRED_UNIT[newCat] ?? (unitsForCat.length ? unitsForCat[0] : '');
                    const newUnit = unitsForCat.includes(form.unit) ? form.unit : preferred;
                    setForm({ ...form, category: newCat, unit: newUnit });
                  }} className="w-full px-3 py-2 rounded-sm border border-border bg-background text-sm">
                    <option value="">Seleccionar categoría</option>
                    {allowedCategories.map(cat => (
                      <option key={cat} value={cat}>{DONATION_TYPE_LABELS[cat as keyof typeof DONATION_TYPE_LABELS] ?? cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Unidad</label>
                  <select value={form.unit} onChange={e => {
                    const newUnit = e.target.value;
                    setForm({ ...form, unit: newUnit });
                  }} className="w-full px-3 py-2 rounded-sm border border-border bg-background text-sm">
                    <option value="">Seleccionar unidad</option>
                    {ALL_UNITS.map(u => (
                      <option key={u} value={u} disabled={!allowedUnitsForCategory.includes(u)}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Cantidad requerida</label>
                  <input type="number" value={form.quantityRequired} onChange={e => setForm({...form, quantityRequired: Number(e.target.value)})} className="w-full px-3 py-2 rounded-sm border border-border bg-background text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Prioridad</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as NeedPriority})} className="w-full px-3 py-2 rounded-sm border border-border bg-background text-sm">
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Región</label>
                  <select value={form.region} onChange={e => setForm({...form, region: e.target.value})} className="w-full px-3 py-2 rounded-sm border border-border bg-background text-sm">
                    <option value="">Todas las regiones</option>
                    {REGION_CENTROIDS.map(r => (
                      <option key={r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Centro</label>
                  
                  <CentersSelect form={form} setForm={setForm} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Dirección de la necesidad</label>
                <AddressInput region={form.region} address={form.address} setAddress={addr => setForm({...form, address: addr})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Descripción</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 rounded-sm border border-border bg-background text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Fecha límite</label>
                <input type="datetime-local" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} min={new Date().toISOString().slice(0, 16)} className="w-full px-3 py-2 rounded-sm border border-border bg-background text-sm" />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowCreate(false)} className="px-3 py-2 rounded-sm border border-border">Cancelar</button>
                <button disabled={createMutation.isPending} onClick={async () => {
                  
                  if (!user) { alert('Debes estar autenticado para crear una necesidad'); return; }
                  if (!form.productName || !form.quantityRequired) { alert('Completa producto y cantidad'); return; }
                  if (!form.category) { alert('Selecciona una categoría válida para la unidad seleccionada'); return; }
                  if (form.deadline && new Date(form.deadline) < new Date()) { alert('La fecha límite no puede ser en el pasado'); return; }
                  await createMutation.mutateAsync({
                    category: form.category || 'otros', productName: form.productName, quantityRequired: form.quantityRequired,
                    quantityReceived: 0, unit: form.unit || '', priority: form.priority, status: 'activa' as NeedStatus,
                    region: form.region, centerId: form.centerId || '', centerName: form.centerName || '', address: form.address || '', description: form.description || '', deadline: form.deadline || undefined,
                    createdByEmail: user.email
                  });
                }} className="px-3 py-2 rounded-sm bg-primary text-primary-foreground">Crear</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}