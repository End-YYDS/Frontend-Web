type ResultType = 'Ok' | 'Err';

interface PostAddPcRequest {
  Ip: string;
  Password: string;
}

interface ResponseResult {
  Type: ResultType;
  Message: string;
}

interface PcsUuid {
  Status: boolean;
  Hostname: string;
  Ip: string;
}

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
  Pcs: Record<string, ResponseResult>;
  Length: number;
}

interface PostPcActionRequest {
  Uuids: string[];
}

interface Vxlanid {
  Groupname: string;
  Pcs: string[];
}

interface GetPcgroupResponse {
  Groups: Record<string, Vxlanid>;
  Length: number;
}

interface PostPcgroupRequest {
  Groupname: string;
  Cidr: string;
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
