import React, { useState, useEffect } from 'react';
import { logout, me } from '@/api/openapi-client';
import type { AuthUser } from '@/api/openapi-client';
import { eventBus } from '@/events/EventBus';

import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    console.log('[AuthProvider] refresh() called');
    try {
      const res = await me();
      if (!res.data || typeof res.data !== 'object' || Array.isArray(res.data)) {
        throw new Error('Invalid /login/me response');
      }
      console.log('[AuthProvider] me() ok', res.data);
      setUser(res.data);
    } catch (err) {
      console.log('[AuthProvider] me() failed', err);
      setUser(undefined);
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
      setUser(undefined);
    });
    return () => offUnauthorized();
  }, []);

  const signIn = (u: AuthUser) => setUser(u);

  const signOut = async () => {
    try {
      await logout();
    } finally {
      setUser(undefined);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, refresh, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
