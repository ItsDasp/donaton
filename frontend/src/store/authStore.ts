import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { msalInstance, loginRequest } from '../lib/msalConfig';
import type { AccountInfo } from '@azure/msal-browser';
import type { User, UserRole, Permission } from '../types';

const ROLE_PERMISSIONS_MAP: Record<UserRole, Permission[]> = {
  admin: [
    'dashboard:view', 'donations:view', 'donations:create', 'donations:edit', 'donations:delete',
    'needs:view', 'needs:create', 'needs:edit', 'needs:delete',
    'logistics:view', 'logistics:edit', 'users:manage', 'reports:view', 'settings:manage'
  ],
  operador: [
    'dashboard:view', 'donations:view', 'donations:create', 'donations:edit',
    'needs:view', 'needs:create', 'needs:edit', 'logistics:view', 'logistics:edit'
  ],
  coordinador: [
    'dashboard:view', 'donations:view', 'needs:view', 'needs:create', 'needs:edit',
    'logistics:view', 'logistics:edit', 'reports:view'
  ],
  donante: ['dashboard:view', 'donations:view', 'donations:create'],
  voluntario: ['dashboard:view', 'donations:view', 'logistics:view'],
};

function roleFromAzureToken(roles: string[] | undefined): UserRole | null {
  if (!roles || roles.length === 0) return 'donante';
  if (roles.includes('Admin')) return 'admin';
  if (roles.includes('ONG')) return 'coordinador';
  if (roles.includes('User')) return 'donante';
  return 'donante';
}

function buildUserProfile(account: AccountInfo, azureRoles: string[]): User {
  const role = roleFromAzureToken(azureRoles) || 'donante';
  const email = account.username || account.localAccountId || '';
  const name = account.name || email.split('@')[0];
  
  return {
    id: account.localAccountId || email,
    name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
    email,
    role,
    phone: '',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    permissions: ROLE_PERMISSIONS_MAP[role],
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionRegistered: boolean;
  login: () => Promise<void>;
  loginTraditional: (email: string, password: string) => Promise<void>;
  logout: (openPopup?: boolean) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: Permission) => boolean;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionRegistered: false,

      login: async () => {
        set({ isLoading: true, error: null });

        try {
          const accounts = msalInstance.getAllAccounts();
          if (accounts.length > 0) {
            const response = await msalInstance.acquireTokenSilent({
              ...loginRequest,
              account: accounts[0],
            });

            const account = response.account;
            const token = response.accessToken;
            const idTokenClaims = response.idTokenClaims as any;
            const azureRoles = idTokenClaims?.roles || [];

            if (!account) {
              throw new Error('No se pudo obtener la cuenta de Azure AD');
            }

            const user = buildUserProfile(account, azureRoles);

            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }

          await msalInstance.loginRedirect({
            ...loginRequest,
          });
        } catch (error) {
          console.error('Login error:', error);
          const message = error instanceof Error ? error.message : 'Error al iniciar sesión con Azure AD';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: message,
          });
        }
      },

      loginTraditional: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/v1/auth/login/traditional', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al iniciar sesión');
          }

          const data = await response.json();
          
          // Get user info from backend
          const userResponse = await fetch('/api/v1/auth/profile', {
            headers: {
              'Authorization': `Bearer ${data.accessToken}`,
            },
          });

          if (!userResponse.ok) {
            throw new Error('Error al obtener información del usuario');
          }

          const userData = await userResponse.json();

          set({
            user: {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role.toLowerCase(),
              phone: userData.phone || '',
              createdAt: userData.createdAt,
              lastLogin: new Date().toISOString(),
              permissions: ROLE_PERMISSIONS_MAP[userData.role.toLowerCase() as UserRole] || [],
            },
            token: data.accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Traditional login error:', error);
          const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: message,
          });
        }
      },

      checkAuth: async () => {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length === 0) {
          set({ isAuthenticated: false, user: null, token: null });
          return;
        }

        try {
          const response = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          });

          const account = response.account;
          const token = response.accessToken;
          const idTokenClaims = response.idTokenClaims as any;
          const azureRoles = idTokenClaims?.roles || [];

          if (!account) {
            set({ isAuthenticated: false, user: null, token: null });
            return;
          }

          const user = buildUserProfile(account, azureRoles);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Register session in backend (only once) - disabled temporarily
          // if (!get().sessionRegistered) {
          //   try {
          //     await requestJson('/auth/sessions/register', {
          //       method: 'POST',
          //       body: {
          //         device: getDeviceInfo(),
          //         browser: getBrowserInfo(),
          //         location: 'Unknown',
          //         ipAddress: 'Unknown'
          //       }
          //     });
          //     set({ sessionRegistered: true });
          //   } catch (sessionError) {
          //     console.warn('Failed to register session:', sessionError);
          //     // Don't fail auth if session registration fails
          //     set({ sessionRegistered: true });
          //   }
          // }
        } catch {
          set({ isAuthenticated: false, user: null, token: null, sessionRegistered: false });
        }
      },

      logout: async (openPopup = true) => {
        if (openPopup) {
          try {
            await msalInstance.logoutPopup();
          } catch {
          }
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          sessionRegistered: false,
        });
      },

      getAccessToken: async () => {
        const { user } = get();
        if (!user) return null;

        try {
          const accounts = msalInstance.getAllAccounts();
          if (accounts.length === 0) return null;

          const response = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          });

          set({ token: response.accessToken });
          return response.accessToken;
        } catch {
          return get().token;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      hasPermission: (permission: Permission) => {
        const { user } = get();
        if (!user) return false;
        return user.permissions.includes(permission);
      },

      updatePassword: async (password: string) => {
        set({ isLoading: true, error: null });

        try {
          const token = await get().getAccessToken();
          if (!token) {
            throw new Error('No autenticado');
          }

          const response = await fetch('/api/v1/auth/profile/password', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar contraseña');
          }

          set({ isLoading: false, error: null });
        } catch (error) {
          console.error('Update password error:', error);
          const message = error instanceof Error ? error.message : 'Error al actualizar contraseña';
          set({
            isLoading: false,
            error: message,
          });
          throw error;
        }
      },

      updateProfile: async (name: string) => {
        set({ isLoading: true, error: null });

        try {
          const token = await get().getAccessToken();
          if (!token) {
            throw new Error('No autenticado');
          }

          const response = await fetch('/api/v1/auth/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ name }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar perfil');
          }

          // Actualizar el nombre del usuario en el estado local
          set((state) => ({
            user: state.user ? { ...state.user, name } : null,
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          console.error('Update profile error:', error);
          const message = error instanceof Error ? error.message : 'Error al actualizar perfil';
          set({
            isLoading: false,
            error: message,
          });
          throw error;
        }
      }
    }),
    {
      name: 'donaton-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);