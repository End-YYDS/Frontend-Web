type ResultType = 'Ok' | 'Err';

interface GetProftpdRequest {
  Uuid: string;
}

type InnerErrorLog = InnerErrorLogResponse[];
type InnerAccessLog = InnerAccessLogResponse[];
type Sessions = InnerSessions[];

interface LoginTime {
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
  Hour: number;
  Min: number;
}

interface Transfer {
  Type: 'Upload' | 'Download';
  File: string;
  Size: number;
  Speed: number;
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

interface InnerSessions {
  Ip: string;
  Username: string;
  LoginTime: LoginTime;
  CurrentDir: string;
  Status: 'Idle' | 'Uploading' | 'Downloading' | 'Disconnected';
  Transfer: Transfer;
}

interface InnerErrorLogResponse {
  Date: Date;
  Module: string;
  Level: 'debug' | 'info' | 'notice' | 'warn' | 'error' | 'crit' | 'alert' | 'emerg';
  Pid: number;
  Client: string;
  Message: string;
}

interface InnerAccessLogResponse {
  Ip: string;
  Date: Date;
  Username: string;
  Action: 'Login' | 'Logout' | 'Upload' | 'Download' | 'Delete' | 'Rename';
  File: string;
  Size: number;
  Status: 'Success' | 'Failed';
}

interface InnerLogs {
  ErrorLog: InnerErrorLog;
  ErrLength: number;
  AccessLog: InnerAccessLog;
  AccLength: number;
}

interface GetProftpdResponse {
  Hostname: string;
  Status: 'active' | 'stopped';
  Cpu: number;
  Memory: number;
  Connections: number;
  Sessions: Sessions;
  Logs: InnerLogs;
}

interface PostProftpdActionRequest {
  Uuid: string;
}

interface PostProftpdActionResponse {
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
  GetProftpdRequest,
  GetProftpdResponse,
  PostProftpdActionRequest,
  PostProftpdActionResponse,
  GetAllPcResponse,
};
