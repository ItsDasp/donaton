import { useAuthStore } from '../store/authStore';
import { User, Bell, Palette, LogOut, History, Clock, Monitor, Lock } from 'lucide-react';
import { Blobatar } from '@blobatar/react';
import { Skeleton } from '../components/ui/skeleton';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestJson } from '../services/api';

interface Session {
  id: number;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export function SettingsPage() {
  const { user, logout, updatePassword, updateProfile } = useAuthStore();
  const navigate = useNavigate();
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [notifications, setNotifications] = useState({
    email: true,
    urgent: true,
    donations: true,
  });
  const [darkMode, setDarkMode] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile(editedName);
      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar perfil:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user?.name || '');
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setIsSavingPassword(true);
    try {
      await updatePassword(newPassword);
      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      alert('Contraseña actualizada exitosamente');
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      alert('Error al cambiar contraseña');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setNewPassword('');
    setConfirmPassword('');
    setIsChangingPassword(false);
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await requestJson<Session[]>('/auth/sessions');
        setSessions(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setSessions([]);
      } finally {
        setLoadingSessions(false);
      }
    };

    if (user?.email) {
      fetchSessions();
    } else {
      setLoadingSessions(false);
    }
  }, [user?.email]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ajustes</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Perfil
          </h2>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden">
              {user?.email ? (
                <Blobatar name={user.email} />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize mt-1">{user?.role}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre completo</label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-secondary disabled:text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Correo electrónico</label>
              <input
                type="email"
                defaultValue={user?.email}
                disabled
                className="w-full px-3 py-2 rounded-md border border-border bg-secondary text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2 pt-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                >
                  Editar
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-4">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Cambiar contraseña
            </h3>
            
            {isChangingPassword ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Repite la contraseña"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleChangePassword}
                    disabled={isSavingPassword}
                    className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSavingPassword ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={handleCancelPasswordChange}
                    disabled={isSavingPassword}
                    className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="w-full px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              >
                Cambiar contraseña
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificaciones
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg cursor-pointer">
                <div>
                  <p className="text-sm font-medium">Notificaciones por email</p>
                  <p className="text-xs text-muted-foreground mt-1">Recibir actualizaciones por correo</p>
                </div>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={notifications.email}
                    onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-muted peer peer-checked:bg-green-600 rounded-full transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
              <label className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg cursor-pointer">
                <div>
                  <p className="text-sm font-medium">Alertas de necesidades urgentes</p>
                  <p className="text-xs text-muted-foreground mt-1">Notificaciones de emergencias</p>
                </div>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={notifications.urgent}
                    onChange={(e) => setNotifications({...notifications, urgent: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-muted peer peer-checked:bg-green-600 rounded-full transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
              <label className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg cursor-pointer">
                <div>
                  <p className="text-sm font-medium">Actualizaciones de donaciones</p>
                  <p className="text-xs text-muted-foreground mt-1">Seguimiento de donaciones</p>
                </div>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={notifications.donations}
                    onChange={(e) => setNotifications({...notifications, donations: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-muted peer peer-checked:bg-green-600 rounded-full transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Apariencia
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg cursor-pointer">
                <div>
                  <p className="text-sm font-medium">Modo oscuro</p>
                  <p className="text-xs text-muted-foreground mt-1">Cambiar entre tema claro y oscuro</p>
                </div>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-muted peer peer-checked:bg-green-600 rounded-full transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <History className="w-5 h-5" />
          Historial de sesiones
        </h2>

        {loadingSessions ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No hay sesiones activas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center gap-4 p-4 border border-border rounded-lg ${
                  session.current ? 'bg-primary/5 border-primary/20' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {session.device} - {session.browser}
                    {session.current && (
                      <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        Actual
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {session.lastActive}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">{session.location}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border border-destructive/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Cerrar sesión de tu cuenta actual</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
