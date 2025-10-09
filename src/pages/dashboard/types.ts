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

interface InnerUuid extends Cluster {}
interface Pcs extends InnerUuid {}

//TODO: 詢問寫法
interface PostInfoGetResponse extends Pcs {
  Pcs(Pcs: any): unknown;
  Length: number;
}

// interface GetInfoConfig {

// }

export type {Info, Cluster, InnerUuid, Pcs, GetAllInfoResponse, PostInfoGetRequest, PostInfoGetResponse}

// --------------------------------------------


// export interface InfoGetResponse {
//   Pcs: Record<string, PcMetrics>;
//   Length: number;
// }
