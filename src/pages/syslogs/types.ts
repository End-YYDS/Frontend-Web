// ======== PC Log ========

export interface PcLogEntry {
  Month: string;
  Day: number;
  Time: string;
  Hostname: string;
  Type: string;
  Messages: string;
}

export interface PcLogsResponse {
  Logs: Record<string, PcLogEntry>;
  Length: number;
}

export interface PcsResponse {
  Pcs: Record<string, string>; // uuid -> hostname
  Length: number;
}

export interface PcRequest {
  Uuid: string;
}

export interface PcLogQuery {
  Uuid: string;
  Search: string;
  Parameter: string;
}

// ======== System Log ========

export interface SysLogTime {
  Hour: number;
  Min: number;
}

export interface SysLogEntry {
  Month: string;
  Day: number;
  Time: SysLogTime;
  Direction: string;
  Type: string;
  Messages: string;
}

export interface SysLogsResponse {
  Logs: Record<string, SysLogEntry>;
  Length: number;
}

export interface SysLogQuery {
  Search: string;
  Parameter: string;
}
