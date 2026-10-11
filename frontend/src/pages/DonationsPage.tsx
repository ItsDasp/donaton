import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDonations, useNeeds } from '../hooks/useQueries';
import { useAuthStore } from '../store/authStore';
import { 
  Search, Plus, Eye, ArrowUpDown, X, Save, Trash2
} from 'lucide-react';
import type { DonationRecord, DonationType, Need } from '../types';
import { donationService } from '../services/donationService';
import { DONATION_TYPE_LABELS } from '../mock/donations';

export function DonationsPage() {
  const { data: donations, isLoading } = useDonations();
  const { data: needs } = useNeeds();
  const { hasPermission } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedDonation, setSelectedDonation] = useState<DonationRecord | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({ detalleAporte: '', cantidad: '' });
  const [selectedNeedId, setSelectedNeedId] = useState<string>('');
  const [editForm, setEditForm] = useState({
    descripcion: '',
    cantidad: '',
    tipo: 'alimentos' as DonationType,
    direccion: '',
    unit: '',
  });
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!selectedDonation) return;
    setEditError(null);
    setDetailsError(null);
    setEditForm({
      descripcion: selectedDonation.descripcion ?? '',
      cantidad: String(selectedDonation.cantidad ?? ''),
      tipo: (selectedDonation.tipo as DonationType) ?? 'alimentos',
      unit: selectedDonation.unit ?? '',
      direccion: selectedDonation.direccion ?? '',
    });
    const id = selectedDonation.id;
    setDetailsLoading(true);
    void (async () => {
      try {
        const fresh = await donationService.getById(id);
        if (fresh) setSelectedDonation(fresh);
      } catch (e) {
        setDetailsError('No se pudo cargar el detalle de la donación');
      } finally {
        setDetailsLoading(false);
      }
    })();
  }, [selectedDonation?.id]);

  const openNeeds = (needs ?? []).filter(
    n => n.status === 'activa' || n.status === 'en_proceso',
  );

  const selectedNeed = openNeeds.find(n => n.id === selectedNeedId) ?? null;

  const createDonation = useMutation({
    mutationFn: async () => {
      const cantidad = Number(createForm.cantidad);
      if (!selectedNeed) throw new Error('Selecciona una necesidad');
      if (!createForm.detalleAporte.trim()) throw new Error('Describe el formato de tu aporte');
      if (!Number.isFinite(cantidad) || cantidad <= 0) throw new Error('La cantidad debe ser mayor que 0');
      const remaining = Number(selectedNeed.quantityRequired) - Number(selectedNeed.quantityReceived);
      if (cantidad > remaining) throw new Error(`La cantidad supera lo requerido (${remaining} ${selectedNeed.unit} restantes)`);
      const direccion = selectedNeed.address?.trim();
      if (!direccion) throw new Error('La necesidad seleccionada no tiene dirección');
      await donationService.create({
        descripcion: createForm.detalleAporte.trim(),
        cantidad,
        tipo: selectedNeed.category,
        direccion,
        unit: selectedNeed.unit,
        needId: selectedNeed.id,
      });
      return null;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['donations'] });
      await queryClient.invalidateQueries({ queryKey: ['envios'] });
      await queryClient.invalidateQueries({ queryKey: ['needs'] });
      setIsCreateOpen(false);
      setCreateError(null);
      setCreateForm({ detalleAporte: '', cantidad: '' });
      setSelectedNeedId('');
    },
    onError: (error) => {
      setCreateError(error instanceof Error ? error.message : 'No se pudo crear la donación');
    },
  });

  const updateDonation = useMutation({
    mutationFn: async () => {
      if (!selectedDonation) throw new Error('No hay donación seleccionada');
      const cantidad = Number(editForm.cantidad);
      if (!editForm.descripcion.trim() || !editForm.direccion.trim()) throw new Error('Completa descripción y dirección');
      if (!Number.isFinite(cantidad) || cantidad <= 0) throw new Error('La cantidad debe ser mayor que 0');
      return donationService.update(selectedDonation.id, {
        descripcion: editForm.descripcion.trim(),
        cantidad,
        unit: editForm.unit,
        tipo: editForm.tipo,
        direccion: editForm.direccion.trim(),
      });
    },
    onSuccess: async (updated) => {
      setSelectedDonation(updated);
      setEditError(null);
      await queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
    onError: (error) => {
      setEditError(error instanceof Error ? error.message : 'No se pudo actualizar la donación');
    },
  });

  const deleteDonation = useMutation({
    mutationFn: async () => {
      if (!selectedDonation) return;
      await donationService.delete(selectedDonation.id);
    },
    onSuccess: async () => {
      setSelectedDonation(null);
      setEditError(null);
      await queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
    onError: (error) => {
      setEditError(error instanceof Error ? error.message : 'No se pudo eliminar la donación');
    },
  });

  const filtered = (donations ?? []).filter(d =>
    !search ||
    String(d.id).toLowerCase().includes(search.toLowerCase()) ||
    d.descripcion.toLowerCase().includes(search.toLowerCase()) ||
    d.tipo.toLowerCase().includes(search.toLowerCase()) ||
    d.direccion.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return (Number(a.id) - Number(b.id)) * dir;
  });

  const stats = {
    total: donations?.length || 0,
    cantidadTotal: donations?.reduce((acc, d) => acc + Number(d.cantidad || 0), 0) || 0,
    tipos: new Set(donations?.map(d => d.tipo) ?? []).size,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Donaciones</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona y da seguimiento a todas las donaciones recibidas
          </p>
        </div>
        {hasPermission('donations:create') && (
          <button
            type="button"
            onClick={() => { setCreateError(null); setIsCreateOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nueva donación
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total donaciones</p>
        </div>
        <div className="kpi-card">
          <p className="text-2xl font-bold text-foreground">{stats.cantidadTotal}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Cantidad total</p>
        </div>
        <div className="kpi-card">
          <p className="text-2xl font-bold text-foreground">{stats.tipos}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Tipos distintos</p>
        </div>
        <div className="kpi-card">
          <p className="text-2xl font-bold text-foreground">{sorted.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Filtradas</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por código, descripción, tipo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-sm border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
          />
        </div>
        <button
          onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
          className="px-3 py-2 rounded-sm border border-border bg-background hover:bg-secondary transition-colors"
          title="Ordenar"
        >
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="section-card overflow-x-auto">
        <table className="data-table min-w-full">
          <thead>
            <tr>
              <th>Código</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Dirección</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="py-4">
                    <div className="h-8 bg-secondary/50 rounded-sm animate-pulse" />
                  </td>
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  No se encontraron donaciones
                </td>
              </tr>
            ) : (
              sorted.map(donation => (
                <tr key={donation.id} className="cursor-pointer" onClick={() => setSelectedDonation(donation)}>
                  <td className="font-mono text-sm text-muted-foreground">#{donation.id}</td>
                  <td><span className="text-sm">{DONATION_TYPE_LABELS[donation.tipo as DonationType] ?? donation.tipo}</span></td>
                  <td className="max-w-xs truncate">{donation.descripcion}</td>
                  <td className="text-sm">{donation.cantidad}</td>
                  <td className="text-sm truncate">{donation.direccion}</td>
                  <td>
                    <button className="p-1 hover:bg-secondary rounded-sm" type="button">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      
      {selectedDonation && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedDonation(null)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-card border-l border-border overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-semibold">Donación <span className="font-mono text-muted-foreground">#{selectedDonation.id}</span></h3>
              <button onClick={() => setSelectedDonation(null)} className="p-1 hover:bg-secondary rounded-sm">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {detailsLoading && (
                <p className="text-sm text-muted-foreground">Cargando detalle...</p>
              )}
              {detailsError && (
                <p className="text-sm text-muted-foreground border border-border rounded-sm px-3 py-2 bg-secondary/20">{detailsError}</p>
              )}

              <div className="grid grid-cols-2 gap-5">
                {[
                  { label: 'Tipo', field: 'tipo' },
                  { label: 'Cantidad', field: 'cantidad' },
                  { label: 'Dirección', field: 'direccion' },
                  { label: 'Identificador', field: 'id' },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
                    {field === 'id' ? (
                      <p className="text-sm font-mono text-foreground">#{selectedDonation.id}</p>
                    ) : hasPermission('donations:edit') && field !== 'id' ? (
                      field === 'tipo' ? (
                        <select
                          value={editForm.tipo}
                          onChange={e => setEditForm(f => ({ ...f, tipo: e.target.value as DonationType }))}
                          className="w-full px-3 py-2 rounded-sm border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
                          disabled={updateDonation.isPending || deleteDonation.isPending}
                        >
                          {Object.entries(DONATION_TYPE_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field === 'cantidad' ? 'number' : 'text'}
                          min={field === 'cantidad' ? '1' : undefined}
                          value={editForm[field as keyof typeof editForm]}
                          onChange={e => setEditForm(f => ({ ...f, [field]: e.target.value }))}
                          className="w-full px-3 py-2 rounded-sm border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30"
                          disabled={updateDonation.isPending || deleteDonation.isPending}
                        />
                      )
                    ) : (
                      <p className="text-sm text-foreground">
                        {field === 'tipo'
                          ? DONATION_TYPE_LABELS[selectedDonation.tipo as DonationType] ?? selectedDonation.tipo
                          : String((selectedDonation as any)[field] ?? '')}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Descripción</p>
                {hasPermission('donations:edit') ? (
                  <textarea
                    value={editForm.descripcion}
                    onChange={e => setEditForm(f => ({ ...f, descripcion: e.target.value }))}
                    className="w-full min-h-28 px-3 py-2 rounded-sm border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30 resize-none"
                    disabled={updateDonation.isPending || deleteDonation.isPending}
                  />
                ) : (
                  <p className="text-sm text-foreground bg-secondary/30 p-3 rounded-sm leading-relaxed">{selectedDonation.descripcion}</p>
                )}
              </div>

              {editError && (
                <p className="text-sm text-muted-foreground border border-border rounded-sm px-3 py-2 bg-secondary/20">{editError}</p>
              )}

              {(hasPermission('donations:edit') || hasPermission('donations:delete')) && (
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                  {hasPermission('donations:delete') && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedDonation) return;
                        setEditError(null);
                        if (!window.confirm(`¿Eliminar la donación #${selectedDonation.id}?`)) return;
                        deleteDonation.mutate();
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors"
                      disabled={updateDonation.isPending || deleteDonation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleteDonation.isPending ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  )}
                  {hasPermission('donations:edit') && (
                    <button
                      type="button"
                      onClick={() => { setEditError(null); updateDonation.mutate(); }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                      disabled={updateDonation.isPending || deleteDonation.isPending}
                    >
                      <Save className="w-4 h-4" />
                      {updateDonation.isPending ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      
      {isCreateOpen && hasPermission('donations:create') && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => !createDonation.isPending && setIsCreateOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-card border-l border-border overflow-y-auto">

            
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-semibold">Nueva donación</h3>
              <button
                onClick={() => !createDonation.isPending && setIsCreateOpen(false)}
                className="p-1 hover:bg-secondary rounded-sm"
                type="button"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form
              className="flex flex-col h-[calc(100%-57px)]"
              onSubmit={e => { e.preventDefault(); setCreateError(null); createDonation.mutate(); }}
            >
              <div className="flex-1 overflow-y-auto">
                
                <div className="px-6 pt-6 pb-4 border-b border-border">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">
                    1 · Selecciona una necesidad
                  </p>
                  {openNeeds.length === 0 ? (
                    <p className="text-sm text-muted-foreground border border-border rounded-sm px-3 py-3 bg-secondary/20">
                      No hay necesidades abiertas en este momento.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {openNeeds.map((need: Need) => {
                        const remaining = Number(need.quantityRequired) - Number(need.quantityReceived);
                        const pct = Math.round((Number(need.quantityReceived) / Number(need.quantityRequired)) * 100);
                        const isSelected = selectedNeedId === need.id;
                        return (
                          <button
                            key={need.id}
                            type="button"
                            onClick={() => setSelectedNeedId(need.id)}
                            className={`w-full text-left rounded-sm border px-4 py-3 transition-colors ${
                              isSelected
                                ? 'border-foreground/40 bg-secondary/60'
                                : 'border-border bg-background hover:bg-secondary/30'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {need.productName}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {DONATION_TYPE_LABELS[need.category]} · {need.centerName}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                                {remaining} {need.unit} restantes
                              </span>
                            </div>
                             <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-foreground/40 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">{pct}% recibido</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="px-6 pt-5 pb-4 border-b border-border space-y-5">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    2 · Tu aporte
                  </p>

                  {selectedNeed && (
                    <div className="rounded-sm bg-secondary/30 border border-border px-4 py-3 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Destino · <span className="text-foreground">{selectedNeed.address ?? selectedNeed.centerName}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tienes 3 días para llevar el aporte a <span className="text-foreground">{selectedNeed.centerName}</span>
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                      Cantidad
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={createForm.cantidad}
                        onChange={e => setCreateForm(f => ({ ...f, cantidad: e.target.value }))}
                        className="flex-1 px-3 py-2 rounded-sm border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30 disabled:opacity-40"
                        placeholder={selectedNeed ? `Máx. ${Number(selectedNeed.quantityRequired) - Number(selectedNeed.quantityReceived)}` : '—'}
                        disabled={!selectedNeed}
                      />
                      {selectedNeed && (
                        <span className="text-sm text-muted-foreground shrink-0">{selectedNeed.unit}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                      Detalle del aporte
                    </label>
                    <textarea
                      value={createForm.detalleAporte}
                      onChange={e => setCreateForm(f => ({ ...f, detalleAporte: e.target.value }))}
                      className="w-full min-h-24 px-3 py-2 rounded-sm border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30 resize-none disabled:opacity-40"
                      placeholder="Ej: 2 bolsas de leche en polvo de 1 kg c/u"
                      disabled={!selectedNeed}
                    />
                  </div>
                </div>
              </div>

              
              <div className="px-6 py-4 border-t border-border bg-card">
                {createError && (
                  <p className="text-sm text-muted-foreground mb-3 border border-border rounded-sm px-3 py-2 bg-secondary/20">
                    {createError}
                  </p>
                )}
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => !createDonation.isPending && setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-sm border border-border text-sm hover:bg-secondary transition-colors"
                    disabled={createDonation.isPending}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createDonation.isPending || !selectedNeed}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                    {createDonation.isPending ? 'Guardando...' : 'Crear donación'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}