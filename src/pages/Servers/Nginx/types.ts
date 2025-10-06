// 通用資訊 CommonInfo
export interface CommonInfo {
  Hostname: string;
  IP: string;
  Status: string;
  Timestamp: string;
}

// Nginx 連線資訊
export interface Connections {
  Active: number;
  Reading: number;
  Writing: number;
  Waiting: number;
  Accepted: number;
  Handled: number;
  Requests: number;
}

// Nginx 日誌
export interface LogEntry {
  Time: string;
  Level: string;
  Message: string;
}

export interface Logs {
  [key: string]: LogEntry;
}

// Nginx 回應資料
export interface NginxResponse {
  // 對應 #[serde(flatten)] 的 CommonInfo
  common_info: CommonInfo;

  // 對應 #[serde(rename = "Connections")]
  Connections: Connections;

  // 對應 #[serde(rename = "Logs")]
  Logs: Logs;
}
