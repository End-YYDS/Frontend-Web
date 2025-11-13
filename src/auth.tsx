import React, { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import { toast } from 'sonner';
import { eventBus } from './lib/EventBus';

export interface User {
  id: string;
  role: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signIn: (u: User) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  signIn: () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await authApi.me();
      setUser(res.data);
    } catch (err) {
      console.error('Failed to refresh user:', err);
      setUser(null);
    }
  };

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const offUnauthorized = eventBus.on('auth:unauthorized', () => {
      setUser(null);
      toast.error('登入已失效', {
        description: '請重新登入後再繼續操作。',
      });
    });

    const offForbidden = eventBus.on('auth:forbidden', () => {
      toast.error('沒有權限執行此操作');
    });

    return () => {
      offUnauthorized();
      offForbidden();
    };
  }, []);

  const signIn = (u: User) => setUser(u);

  const signOut = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, refresh, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}

interface RequireAuthProps {
  allowedRoles?: string[];
}

/**
 * 路由層權限閘門：
 * - loading：顯示 Loading
 * - 未登入：導向 /login（保留 from 以便登入成功導回）
 * - 無角色權限：導向 /unauthorized
 * - 通過：渲染 children
 */
export function RequireAuth({ allowedRoles }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>驗證中…</div>;
  if (!user) return <Navigate to='/login' state={{ from: location }} replace />;

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to='/unauthorized' replace />;
  }
  return <Outlet />;
}
