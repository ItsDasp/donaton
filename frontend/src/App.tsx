import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { MainLayout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DonationsPage } from './pages/DonationsPage';
import { NeedsPage } from './pages/NeedsPage';
import { LogisticsPage } from './pages/LogisticsPage';
import { UsersPage } from './pages/UsersPage';
import { ForgotPassword } from './pages/ForgotPassword';
import { SettingsPage } from './pages/SettingsPage';
import type { Permission } from './types';

function ProtectedRoute({ children, requiredPermission }: { children: React.ReactNode; requiredPermission?: Permission }) {
  const { isAuthenticated, token, hasPermission } = useAuthStore();

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/" replace />;
  }
  
  return <MainLayout>{children}</MainLayout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      
      <Route path="/" element={
        <ProtectedRoute requiredPermission="dashboard:view">
          <DashboardPage />
        </ProtectedRoute>
      } />
      
      <Route path="/donations" element={
        <ProtectedRoute requiredPermission="donations:view">
          <DonationsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/needs" element={
        <ProtectedRoute requiredPermission="needs:view">
          <NeedsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/logistics" element={
        <ProtectedRoute requiredPermission="logistics:view">
          <LogisticsPage />
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute requiredPermission="users:manage">
          <UsersPage />
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />

      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}