import { useAuthStore } from '../store/authStore';
import { HeartHandshake, AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { login, loginTraditional, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<'microsoft' | 'traditional'>('microsoft');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleMicrosoftLogin = async () => {
    clearError();
    await login();
  };

  const handleTraditionalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await loginTraditional(email, password);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <HeartHandshake className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Donaton</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plataforma de gestión de donaciones en emergencias
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setLoginType('microsoft')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                loginType === 'microsoft'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Microsoft
            </button>
            <button
              onClick={() => setLoginType('traditional')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                loginType === 'traditional'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Usuario/Contraseña
            </button>
          </div>

          {loginType === 'microsoft' ? (
            <button
              onClick={handleMicrosoftLogin}
              disabled={isLoading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Iniciar sesión con Microsoft
            </button>
          ) : (
            <form onSubmit={handleTraditionalLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Iniciar sesión
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
