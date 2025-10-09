type Zone = "info" | "cluster";
type Target = "safe" | "warn" | "dang" | "Cpu" | "Memory" | "Disk";

interface  Info {
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

// 實際上後端 /api/info/get 回傳的應該是「多台電腦的資料」
// {
//   "Pcs": {
//     "PC-001": { "Cpu": 23, "Memory": 48, "Disk": 55 },
//     "PC-002": { "Cpu": 70, "Memory": 60, "Disk": 40 }
//   },
//   "Length": 2
// }
interface PostInfoGetResponse {
  Pcs: Record<string, Cluster>;
  Length: number;
}

// interface GetInfoConfig {

// }

export type {GetAllInfoResponse, PostInfoGetRequest, PostInfoGetResponse}