import { api } from '@/lib/apiClient';
import type {
  GetAllInfoResponse,
  PostInfoGetRequest,
  PostInfoGetResponse,
} from '@/pages/dashboard/types';

export const infoApi = {
  getAllInfo() {
    return api.get<GetAllInfoResponse>('/info/getAll');
  },
  getPcs(body: PostInfoGetRequest) {
    return api.post<PostInfoGetResponse>('/info/get', body);
  },
};
