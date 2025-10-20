type ResultType = 'Ok' | 'Err';

interface GetSquidRequest {
  Uuid: string;
}

type InnerAccessLog = InnerAccessLogResponse[];

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

interface InnerAccessLogResponse {
  Ip: string;
  Date: Date;
  Method: string;
  Url: string;
  Status: number;
  BytesServed: number;
  Referer: string;
  UserAgent: string;
}

interface InnerLogs {
  AccessLog: InnerAccessLog;
  AccLength: number;
}

interface GetSquidResponse {
  Hostname: string;
  Status: 'active' | 'stopped';
  Cpu: number;
  Memory: number;
  Connections: number;
  CacheHits: number;
  CacheMisses: number;
  RequestsProcessed: number;
  Logs: InnerLogs;
}

interface PostSquidActionRequest {
  Uuid: string;
}

interface PostSquidActionResponse {
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
  GetSquidRequest,
  GetSquidResponse,
  PostSquidActionRequest,
  PostSquidActionResponse,
  GetAllPcResponse,
};
