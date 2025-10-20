type ResultType = 'Ok' | 'Err';
type QueryType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'NS' | 'PTR' | 'SOA' | 'TXT' | 'SRV' | 'DNSKEY';

interface GetBindRequest {
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
  Client: string;
  Date: Date;
  Query: string;
  Type: QueryType;
  Response: string;
  Status: 'NOERROR' | 'NXDOMAIN' | 'SERVFAIL' | 'REFUSED';
  Duration: number;
}

interface InnerQueries {
  Total: number;
  Success: number;
  NXDOMAIN: number;
  REFUSED: number;
}

interface InnerLogs {
  ErrorLog: InnerErrorLog;
  ErrLength: number;
  QueryLog: InnerQueryLog;
  QryLength: number;
}

interface GetBindResponse {
  Hostname: string;
  Status: 'active' | 'stopped';
  Cpu: number;
  Memory: number;
  Connections: number;
  Queries: InnerQueries;
  Logs: InnerLogs;
}

interface PostBindActionRequest {
  Uuid: string;
}

interface PostBindActionResponse {
  Type: ResultType;
  Message: string;
}

// 取的online主機
type Zone = 'info' | 'cluster';
type Target = 'safe' | 'warn' | 'dang' | 'Cpu' | 'Memory' | 'Disk';

interface Cluster {
  Cpu: number;
  Memory: number;
  Disk: number;
}

interface PostInfoGetRequest {
  Zone: Zone;
  Target: Target;
  // null 代表全部，string 代表指定主機
  Uuid?: string | null;
}

interface PostInfoGetResponse {
  Pcs: Record<string, Cluster>;
  Length: number;
}

export type {
  GetBindRequest,
  GetBindResponse,
  PostBindActionRequest,
  PostBindActionResponse,
  PostInfoGetRequest,
  PostInfoGetResponse,
};
