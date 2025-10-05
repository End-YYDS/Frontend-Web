// ========== vdir ==========

export interface VdirResponse {
  Path: string;
}

export interface DownloadRequestVdir {
  Filename: string;
}

// ========== pdir ==========

export interface PcsResponse {
  Pcs: Record<string, string>; // uuid -> hostname
  Length: number;
}

export interface GetOneRequest {
  uuid: UuidDir;
}

export interface UuidDir {
  Directory: string;
}

export interface FileEntry {
  Size: number;
  Unit: FileUnit;
  Owner: string;
  Mode: string;
  Modified: string;
}

export type FileUnit = "B" | "KB" | "MB" | "GB";

export interface FilesResponse {
  Files: Record<string, FileEntry>;
  Length: number;
}

export interface DownloadRequestPdir {
  Uuid: string;
  Filename: string;
}

export interface UploadRequest {
  Uuid: string;
}
