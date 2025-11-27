import { api } from '@/lib/apiClient';
import type {
  GetAllInfoResponse,
  PostInfoGetRequest,
  PostInfoGetResponse,
} from '@/pages/dashboard/types';
import type {
  GetApacheRequest,
  GetApacheResponse,
} from '@/pages/Servers/Apache/types';

export const infoApi = {
  getAllInfo() {
    return api.get<GetAllInfoResponse>('/info/getAll');
  },
  getPcs(body: PostInfoGetRequest) {
    return api.post<PostInfoGetResponse>('/info/get', body);
  },
  getApache(pcUuid: string) {
    let payload: GetApacheRequest = { Uuid: pcUuid };
    return api.get<GetApacheResponse>('/server/apache', { params: payload });
  },
};