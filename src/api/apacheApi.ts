import { api } from '@/lib/apiClient';
import type {
  GetApacheRequest,
  GetApacheResponse,
  PostApacheActionRequest,
  GetAllPcResponse,
} from '@/pages/Servers/Apache/types';
import type {
  CommonResponse,
  GetServerRequest,
  GetInstalledServerResponse,
  GetUninstalledServerResponse,
  PostInstallServerRequest,
} from '@/types';

export const apacheApi = {
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

  getInstalled(server: string) {
    let payload: GetServerRequest = { Server: server };
    return api.get<GetInstalledServerResponse>('/server/installed', {params: payload});
  },

  getUninstalled(server: string) {
    let payload: GetServerRequest = { Server: server };
    return api.get<GetUninstalledServerResponse>('/server/noinstall', {params: payload});
  },

  installServer(payload: PostInstallServerRequest) {
    return api.post<CommonResponse>('/server/install', payload);
  },

  getOnlinePCs() {
    return api.get<GetAllPcResponse>('/chm/pc/all');
  },
};
