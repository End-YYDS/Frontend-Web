import { api } from '@/lib/apiClient';
import type { GetRevokeds, GetValids, RevokeRequest } from '@/pages/certificate_management/types';
export const mcaApi = {
  getValidCerts() {
    return api.get<GetValids>('/chm/mCA/valid');
  },

  getRevokedCerts() {
    return api.get<GetRevokeds>('/chm/mCA/revoked');
  },

  revokeCert(payload: RevokeRequest) {
    return api.post('/chm/mCA/revoke', payload);
  },
};
