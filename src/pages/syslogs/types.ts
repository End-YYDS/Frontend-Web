interface Time {
  Hour: number,
  Min: number
}

interface SysLogsId {
  Month: "Jan"|"Feb"|"Mar"|"Apr"|"May"|"Jun"|"Jul"|"Aug"|"Sep"|"Oct"|"Nov"|"Dec",
  Day: number,
  Time: Time,
  Direction: string,
  Type: string,
  Messages: string
}

interface PcLogsId {
  Month: "Jan"|"Feb"|"Mar"|"Apr"|"May"|"Jun"|"Jul"|"Aug"|"Sep"|"Oct"|"Nov"|"Dec",
  Day: number,
  Time: Time,
  Hostname: string,
  Type: string,
  Messages: string
}

// GetSysLogsQueryResponse
interface GetSysLogsResponse extends SysLogsId {
  Length: number
}

interface GetSysLogsQueryRequest {
  Search: string,
  Parameter: string
}

// interface GetSysLogsQueryResponse extends LogsId {
//   Length: number
// }

interface GetAllPcLogsResponse {
  Uuid: string,
  Length: number
}

interface GetPcLogsRequest {
  Uuid: string
}

// GetPcLogsQueryResponse
interface GetPcLogsResponse extends PcLogsId {
  Length: number
}

interface GetPcLogsQueryRequest {
  Uuid: string,
  Search: string,
  Parameter: string
}

export type {Time, GetSysLogsResponse, GetSysLogsQueryRequest, GetAllPcLogsResponse, GetPcLogsRequest, GetPcLogsResponse, GetPcLogsQueryRequest}
