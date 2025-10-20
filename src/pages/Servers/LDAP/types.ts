type ResultType = 'Ok' | 'Err';

interface GetLdapRequest {
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
  Method:
    | 'BIND'
    | 'SEARCH'
    | 'ADD'
    | 'DELETE'
    | 'MODIFY'
    | 'MODDN'
    | 'COMPARE'
    | 'UNBIND'
    | 'EXTENDED';
  BaseDN: string;
  Filter: string;
  Protocol: 'LDAPv2' | 'LDAPv3';
  Status: 'Success' | 'AuthFailed' | 'NotFound' | 'Error';
  ResponseTimeMs: number;
}

interface InnerLogs {
  ErrorLog: InnerErrorLog;
  ErrLength: number;
  AccessLog: InnerAccessLog;
  Acclength: number;
}

interface GetLdapResponse {
  Hostname: string;
  Status: 'active' | 'stopped';
  Cpu: number;
  Memory: number;
  Connections: number;
  Entries: number;
  Logs: InnerLogs;
}

interface PostLdapActionRequest {
  Uuid: string;
}

interface PostLdapActionResponse {
  Type: ResultType;
  Message: string;
}

// 取的online主機

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
  GetLdapRequest,
  GetLdapResponse,
  PostLdapActionRequest,
  PostLdapActionResponse,
  GetAllPcResponse,
};
