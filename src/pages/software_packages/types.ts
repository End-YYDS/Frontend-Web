// ---------------------------
// Package 安裝狀態
// 字串 union type 取代 enum
export type PackageStatus = "Installed" | "Notinstall";

// 單一套件資訊
export interface PackageInfo {
  Version: string;          // 對應 Rust 的 version
  Status: PackageStatus;    // 對應 Rust 的 status
}

// 單一 PC 的所有套件
export interface PcPackages {
  Packages: Record<string, PackageInfo>; // package name -> info
}

// GET /api/software 回應
export interface GetSoftwareResponse {
  Pcs: Record<string, PcPackages>; // uuid -> PcPackages
}

// ---------------------------
// POST /api/software 請求
export interface InstallRequest {
  uuid: string[];         // 目標 PC UUID
  Packages: string[];     // 要安裝的套件名稱
}

// DELETE /api/software 請求
export interface DeleteRequest {
  uuid: string[];         // 目標 PC UUID
  Package: string[];      // 要刪除的套件名稱
}

// ---------------------------
// 安裝/刪除的結果
export interface PackageActionResult {
  Installed: string[];     // 成功安裝/刪除的套件
  Notinstalled: string[];  // 未成功安裝/刪除的套件
}

// POST/DELETE /api/software 回應
export interface ActionResponse {
  Packages: Record<string, PackageActionResult>; // package -> result
  Length: number;                                // 總數
}
