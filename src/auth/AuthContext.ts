import { createContext } from 'react';
import type { AuthUser } from '@/api/openapi-client';

export interface AuthContextType {
  user: AuthUser | undefined;
  loading: boolean;
  refresh: () => Promise<void>;
  signIn: (u: AuthUser) => void;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: undefined,
  loading: true,
  refresh: async () => {},
  signIn: () => {},
  signOut: async () => {},
});
