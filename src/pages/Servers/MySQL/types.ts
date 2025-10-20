type ResultType = 'Ok' | 'Err';

interface GetMysqlRequest {
  Uuid: string;
}

type InnerErrorLog = InnerErrorLogResponse[];
type InnerQueryLog = InnerQueryLogResponse[];

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

interface InnerQueryLogResponse {
  Ip: string;
  Date: Date;
  User: string;
  Database: string;
  Query: string;
  QueryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'DROP' | 'ALTER';
  DurationMs: number;
  Status: 'Success' | 'Error' | 'Timeout';
  AffectedRows: number;
}

interface InnerLogs {
  ErrorLog: InnerErrorLog;
  ErrLength: number;
  LeaseLog: InnerQueryLog;
  LeaseLength: number;
}

interface GetMysqlResponse {
  Hostname: string;
  Status: 'active' | 'stopped';
  Cpu: number;
  Memory: number;
  Connections: number;
  Databases: number;
  QueriesPerSec: number;
  Logs: InnerLogs;
}

interface PostMysqlActionRequest {
  Uuid: string;
}

interface PostMysqlActionResponse {
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
  GetMysqlRequest,
  GetMysqlResponse,
  PostMysqlActionRequest,
  PostMysqlActionResponse,
  GetAllPcResponse,
};
