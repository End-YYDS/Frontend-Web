type ResultType = 'Ok' | 'Err';

interface UuidDir {
  Directory: string;
}

interface InnerFilename {
  Size: number;
  Unit: 'B' | 'KB' | 'MB' | 'GB';
  Owner: string;
  Mode: string;
  Modified: string;
}

interface GetPdirFileResponse {
  Pcs: Record<string, string>;
  Length: number;
}

interface GetOnePdirFileRequest {
  uuid: UuidDir;
}

interface GetOnePdirFileResponse {
  Files: Record<string, InnerFilename>;
  Length: number;
}

interface PostUploadFileRequest {
  Uuid: string;
  Path: string;
  // "File": [file]
}

interface PostDownloadPdirFileRequest {
  Uuid: string;
  Filename: string;
}

// Post /api/file/pdir/action/upload
// Post /api/file/pdir/action/download
// Post /api/file/vdir/action/upload
// Post /api/file/vdir/action/download
interface PostFileActionResponse {
  Type: ResultType;
  Message: string;
}

interface GetVdirFileResponse {
  Path: string;
}

interface PostDownloadVdirFileRequest {
  Filename: string;
}

export type {
  GetPdirFileResponse,
  GetOnePdirFileRequest,
  GetOnePdirFileResponse,
  PostUploadFileRequest,
  PostFileActionResponse,
  PostDownloadPdirFileRequest,
  GetVdirFileResponse,
  PostDownloadVdirFileRequest
};