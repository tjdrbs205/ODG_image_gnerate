import { Navigate, Outlet } from 'react-router-dom';
import { getAccessToken } from '../lib/auth';

export function ProtectedRoute() {
  const authed = Boolean(getAccessToken());
  if (!authed) return <Navigate to="/login" replace />;
  return <Outlet />;
}
