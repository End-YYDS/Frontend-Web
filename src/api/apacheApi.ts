import { api } from '@/lib/apiClient';
import type {
  GetApacheRequest,
  GetApacheResponse,
  PostApacheActionRequest,
  GetAllPcResponse,
} from '@/pages/Servers/Apache/types';
import type { CommonResponse } from '@/types';

export const apacheApi = {
  //TODO: 檢查{ data: payload }送出的是什麼
  getApache(pcUuid: string) {
    let payload: GetApacheRequest = { Uuid: pcUuid };
    return api.get<GetApacheResponse>('/server/apache', { params: payload });
  },

  startApache(payload: PostApacheActionRequest) {
    return api.post<CommonResponse>('/server/apache/action/start', payload);
  },

  stopApache(payload: PostApacheActionRequest) {
    return api.post<CommonResponse>('/server/apache/action/stop', payload);
  },

  restartApache(payload: PostApacheActionRequest) {
    return api.post<CommonResponse>('/server/apache/action/restart', payload);
  },

  getOnlinePCs() {
    return api.get<GetAllPcResponse>('/chm/pc/all');
  },
};
