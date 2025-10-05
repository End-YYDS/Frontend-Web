// 對應到 Rust 中的 `commons::{Date, ResponseResult}`
export interface Date {
  year: number
  month: number
  day: number
  hour?: number
  minute?: number
  second?: number
}

export interface ResponseResult {
  success: boolean
  message?: string
}

// -------------------------
// BackupLocation
// -------------------------
export type BackupLocation = "Local" | "Remote"

// -------------------------
// BackupRequest
// -------------------------
export interface BackupRequest {
  /** Type: "Local" | "Remote" */
  Type: BackupLocation
  /** Name */
  Name: string
}

// -------------------------
// BackupResponse
// -------------------------
export interface BackupResponse extends ResponseResult {
  /** Id (存在於 Local 備份，Remote 時為 null) */
  Id?: string
  /** DownloadUrl (存在於 Local 備份，Remote 時為 null) */
  DownloadUrl?: string
}

// -------------------------
// InnerGetBackupResponse
// -------------------------
export interface InnerGetBackupResponse extends Date {
  /** Name */
  Name: string
}

// -------------------------
// GetBackupsRequest
// -------------------------
export interface GetBackupsRequest {
  /** Limit (預設值 5) */
  Limit?: number
}

// -------------------------
// GetBackupsResponse
// -------------------------
export interface GetBackupsResponse {
  /** Backups */
  Backups: InnerGetBackupResponse[]
  /** Length */
  Length: number
}

// -------------------------
// ReductionRequest (Discriminated Union)
// -------------------------
export type ReductionRequest =
  | {
      Type: "Remote"
      /** Name */
      Name: string
    }
  | {
      Type: "Local"
      /** File */
      File: string
    }
