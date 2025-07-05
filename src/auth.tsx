import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// 根据你的后端返回结构调整
interface User {
  id: string;
  role: string;
  // …其他字段
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

/**
 * 在根组件挂载一次，负责从 /api/me 获取当前登录用户
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('未登录');
        return res.json();
      })
      .then((data: User) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

/** 方便在其它组件里读取 user/loading */
export function useAuth() {
  return useContext(AuthContext);
}

interface RequireAuthProps {
  allowedRoles?: string[];
  children: ReactNode;
}

/**
 * 路由权限拦截：
 * - loading：显示骨架或 loading
 * - 未登录：跳到 /login
 * - 登录但无角色权限：跳到 /unauthorized
 * - 通过则渲染子组件
 */
export function RequireAuth({ allowedRoles, children }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>驗證中…</div>;
  }

  if (!user) {
    // 未登录，跳到登录页，并记录当前地址以便登录后跳回
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(user.role)) {
    // 无权限
    return <Navigate to='/unauthorized' replace />;
  }

  return <>{children}</>;
}
