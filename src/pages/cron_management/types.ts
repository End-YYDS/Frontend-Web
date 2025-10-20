export interface Schedule {
  Minute: number;   // 分
  Hour: number;     // 時
  Date: number;     // 日
  Month: number;    // 月
  Week: number;     // 週
}

export interface CronJobEntry {
  Name: string;            // 任務名稱
  Command: string;         // 執行指令
  Schedule: Schedule;      // 時間排程
  Username: string;        // 使用者名稱
}

export interface GetAllResponse {
  Jobs: Record<string, CronJobEntry>; // 以 id 為 key 的所有排程任務
  length: number;                     // 總數
}

// POST /api/cron
export type CreateCronRequest = CronJobEntry;

// DELETE /api/cron
export interface DeleteCronRequest {
  id: string;                          // 要刪除的任務 id
}

// PUT /api/cron — 以 id 做 key 的整筆更新
export interface PutCronRequest {
  [id: string]: CronJobEntry;          // 以 id 為 key 的更新內容
}
