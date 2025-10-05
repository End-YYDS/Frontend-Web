// ========== Roles ==========
export interface RolesResponse {
  Roles: RoleInfo[];
  Length: number;
}

export interface RoleInfo {
  RoleName: string;
  Permissions: number;
  Color: Color;
  Members: number[];
  Length: number;
}

// 將 Rust enum Color 轉成 TS union type + 可擴展的 Custom
export type Color =
  | "Red"
  | "Green"
  | "Blue"
  | "Yellow"
  | "Purple"
  | "Orange"
  | "Black"
  | "White"
  | "Gray"
  | { Custom: string }; // Hex code 或 RGB

// ========== Users ==========
export interface UsersResponse {
  Users: Record<number, string>; // userId -> username
  Length: number;
}

// ========== Role Requests / Responses ==========
export interface RoleDeleteRequest {
  RoleName: string;
}

export interface RolePutResponse {
  RoleName: string;
  Members: number[];
}

export interface RolePatchRequest {
  RoleName: string;
  Permissions?: number;
  Color?: Color;
}
