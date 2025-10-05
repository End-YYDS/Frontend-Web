// 共用資訊
export interface CommonInfo {
  // 根據你的 Rust 定義補上欄位，例如：
  // status: string;
  // message: string;
  // timestamp: string;
  // 你可以依實際 CommonInfo 結構補充
  [key: string]: any;
}

// 日誌結構
export interface Logs {
  // 根據 Rust 的 Logs 結構補上欄位，例如：
  // entries: LogEntry[];
  // 或其他欄位
  [key: string]: any;
}

// 狀態列舉
export type Status = "OK" | "ERROR" | string; // 可依實際擴充

// Apache API 回傳
export interface ApacheResponse {
  common_info: CommonInfo;
  Connections: number;
  Logs: Logs;
}
