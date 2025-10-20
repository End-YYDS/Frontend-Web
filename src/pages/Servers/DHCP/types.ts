type ResultType = 'Ok' | 'Err';

interface GetDhcpRequest {
  Uuid: string;
}

type InnerErrorLog = InnerErrorLogResponse[];
type InnerLeaseLog = InnerLeaseLogResponse[];

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

interface InnerLeaseLogResponse {
  ClientIp: string;
  Mac: string;
  Date: Date;
  Action: 'offer' | 'ack' | 'decline' | 'release' | 'inform';
  LeaseTime: number;
  ServerIp: string;
  Message: string;
}

interface InnerLogs {
  ErrorLog: InnerErrorLog;
  ErrLength: number;
  LeaseLog: InnerLeaseLog;
  LeaseLength: number;
}

interface GetDhcpResponse {
  Hostname: string;
  Status: 'active' | 'stopped';
  Cpu: number;
  Memory: number;
  Leases: number;
  Logs: InnerLogs;
}

interface PostDhcpActionRequest {
  Uuid: string;
}

interface PostDhcpActionResponse {
  Type: ResultType;
  Message: string;
}

export type { GetDhcpRequest, GetDhcpResponse, PostDhcpActionRequest, PostDhcpActionResponse };
