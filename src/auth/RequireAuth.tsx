import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RequireAuthProps {
  allowedRoles?: string[];
}

export function RequireAuth({ allowedRoles }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  // console.log('[RequireAuth] render', {
  //   loading,
  //   user,
  //   path: location.pathname,
  //   allowedRoles,
  // });
  if (loading) return <div>驗證中…</div>;
  if (!user) return <Navigate to='/login' state={{ from: location }} replace />;

  const role = user.Role;
  if (allowedRoles?.length) {
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to='/unauthorized' replace />;
    }
  }

  return <Outlet />;
}
