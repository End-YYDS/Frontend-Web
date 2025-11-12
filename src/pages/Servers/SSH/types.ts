type ResultType = 'Ok' | 'Err';

interface GetSshRequest {
  Uuid: string;
}

type InnerAuthLog = InnerAuthLogResponse[];

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

interface LastLogin {
  User: string;
  Date: Date;
  Ip: string;
}

interface InnerAuthLogResponse {
  Date: Date;
  User: string;
  Action: 'login' | 'logout' | 'failed_login';
  Result: 'success' | 'failure';
  Ip: string;
  Message: string;
}

interface InnerLogs {
  AuthLog: InnerAuthLog;
  AuthLength: number;
}

interface GetSshResponse {
  Hostname: string;
  Status: 'active' | 'stopped';
  Cpu: number;
  Memory: number;
  Connections: number;
  LastLogin: LastLogin;
  Logs: InnerLogs;
}

interface PostSshActionRequest {
  Uuid: string;
}

interface PostSshActionResponse {
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
  GetSshRequest,
  GetSshResponse,
  PostSshActionRequest,
  PostSshActionResponse,
  GetAllPcResponse,
};
