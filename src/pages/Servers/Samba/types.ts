type ResultType = 'Ok' | 'Err';

interface GetSambaRequest {
  Uuid: string;
}

type InnerSambaLog = InnerSambaLogResponse[];
type Shares = InnerShares[];

interface InnerShares {
  Name: string;
  Path: string;
  Users: number;
  Permissions: string;
  Status: 'active' | 'inactive';
}

interface Time {
  Hour: number;
  Min: number;
}

interface Date {
  Year: number;
  Month:
    | 'Jan'
    | 'Feb'
    | 'Mar'
    | 'Apr'
    | 'May'
    | 'Jun'
    | 'Jul'
    | 'Aug'
    | 'Sep'
    | 'Oct'
    | 'Nov'
    | 'Dec';
  Day: number;
  Week: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  Time: Time;
}

interface InnerSambaLogResponse {
  Date: Date;
  Client: string;
  Event: string;
  Level: 'info' | 'warn' | 'error';
  Message: string;
}

interface InnerLogs {
  SambaLog: InnerSambaLog;
  SambaLength: number;
}

interface GetSambaResponse {
  Hostname: string;
  Status: 'active' | 'stopped';
  Cpu: number;
  Memory: number;
  Connections: number;
  Shares: Shares;
  Logs: InnerLogs;
}

interface PostSambaActionRequest {
  Uuid: string;
}

interface PostSambaActionResponse {
  Type: ResultType;
  Message: string;
}

// 取得online主機

interface PcsUuid {
  Status: boolean; //online: 1
  Hostname: string;
  Ip: string;
}

interface GetAllPcResponse {
  Pcs: Record<string, PcsUuid>;
  Length: number;
}

export type {
  PcsUuid,
  GetSambaRequest,
  GetSambaResponse,
  PostSambaActionRequest,
  PostSambaActionResponse,
  GetAllPcResponse,
};
