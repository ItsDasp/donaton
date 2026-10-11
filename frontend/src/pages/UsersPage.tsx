import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUsers } from '../hooks/useQueries';
import { useAuthStore } from '../store/authStore';
import { usersService } from '../services/usersService';
import type { ManagedUserRecord } from '../types';
import { AlertCircle, Plus, Search, Save, Trash2, UserPlus } from 'lucide-react';

export function UsersPage() {
  const { hasPermission, user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useUsers();
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '', password: '', role: 'USER' as ManagedUserRecord['role'] });
  const [roleEdits, setRoleEdits] = useState<Record<number, ManagedUserRecord['role']>>({});

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter(user =>
      user.name?.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  }, [users, search]);

  const createMutation = useMutation({
    mutationFn: () => usersService.create(createForm),
    onSuccess: async () => {
      setError(null);
      setCreateForm({ name: '', email: '', phone: '', password: '', role: 'USER' });
      await queryClient.invalidateQueries({ queryKey: ['auth', 'users'] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'No se pudo crear el usuario'),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: ManagedUserRecord['role'] }) => usersService.updateRole(id, role),
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'users'] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'No se pudo actualizar el rol'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersService.delete(id),
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'users'] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'No se pudo eliminar el usuario'),
  });

  if (!hasPermission('users:manage')) {
    return (
      <div className="section-card p-6 text-sm text-muted-foreground">
        No tienes permisos para administrar usuarios.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Usuarios</h2>
        <p className="text-sm text-muted-foreground mt-1">Crear cuentas, cambiar roles y eliminar usuarios.</p>
      </div>

      {error && (
        <div className="rounded-sm border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <section className="section-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Registrar usuario desde administración</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          <input value={createForm.name} onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Nombre" className="px-3 py-2 rounded-sm border border-border bg-background text-sm" />
          <input value={createForm.email} onChange={e => setCreateForm(prev => ({ ...prev, email: e.target.value }))} placeholder="Correo" type="email" className="px-3 py-2 rounded-sm border border-border bg-background text-sm" />
          <input value={createForm.phone} onChange={e => setCreateForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="Teléfono" className="px-3 py-2 rounded-sm border border-border bg-background text-sm" />
          <input value={createForm.password} onChange={e => setCreateForm(prev => ({ ...prev, password: e.target.value }))} placeholder="Contraseña" type="password" className="px-3 py-2 rounded-sm border border-border bg-background text-sm" />
          <select value={createForm.role} onChange={e => setCreateForm(prev => ({ ...prev, role: e.target.value as ManagedUserRecord['role'] }))} className="px-3 py-2 rounded-sm border border-border bg-background text-sm">
            <option value="USER">Usuario</option>
            <option value="ONG">ONG</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>
        <button
          type="button"
          disabled={createMutation.isPending}
          onClick={() => {
            setError(null);
            createMutation.mutate();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-border bg-secondary text-foreground text-sm hover:bg-secondary/80 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {createMutation.isPending ? 'Creando...' : 'Crear usuario'}
        </button>
      </section>

      <section className="section-card overflow-x-auto">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <h3 className="font-semibold text-foreground">Listado de usuarios</h3>
          <div className="relative max-w-md w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar nombre, correo, teléfono o rol..."
              className="w-full pl-9 pr-4 py-2 rounded-sm border border-border bg-background text-sm"
            />
          </div>
        </div>
        <table className="data-table min-w-full">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}><td colSpan={5} className="py-4"><div className="h-8 bg-secondary/50 rounded-sm animate-pulse" /></td></tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No hay usuarios</td></tr>
            ) : (
              filteredUsers.map(user => {
                const currentRole = roleEdits[user.id] ?? user.role;
                // Solo el admin principal (ID 1) puede modificar roles de otros admins
                const isMainAdmin = currentUser?.id === '1' || currentUser?.email === 'admin@donaton.test';
                const isTargetAdmin = user.role === 'ADMIN';
                const canModifyThisUser = isMainAdmin || !isTargetAdmin;
                
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="font-medium text-foreground">{user.name ?? '-'}</div>
                      <div className="text-xs text-muted-foreground">ID {user.id}</div>
                    </td>
                    <td className="text-sm text-muted-foreground">{user.email}</td>
                    <td className="text-sm text-muted-foreground">{user.phone ?? '-'}</td>
                    <td>
                      <select
                        value={currentRole}
                        onChange={e => setRoleEdits(prev => ({ ...prev, [user.id]: e.target.value as ManagedUserRecord['role'] }))}
                        disabled={!canModifyThisUser}
                        className={`px-3 py-2 rounded-sm border border-border text-sm ${
                          !canModifyThisUser 
                            ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed' 
                            : 'bg-background cursor-pointer'
                        }`}
                        title={!canModifyThisUser ? (isTargetAdmin ? 'No puedes cambiar el rol de otros administradores' : '') : ''}
                      >
                        <option value="USER">Usuario</option>
                        <option value="ONG">ONG</option>
                        <option value="ADMIN">Administrador</option>
                      </select>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={updateRoleMutation.isPending || !canModifyThisUser}
                          onClick={() => {
                            setError(null);
                            updateRoleMutation.mutate({ id: user.id, role: currentRole });
                          }}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-sm border border-border text-xs ${
                            !canModifyThisUser
                              ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
                              : 'bg-secondary text-foreground hover:bg-secondary/80'
                          } disabled:opacity-50`}
                          title={!canModifyThisUser ? (isTargetAdmin ? 'No puedes cambiar el rol de otros administradores' : '') : ''}
                        >
                          <Save className="w-3 h-3" />
                          Guardar
                        </button>
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            setError(null);
                            deleteMutation.mutate(user.id);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm border border-border text-xs text-[#9e5a5a] hover:bg-[#9e5a5a]/10 disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
