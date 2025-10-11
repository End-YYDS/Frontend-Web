interface Time {
  Hour: number;
  Min: number;
}

interface SysLogsInfo {
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
  Time: Time;
  Direction: string;
  Type: string;
  Messages: string;
}

interface PcLogsInfo {
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
  Time: Time;
  Hostname: string;
  Type: string;
  Messages: string;
}

type SysLogs = Record<string, SysLogsInfo>;
// GetSysLogsQueryResponse
interface GetSysLogsResponse {
  Logs: SysLogs;
  Length: number;
}

interface GetSysLogsQueryRequest {
  Search: string;
  Parameter: string;
}

// interface GetSysLogsQueryResponse extends LogsId {
//   Length: number
// }

interface GetAllPcLogsResponse {
  Uuid: string;
  Length: number;
}

interface GetPcLogsRequest {
  Uuid: string;
}

type PcLogs = Record<string, PcLogsInfo>;
// GetPcLogsQueryResponse
interface GetPcLogsResponse {
  Logs: PcLogs;
  Length: number;
}

interface GetPcLogsQueryRequest {
  Uuid: string;
  Search: string;
  Parameter: string;
}

export type {
  SysLogs,
  PcLogs,
  Time,
  GetSysLogsResponse,
  GetSysLogsQueryRequest,
  GetAllPcLogsResponse,
  GetPcLogsRequest,
  GetPcLogsResponse,
  GetPcLogsQueryRequest,
};
