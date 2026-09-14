import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, HeartHandshake, ClipboardList, Truck, 
  LogOut, ChevronRight, Menu, X, ShieldAlert,
  Users, Settings
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { abbreviateName } from '../lib/utils';
import { Blobatar } from '@blobatar/react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, required: 'dashboard:view' },
  { path: '/donations', label: 'Donaciones', icon: HeartHandshake, required: 'donations:view' },
  { path: '/needs', label: 'Necesidades', icon: ClipboardList, required: 'needs:view' },
  { path: '/logistics', label: 'Logística', icon: Truck, required: 'logistics:view' },
  { path: '/users', label: 'Usuarios', icon: Users, required: 'users:manage' },
  { path: '/settings', label: 'Ajustes', icon: Settings, required: null },
];

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout, hasPermission } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [httpBanner, setHttpBanner] = useState<{ status: number; message: string } | null>(null);

  const visibleNav = navItems.filter(item => !item.required || hasPermission(item.required as any));

  useEffect(() => {
    function onHttpError(event: Event) {
      const detail = (event as CustomEvent).detail as { status?: number; message?: string } | undefined;
      if (detail?.status === 401) {
        setHttpBanner({
          status: 401,
          message: detail.message || 'No autorizado. Inicia sesión nuevamente.',
        });
      }
    }

    function onForceLogin(event: Event) {
      const detail = (event as CustomEvent).detail as { status?: number; message?: string } | undefined;
      if (detail?.status === 401 || detail?.status === 403) {
        setHttpBanner(null);
        logout(false);
        navigate('/login', { replace: true });
      }
    }

    window.addEventListener('donaton:http-error', onHttpError);
    window.addEventListener('donaton:force-login', onForceLogin);
    return () => {
      window.removeEventListener('donaton:http-error', onHttpError);
      window.removeEventListener('donaton:force-login', onForceLogin);
    };
  }, [logout, navigate]);

  useEffect(() => {
    setHttpBanner(null);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar-background border-r border-border fixed h-full z-30">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <span className="font-bold text-lg tracking-tight text-sidebar-foreground">Donaton</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {visibleNav.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              {user?.email ? (
                <Blobatar name={user.email} />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{abbreviateName(user?.name || '')}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 w-full rounded hover:bg-secondary"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar-background border-b border-border flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
            <HeartHandshake className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-base tracking-tight">Donaton</span>
        </div>
      </div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar-background border-r border-border flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="font-bold text-lg tracking-tight">Donaton</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {visibleNav.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-border">
              <button
                onClick={() => { logout(); setSidebarOpen(false); }}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 w-full rounded hover:bg-secondary"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <header className="hidden lg:flex items-center justify-between h-16 px-6 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-sm text-muted-foreground">
              {location.pathname === '/' && 'Dashboard'}
              {location.pathname === '/donations' && 'Gestión de Donaciones'}
              {location.pathname === '/needs' && 'Necesidades Activas'}
              {location.pathname === '/logistics' && 'Operaciones Logísticas'}
              {location.pathname === '/users' && 'Administración de Usuarios'}
              {location.pathname === '/settings' && 'Ajustes'}
            </h1>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          {httpBanner?.status === 401 && (
            <div className="mb-4">
              <Alert variant="destructive">
                <ShieldAlert className="w-4 h-4" />
                <AlertTitle>Sesión no válida (401)</AlertTitle>
                <AlertDescription>
                  <p>{httpBanner.message}</p>
                </AlertDescription>
                <button
                  type="button"
                  className="absolute right-3 top-3 p-1 rounded hover:bg-secondary"
                  onClick={() => setHttpBanner(null)}
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </Alert>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
