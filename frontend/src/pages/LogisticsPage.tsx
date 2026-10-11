import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MapPin, Plus, Save, Search, Truck, X, 
  Warehouse, AlertTriangle, Navigation 
} from 'lucide-react';
import { useEnvios, useCenters, useVehicles, useRoutes, useNeeds, useDonations } from '../hooks/useQueries';
import { logisticsService } from '../services/logisticsService';
import { useAuthStore } from '../store/authStore';
import { DONATION_TYPE_LABELS } from '../mock/donations';
import type { EnvioRecord, Need, DonationRecord, DonationType } from '../types';

type DonationAcopioRow = {
  donation: DonationRecord;
  need?: Need;
  envio?: EnvioRecord;
};


const envioStatusConfig: Record<string, { color: string; label: string }> = {
  pendiente_acopio: { color: 'bg-white/5 text-foreground/40', label: 'Pendiente en acopio' },
  recibida:         { color: 'bg-white/5 text-foreground/50', label: 'Recibida en acopio' },
  en_camino:        { color: 'bg-white/5 text-foreground/60', label: 'En camino al destino' },
  entregado:        { color: 'bg-[#7a9e7e]/10 text-[#7a9e7e]',  label: 'Entregado' },
  inexistente:      { color: 'bg-[#9e5a5a]/10 text-[#9e5a5a]',  label: 'Inexistente' },
};

const vehicleStatusConfig: Record<string, { color: string; label: string }> = {
  disponible:    { color: 'bg-[#7a9e7e]/10 text-[#7a9e7e]', label: 'Disponible' },
  en_ruta:       { color: 'bg-white/5 text-foreground/60',   label: 'En ruta' },
  mantencion:    { color: 'bg-white/5 text-foreground/50',   label: 'Mantención' },
  no_disponible: { color: 'bg-[#9e5a5a]/10 text-[#9e5a5a]', label: 'No disponible' },
};

function canMarkEntregado(userEmail: string | undefined, userRole: string | undefined, need?: Need) {
  if (userRole === 'admin') return true;
  if (!userEmail || !need?.createdByEmail) return false;
  return userEmail.trim().toLowerCase() === need.createdByEmail.trim().toLowerCase();
}

function nextEstadoAction(estado: string): { label: string; next: string } | null {
  if (estado === 'pendiente_acopio') return { label: 'Marcar recibida', next: 'recibida' };
  if (estado === 'recibida') return { label: 'Iniciar envío', next: 'en_camino' };
  if (estado === 'en_camino') return { label: 'Marcar entregado', next: 'entregado' };
  return null;
}

