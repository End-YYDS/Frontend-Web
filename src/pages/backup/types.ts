type BackupLocation = 'Local' | 'Remote';
type ResultType = 'Ok' | 'Err';
type PostBackupReductionRequest =
  | {
      Type: 'Local';
      Name: string;
    }
  | {
      Type: 'Remote';
      File: string | Blob;
    };
type InnerBackups = InnerGetBackupResponse[];

interface PostBackupRequest {
  Type: BackupLocation;
  Name: string;
}

interface PostBackupResponse {
  Type: ResultType;
  Message: string;
  Id: string;
  DownloadUrl: string;
}

interface GetBackupRequest {
  /** Limit (預設值 5) */
  Limit: number;
}

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

interface InnerGetBackupResponse extends Date {
  Name: string;
}

interface GetBackupsResponse {
  Backups: InnerBackups;
  Length: number;
}

interface PostBackupReductionResponse {
  Type: ResultType;
  Message: string;
}

export type {
  BackupLocation,
  InnerBackups,
  InnerGetBackupResponse,
  PostBackupRequest,
  PostBackupResponse,
  GetBackupRequest,
  GetBackupsResponse,
  PostBackupReductionRequest,
  PostBackupReductionResponse,
};
