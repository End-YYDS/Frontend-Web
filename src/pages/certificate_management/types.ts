// ---- Revoke 請求 ----
export interface RevokeRequest {
  /** 憑證名稱 */
  Name: string;
  /** 撤銷原因 */
  Reason: string;
}

// ---- 有效憑證 ----
export interface Valid {
  /** 憑證名稱 */
  Name: string;
  /** 簽發者 */
  Signer: string;
  /** 有效期間 */
  Period: string;
}

// ---- 有效憑證清單回傳 ----
export interface GetValids {
  /** 有效憑證列表 */
  Valid: Valid[];
  /** 總數 */
  Length: number;
}

// ---- 已撤銷憑證 ----
export interface Revoked {
  /** 憑證編號 */
  Number: string;
  /** 撤銷時間 */
  Time: string;
  /** 撤銷原因 */
  Reason: string;
}

// ---- 已撤銷憑證清單回傳 ----
export interface GetRevokeds {
  /** 撤銷憑證列表 */
  Revoke: Revoked[];
  /** 總數 */
  Length: number;
}
