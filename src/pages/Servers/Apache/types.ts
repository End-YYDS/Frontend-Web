// type ResultType = 'Ok' | 'Err';

// interface GetApacheRequest {
//   Uuid: string;
// }

// type InnerErrorLog = InnerErrorLogResponse[];
// type InnerAccessLog = InnerAccessLogResponse[];

// interface Time {
//   Hour: number;
//   Min: number;
// }

// interface Date {
//   Year: number;
//   Month:
//     | 'Jan'
//     | 'Feb'
//     | 'Mar'
//     | 'Apr'
//     | 'May'
//     | 'Jun'
//     | 'Jul'
//     | 'Aug'
//     | 'Sep'
//     | 'Oct'
//     | 'Nov'
//     | 'Dec';
//   Day: number;
//   Week: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
//   Time: Time;
// }

// interface InnerErrorLogResponse {
//   Date: Date;
//   Module: string;
//   Level: 'debug' | 'info' | 'notice' | 'warn' | 'error' | 'crit' | 'alert' | 'emerg';
//   Pid: number;
//   Client: string;
//   Message: string;
// }

// interface InnerAccessLogResponse {
//   Ip: string;
//   Date: Date;
//   Method: string;
//   Url: string;
//   Protocol: string;
//   Status: number;
//   Byte: number;
//   Referer: string;
//   UserAgent: string;
// }

// interface InnerLogs {
//   ErrorLog: InnerErrorLog;
//   ErrLength: number;
//   AccessLog: InnerAccessLog;
//   AccLength: number;
// }

// interface GetApacheResponse {
//   Hostname: string;
//   Status: 'active' | 'stopped' | 'uninstalled';
//   Cpu: number;
//   Memory: number;
//   Connections: number;
//   Logs: InnerLogs;
// }

// interface PostApacheActionRequest {
//   Uuid: string;
// }

// interface PostApacheActionResponse {
//   Type: ResultType;
//   Message: string;
// }

// // 取得online主機

// interface PcsUuid {
//   Status: boolean; //online: 1
//   Hostname: string;
//   Ip: string;
// }

// interface GetAllPcResponse {
//   Pcs: Record<string, PcsUuid>;
//   Length: number;
// }

// export type {
//   PcsUuid,
//   GetApacheRequest,
//   GetApacheResponse,
//   PostApacheActionRequest,
//   PostApacheActionResponse,
//   GetAllPcResponse,
// };
