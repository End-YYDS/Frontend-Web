type ResultType = 'Ok' | 'Err';

interface GetApacheRequest {
  Uuid: string;
}

type InnerErrorLog = InnerErrorLogResponse[];
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

interface InnerErrorLogResponse extends Date {
  Module: string;
  Level: 'debug' | 'info' | 'notice' | 'warn' | 'error' | 'crit' | 'alert' | 'emerg';
  Pid: number;
  Client: string;
  Message: string;
}

interface InnerAccessLogResponse extends Date {
  Ip: string;
  Method: string;
  Url: string;
  Protocol: string;
  Status: number;
  Byte: number;
  Referer: string;
  UserAgent: string;
}

interface InnerLogs {
  ErrorLog: InnerErrorLog;
  ErrLength: number;
  AccessLog: InnerAccessLog;
  AccLength: number;
}

interface GetApacheResponse {
  Hostname: string;
  Status: 'active' | 'stopped';
  Cpu: number;
  Memory: number;
  Connections: number;
  Logs: InnerLogs;
}

interface PostApacheActionRequest {
  Uuid: string;
}

interface PostApacheActionResponse {
  Type: ResultType;
  Message: string;
}

export type {
  GetApacheRequest,
  GetApacheResponse,
  PostApacheActionRequest,
  PostApacheActionResponse,
};