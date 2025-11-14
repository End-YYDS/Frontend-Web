import { api } from '@/lib/apiClient';
import type { CommonResponse } from '@/types';

export interface User {
  id: string;
  role: string;
  username: string;
}

export const authApi = {
  me() {
    return api.get<User>('/login/me');
  },

  logout() {
    return api.post('/logout', null);
  },

  login(username: string, password: string) {
    return api.post<CommonResponse>('/login', { Username: username, Password: password });
  },
};