export function LogisticsPage() {
  const queryClient = useQueryClient();
  const { user, hasPermission } = useAuthStore();
  const { data: needs = [] } = useNeeds();
  const { data: donations = [], isLoading: donationsLoading } = useDonations();
  
  
  const { data: envios = [], isLoading: enviosLoading } = useEnvios();
  const { data: centers = [] } = useCenters();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const { data: routes = [] } = useRoutes();

  
  const [activeTab, setActiveTab] = useState<'envios' | 'centers' | 'vehicles' | 'routes'>('envios');
  const [searches, setSearches] = useState({
    envios: '',
    donations: '',
    centers: '',
    vehicles: '',
    routes: '',
  });
  
  const [actionError, setActionError] = useState<string | null>(null);
  
  
  const [selectedEnvio, setSelectedEnvio] = useState<EnvioRecord | null>(null);

  
  const registerAcopioMutation = useMutation({
    mutationFn: (donacionId: number) => logisticsService.create(donacionId),
    onSuccess: async createdEnvio => {
      setSelectedEnvio(createdEnvio);
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ['envios'] });
      await queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
    onError: (error) => setActionError(error instanceof Error ? error.message : 'No se pudo registrar en acopio'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string | number; estado: string }) => logisticsService.updateState(id, estado),
    onSuccess: async updatedEnvio => {
      setSelectedEnvio(updatedEnvio);
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ['envios'] });
    },
    onError: (error) => setActionError(error instanceof Error ? error.message : 'No se pudo actualizar el estado'),
  });

  const donationAcopioRows = useMemo((): DonationAcopioRow[] => {
    const envioByDonacionId = new Map(envios.map(e => [e.donacionId, e]));
    return donations
      .filter(d => d.needId)
      .map(donation => ({
        donation,
        need: needs.find(n => n.id === donation.needId),
        envio: envioByDonacionId.get(donation.id),
      }))
      .sort((a, b) => Number(b.donation.id) - Number(a.donation.id));
  }, [donations, needs, envios]);

  const filteredDonationAcopioRows = useMemo(() => {
    const query = searches.donations.trim().toLowerCase();
    if (!query) return donationAcopioRows;
    return donationAcopioRows.filter(({ donation, need }) =>
      String(donation.id).includes(query) ||
      donation.descripcion.toLowerCase().includes(query) ||
      donation.tipo.toLowerCase().includes(query) ||
      (need?.centerName?.toLowerCase().includes(query) ?? false) ||
      (need?.productName?.toLowerCase().includes(query) ?? false) ||
      (need?.code?.toLowerCase().includes(query) ?? false)
    );
  }, [donationAcopioRows, searches.donations]);

  const donationsPendingRegistration = donationAcopioRows.filter(row => !row.envio).length;

  const acopioCenters = useMemo(() => {
    const map = new Map<string, { id: string; name: string; envios: EnvioRecord[] }>();
    for (const envio of envios) {
      const id = envio.acopioCenterId ?? 'sin-centro';
      const name = envio.acopioCenterName ?? 'Centro de acopio';
      if (!map.has(id)) map.set(id, { id, name, envios: [] });
      map.get(id)!.envios.push(envio);
    }
    return Array.from(map.values());
  }, [envios]);

  const getNeedForEnvio = (envio: EnvioRecord) =>
    needs.find(n => n.id === envio.needId);

  const handleAdvanceEstado = async (envio: EnvioRecord) => {
    const action = nextEstadoAction(envio.estado);
    if (!action) return;
    if (action.next === 'entregado') {
      const need = getNeedForEnvio(envio);
      if (!canMarkEntregado(user?.email, user?.role, need)) {
        setActionError('Solo un administrador o el responsable de la necesidad puede marcar entregado');
        return;
      }
    }
    setActionError(null);
    await updateMutation.mutateAsync({ id: envio.id, estado: action.next });
  };

  
  const filteredEnvios = useMemo(() => {
    const query = searches.envios.trim().toLowerCase();
    return envios.filter(envio =>
      !query || String(envio.id).includes(query) || String(envio.donacionId).includes(query) ||
      envio.direccion.toLowerCase().includes(query) || envio.estado.toLowerCase().includes(query)
    );
  }, [envios, searches.envios]);

  const filteredVehicles = useMemo(() => {
    const query = searches.vehicles.trim().toLowerCase();
    return vehicles.filter(vehicle =>
      !query ||
      String(vehicle.id).includes(query) ||
      vehicle.code.toLowerCase().includes(query) ||
      vehicle.name.toLowerCase().includes(query) ||
      vehicle.plate.toLowerCase().includes(query) ||
      vehicle.driverName?.toLowerCase().includes(query) ||
      vehicle.region.toLowerCase().includes(query) ||
      vehicle.status.toLowerCase().includes(query)
    );
  }, [vehicles, searches.vehicles]);

  const filteredAcopioCenters = useMemo(() => {
    const query = searches.centers.trim().toLowerCase();
    if (!query) return acopioCenters;
    return acopioCenters.filter(center =>
      center.name.toLowerCase().includes(query) ||
      center.id.toLowerCase().includes(query) ||
      center.envios.some(envio =>
        envio.direccion.toLowerCase().includes(query) ||
        envio.estado.toLowerCase().includes(query)
      )
    );
  }, [acopioCenters, searches.centers]);

  const statsEnvios = useMemo(() => ({
    total: envios.length,
    pendientes: envios.filter(envio => envio.estado === 'pendiente_acopio').length,
    enRuta: envios.filter(envio => envio.estado === 'en_camino').length,
    entregados: envios.filter(envio => envio.estado === 'entregado').length,
  }), [envios]);

  const activeRoutesCount = routes.filter(r => r.status === 'activa').length || 0;
  const availableVehiclesCount = vehicles.filter(v => v.status === 'disponible').length || 0;
  const saturatedCentersCount = centers.filter(c => c.status === 'saturado' || c.status === 'colapsado').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Logística General</h2>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">
            Gestión de envíos, centros de acopio, rutas y flota de transporte.
          </p>
        </div>
      </div>

      
      <div className="flex flex-wrap gap-1 p-1 bg-secondary rounded-sm w-fit">
        {[
          { key: 'envios' as const, label: 'Envíos y Donaciones' },
          { key: 'centers' as const, label: 'Centros de acopio' },
          { key: 'vehicles' as const, label: 'Vehículos' },
          { key: 'routes' as const, label: 'Rutas de despacho' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
              activeTab === tab.key ? 'bg-card text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      
      {activeTab === 'envios' ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="kpi-card"><p className="text-2xl font-bold text-foreground">{statsEnvios.total}</p><p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-0.5">Envíos totales</p></div>
          <div className="kpi-card"><p className="text-2xl font-bold text-foreground/50">{statsEnvios.pendientes}</p><p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-0.5">Pendientes</p></div>
          <div className="kpi-card"><p className="text-2xl font-bold text-foreground/70">{statsEnvios.enRuta}</p><p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-0.5">En ruta</p></div>
          <div className="kpi-card"><p className="text-2xl font-bold text-[#7a9e7e]">{statsEnvios.entregados}</p><p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-0.5">Entregados</p></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="kpi-card">
            <div className="flex items-center gap-2 mb-2"><Warehouse className="w-5 h-5 text-muted-foreground" /><p className="text-2xl font-bold text-foreground">{centers.length}</p></div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Centros de acopio</p>
          </div>
          <div className="kpi-card">
            <div className="flex items-center gap-2 mb-2"><Truck className="w-5 h-5 text-muted-foreground" /><p className="text-2xl font-bold text-foreground">{activeRoutesCount}</p></div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Rutas activas</p>
          </div>
          <div className="kpi-card">
            <div className="flex items-center gap-2 mb-2"><Navigation className="w-5 h-5 text-[#7a9e7e]" /><p className="text-2xl font-bold text-foreground">{availableVehiclesCount}</p></div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Vehículos disponibles</p>
          </div>
          <div className="kpi-card">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-5 h-5 text-[#9e5a5a]" /><p className="text-2xl font-bold text-foreground">{saturatedCentersCount}</p></div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Centros saturados</p>
          </div>
        </div>
      )}

      
      {activeTab !== 'envios' && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={
              activeTab === 'centers' ? 'Buscar centro o región...' :
              activeTab === 'vehicles' ? 'Buscar vehículo o conductor...' :
              'Buscar ruta o código...'
            }
            value={searches[activeTab]}
            onChange={e => setSearches(prev => ({ ...prev, [activeTab]: e.target.value }))}
            className="w-full pl-9 pr-4 py-2 rounded-sm border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
          />
        </div>
      )}

      {actionError && activeTab === 'envios' && (
        <div className="rounded-sm border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">{actionError}</div>
      )}

      
      
      
      {activeTab === 'envios' && (
        <>
          <section className="section-card p-5 space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">Donaciones en centro de acopio</h3>
                </div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-2 max-w-2xl">
                  Al crear una donación vinculada a una necesidad, queda automáticamente como{' '}
                  <span className="text-foreground/60 font-medium">pendiente en acopio</span> en el centro
                  de esa necesidad. El donante tiene hasta 3 días para llevar el aporte físicamente.
                </p>
              </div>
              {donationsPendingRegistration > 0 && (
                <span className="shrink-0 text-[11px] uppercase tracking-widest px-2.5 py-1 rounded-sm bg-secondary text-muted-foreground border border-border">
                  {donationsPendingRegistration} sin registro en acopio
                </span>
              )}
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar donación, necesidad o centro..."
                value={searches.donations}
                onChange={e => setSearches(prev => ({ ...prev, donations: e.target.value }))}
                className="w-full pl-9 pr-4 py-2 rounded-sm border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
              />
            </div>

            <div className="overflow-x-auto rounded-sm border border-border">
              <table className="data-table min-w-full">
                <thead>
                  <tr>
                    <th>Donación</th>
                    <th>Aporte</th>
                    <th>Necesidad</th>
                    <th>Centro de acopio</th>
                    <th>Destino final</th>
                    <th>Plazo acopio</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {donationsLoading || enviosLoading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <tr key={idx}>
                        <td colSpan={7} className="py-4">
                          <div className="h-8 bg-secondary/50 rounded-sm animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : filteredDonationAcopioRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No hay donaciones vinculadas a necesidades
                      </td>
                    </tr>
                  ) : (
                    filteredDonationAcopioRows.map(({ donation, need, envio }) => (
                      <tr key={donation.id}>
                        <td className="font-mono text-sm text-muted-foreground">#{donation.id}</td>
                        <td className="max-w-[180px]">
                          <p className="text-sm truncate">{donation.descripcion}</p>
                          <p className="text-xs text-muted-foreground">
                            {donation.cantidad} · {DONATION_TYPE_LABELS[donation.tipo as DonationType] ?? donation.tipo}
                          </p>
                        </td>
                        <td className="text-sm text-muted-foreground">
                          {need ? (
                            <>
                              <span className="text-foreground">{need.code}</span>
                              <br />
                              <span className="text-xs">{need.productName}</span>
                            </>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-sm">{envio?.acopioCenterName ?? need?.centerName ?? '-'}</td>
                        <td className="text-sm text-muted-foreground max-w-[160px] truncate">
                          {envio?.direccion ?? need?.address ?? donation.direccion}
                        </td>
                        <td className="text-xs text-muted-foreground whitespace-nowrap">
                          {envio?.acopioDeadline
                            ? new Date(envio.acopioDeadline).toLocaleDateString('es-CL')
                            : '-'}
                        </td>
                        <td>
                          {envio ? (
                            <span
                              className={`status-badge ${envioStatusConfig[envio.estado]?.color ?? 'bg-white/5 text-foreground/40'}`}
                            >
                              {envioStatusConfig[envio.estado]?.label ?? envio.estado}
                            </span>
                          ) : hasPermission('logistics:edit') ? (
                            <button
                              type="button"
                              disabled={registerAcopioMutation.isPending}
                              onClick={() => {
                                setActionError(null);
                                registerAcopioMutation.mutate(donation.id);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-sm border border-border bg-secondary text-muted-foreground text-xs hover:text-foreground hover:border-border/80 disabled:opacity-50"
                            >
                              <Plus className="w-3 h-3" />
                              Registrar pendiente acopio
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin registro</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
          <div className="section-card overflow-x-auto">
            <div className="px-5 pt-5 pb-2">
              <h3 className="font-semibold text-foreground text-sm">Seguimiento de envíos</h3>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">Avanza el estado cuando el aporte llega al acopio y sale hacia el destino.</p>
            </div>
            <div className="px-5 pb-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar envío, donación, dirección o estado..."
                  value={searches.envios}
                  onChange={e => setSearches(prev => ({ ...prev, envios: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2 rounded-sm border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
                />
              </div>
            </div>
            <table className="data-table min-w-full">
              <thead><tr><th>ID</th><th>Donación</th><th>Acopio</th><th>Destino</th><th>Plazo acopio</th><th>Estado</th><th>Acción</th></tr></thead>
              <tbody>
                {enviosLoading ? Array.from({ length: 5 }).map((_, idx) => <tr key={idx}><td colSpan={7} className="py-4"><div className="h-8 bg-secondary/50 rounded-sm animate-pulse" /></td></tr>) : filteredEnvios.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No se encontraron envíos</td></tr> : filteredEnvios.map(envio => {
                  const action = nextEstadoAction(envio.estado);
                  const need = getNeedForEnvio(envio);
                  const canDeliver = action?.next !== 'entregado' || canMarkEntregado(user?.email, user?.role, need);
                  return (
                  <tr key={envio.id}>
                    <td className="font-mono text-sm text-muted-foreground">{envio.id}</td>
                    <td className="text-sm">#{envio.donacionId}</td>
                    <td className="text-sm text-muted-foreground">{envio.acopioCenterName ?? '-'}</td>
                    <td className="text-sm text-muted-foreground max-w-[200px] truncate">{envio.direccion}</td>
                    <td className="text-xs text-muted-foreground">{envio.acopioDeadline ? new Date(envio.acopioDeadline).toLocaleDateString('es-CL') : '-'}</td>
                    <td><span className={`status-badge ${envioStatusConfig[envio.estado]?.color ?? 'bg-white/5 text-foreground/40'}`}>{envioStatusConfig[envio.estado]?.label ?? envio.estado}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        {action && hasPermission('logistics:edit') && (
                          <button
                            type="button"
                            disabled={!canDeliver || updateMutation.isPending}
                            onClick={() => void handleAdvanceEstado(envio)}
                            className="px-2 py-1 rounded-sm border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-50"
                          >
                            {action.label}
                          </button>
                        )}
                        <button type="button" onClick={() => setSelectedEnvio(envio)} className="p-2 hover:bg-secondary rounded-sm" title="Ver detalle"><MapPin className="w-4 h-4 text-muted-foreground" /></button>
                      </div>
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        </>
      )}

      
      
      
      {activeTab === 'centers' && (
        <div className="space-y-6">
          {filteredAcopioCenters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay envíos en centros de acopio</div>
          ) : (
            filteredAcopioCenters.map(center => (
              <section key={center.id} className="section-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Warehouse className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold text-lg">{center.name}</h3>
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground ml-auto">{center.envios.length} envíos</span>
                </div>
                <div className="space-y-3">
                  {center.envios.map(envio => {
                    const action = nextEstadoAction(envio.estado);
                    const need = getNeedForEnvio(envio);
                    const canDeliver = action?.next !== 'entregado' || canMarkEntregado(user?.email, user?.role, need);
                    return (
                      <div key={envio.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-sm border border-border p-3 bg-background">
                        <div>
                          <p className="text-sm font-medium">Donación #{envio.donacionId}</p>
                          <p className="text-xs text-muted-foreground">Destino final: {envio.direccion}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Plazo en acopio: {envio.acopioDeadline ? new Date(envio.acopioDeadline).toLocaleString('es-CL') : '-'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`status-badge ${envioStatusConfig[envio.estado]?.color ?? ''}`}>{envioStatusConfig[envio.estado]?.label ?? envio.estado}</span>
                          {action && hasPermission('logistics:edit') && (
                            <button
                              type="button"
                              disabled={!canDeliver || updateMutation.isPending}
                              onClick={() => void handleAdvanceEstado(envio)}
                              className="px-3 py-1.5 rounded-sm border border-border bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80 disabled:opacity-50"
                            >
                              {action.label}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      )}

      {actionError && activeTab === 'centers' && (
        <div className="rounded-sm border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">{actionError}</div>
      )}

      
      {activeTab === 'vehicles' && (
        <div className="section-card overflow-x-auto">
          <table className="data-table min-w-full">
            <thead>
              <tr><th>Código</th><th>Vehículo</th><th>Tipo</th><th>Patente</th><th>Estado</th><th>Capacidad</th><th>Carga actual</th><th>Conductor</th><th>Región</th><th>Última mantención</th></tr>
            </thead>
            <tbody>
              {vehiclesLoading ? (
                Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={10} className="py-4"><div className="h-8 bg-secondary/50 rounded-sm animate-pulse" /></td></tr>)
              ) : filteredVehicles.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-muted-foreground">No hay vehículos registrados</td></tr>
              ) : (
                filteredVehicles.map(v => (
                  <tr key={v.id}>
                    <td className="font-mono text-sm text-muted-foreground">{v.code}</td>
                    <td className="text-sm font-medium">{v.name}</td>
                    <td className="text-sm">{v.type}</td>
                    <td className="text-sm font-mono">{v.plate}</td>
                    <td><span className={`status-badge ${vehicleStatusConfig[v.status].color}`}>{vehicleStatusConfig[v.status].label}</span></td>
                    <td className="text-sm">{v.capacity.toLocaleString()} kg</td>
                    <td className="text-sm">{v.currentLoad ? `${v.currentLoad.toLocaleString()} kg` : '-'}</td>
                    <td className="text-sm">{v.driverName || 'Sin asignar'}</td>
                    <td className="text-sm">{v.region}</td>
                    <td className="text-sm text-muted-foreground">{v.lastMaintenance ? new Date(v.lastMaintenance).toLocaleDateString('es-CL') : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedEnvio && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedEnvio(null)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-lg">Envío {selectedEnvio.id}</h3>
              <button onClick={() => setSelectedEnvio(null)} className="p-1 hover:bg-secondary rounded-sm"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><p className="text-[11px] uppercase tracking-widest text-muted-foreground">Donación</p><p className="text-sm text-foreground mt-1">#{selectedEnvio.donacionId}</p></div>
              <div><p className="text-[11px] uppercase tracking-widest text-muted-foreground">Centro de acopio</p><p className="text-sm text-foreground mt-1">{selectedEnvio.acopioCenterName}</p></div>
              <div><p className="text-[11px] uppercase tracking-widest text-muted-foreground">Destino final</p><p className="text-sm text-foreground mt-1">{selectedEnvio.direccion}</p></div>
              <div><p className="text-[11px] uppercase tracking-widest text-muted-foreground">Estado</p><p className="text-sm text-foreground mt-1">{envioStatusConfig[selectedEnvio.estado]?.label || selectedEnvio.estado}</p></div>
              {nextEstadoAction(selectedEnvio.estado) && hasPermission('logistics:edit') && (
                <button
                  type="button"
                  onClick={() => void handleAdvanceEstado(selectedEnvio)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-border bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80"
                >
                  <Save className="w-4 h-4" />
                  {nextEstadoAction(selectedEnvio.estado)?.label}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}