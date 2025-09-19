import React, { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export interface User {
  id: string;
  role: string;
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
      const res = await axios.get<User>('/api/me', { withCredentials: true });
      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, []);

  const signIn = (u: User) => setUser(u);

  const signOut = async () => {
    try {
      await axios.post('/api/logout', null, { withCredentials: true });
    } catch {
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
  children: React.ReactNode;
}

/**
 * 路由層權限閘門：
 * - loading：顯示 Loading
 * - 未登入：導向 /login（保留 from 以便登入成功導回）
 * - 無角色權限：導向 /unauthorized
 * - 通過：渲染 children
 */
export function RequireAuth({ allowedRoles, children }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>驗證中…</div>;
  if (!user) return <Navigate to='/login' state={{ from: location }} replace />;

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to='/unauthorized' replace />;
  }
  return <>{children}</>;
}
