// 對應 Rust crate::commons::ResponseResult
export interface ResponseResult {
  type: string; // ResponseType (e.g., "Ok" / "Error")
  message: string;
}

// === PCManager ===
// Post /api/chm/pc/add
export interface PCManagerRequest {
  Ip: string;
  Password: string;
}

export interface Uuid {
  Hostname: string;
  Ip: string;
}

export interface PcInformation {
  Pcs: Record<string, Uuid>;
  Length: number;
}

export interface SpecificRequest {
  Uuid: string[];
}

export interface DeletePcRequest {
  Uuids: string[];
  Passwords: string[];
}

export interface DeletePcResponse {
  uuids: Record<string, ResponseResult>;
}

export interface UuidsRequest {
  Uuids: string[];
}

// === PC Group ===
// Post /api/chm/pcgroup
export interface PostPcgroupRequest {
  Groupname: string;
  Describe: string;
}

// Put /api/chm/pcgroup
export interface Vxlanid {
  Groupname: string;
  Pcs: string[];
}

export interface Groups {
  vxlanid: Vxlanid;
}

export interface GetPcgroupResponseResult {
  Groups: Groups;
  Length: number;
}

export interface DePutVxlanid {
  Groupname: string;
  Pcs: string[];
}

export interface PutPcgroupRequest {
  vxlanid: DePutVxlanid;
}

export interface DePatchVxlanid {
  Groupname: string;
}

export interface PatchPcgroupRequest {
  vxlanid: DePatchVxlanid;
}

export interface DeletePcGroupRequest {
  Vxlanid: number;
}
