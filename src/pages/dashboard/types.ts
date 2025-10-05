export interface InfoCounts {
  Safe: number;
  Warn: number;
  Dang: number;
}

export interface ClusterSummary {
  Cpu: number;
  Memory: number;
  Disk: number;
}

export interface GetAllInfoResponse {
  Info: InfoCounts;
  Cluster: ClusterSummary;
}

// --------------------------------------------

export type Zone = "info" | "cluster";

export type Target = "safe" | "warn" | "dang" | "Cpu" | "Memory" | "Disk";

export interface InfoGetRequest {
  Zone: Zone;
  Target: Target;
  // null 代表全部，string 代表指定主機
  Uuid?: string | null;
}

// --------------------------------------------

export interface PcMetrics {
  Cpu: number;
  Memory: number;
  Disk: number;
}

export interface InfoGetResponse {
  Pcs: Record<string, PcMetrics>;
  Length: number;
}
