type ResultType = 'Ok' | 'Err';

interface PostAddPcRequest {
  Ip: string;
  Password: string;
}

// Post /api/chm/pc/add
// Delete /api/chm/pc
// Post /api/chm/pc/reboot
// Post /api/chm/pc/shutdown
// Post、Put、Patch、Delete /api/chm/pcgroup
interface ResponseResult {
  Type: ResultType;
  Message: string;
}

interface PcsUuid {
  Hostname: string;
  Ip: string;
}

// Get /api/chm/pc/specific
interface GetAllPcResponse {
  Pcs: Record<string, PcsUuid>;
  Length: number;
}

interface GetSpecificPcRequest {
  Uuid: string[];
}

interface DeletePcRequest {
  Uuids: string[];
  Passwords: string[];
}

interface DeletePcResponse {
  Uuid: ResponseResult;
}

// Post /api/chm/pc/reboot
// Post /api/chm/pc/shutdown
interface PostPcActionRequest {
  Uuids: string[];
}

// === PC Group ===

interface Vxlanid {
  Groupname: string;
  Pcs: string[];
}

interface GetPcgroupResponse {
  Groups: Vxlanid;
  Length: number;
}

interface PostPcgroupRequest {
  Groupname: string;
  Describe: string;
}

interface PutPcgroupRequest {
  Vxlanid: Vxlanid;
}

interface PatchVxlanid {
  Groupname: string;
}

interface PatchPcgroupRequest {
  vxlanid: PatchVxlanid;
}

interface DeletePcGroupRequest {
  Vxlanid: number;
}

export type {
  PostAddPcRequest,
  ResponseResult,
  GetAllPcResponse,
  GetSpecificPcRequest,
  DeletePcRequest,
  DeletePcResponse,
  PostPcActionRequest,
  GetPcgroupResponse,
  PostPcgroupRequest,
  PutPcgroupRequest,
  PatchPcgroupRequest,
  DeletePcGroupRequest,
};
