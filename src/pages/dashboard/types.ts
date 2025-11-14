type Zone = 'info' | 'cluster';
type Target = 'safe' | 'warn' | 'dang' | 'Cpu' | 'Memory' | 'Disk';

interface Info {
  Safe: number;
  Warn: number;
  Dang: number;
}

interface Cluster {
  Cpu: number;
  Memory: number;
  Disk: number;
}

interface GetAllInfoResponse {
  Info: Info;
  Cluster: Cluster;
}

interface PostInfoGetRequest {
  Zone: Zone;
  Target: Target;
  // null 代表全部，string 代表指定主機
  Uuid?: string | null;
}

interface PostInfoGetResponse {
  Pcs: Record<string, Cluster>;
  Length: number;
}

export type { GetAllInfoResponse, PostInfoGetRequest, PostInfoGetResponse };
