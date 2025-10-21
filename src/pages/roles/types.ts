type Color =
  | 'Red'
  | 'Green'
  | 'Blue'
  | 'Yellow'
  | 'Purple'
  | 'Orange'
  | 'Black'
  | 'White'
  | 'Gray'
  | { Custom: string }; // Hex code 或 RGB
type ResultType = 'Ok' | 'Err';
type InnerRoles = RolesInfo[];

interface RolesInfo {
  RoleName: string;
  Permissions: number;
  Color: Color;
  Members: number[];
  Length: number;
}

interface GetRoleResponse {
  Roles: InnerRoles;
  Length: number;
}

interface GetRoleUsersResponse {
  Users: Record<number, string>; // userId -> username
  Length: number;
}

interface PostRoleRequest {
  RoleName: string;
  Permissions: number;
  Color: Color;
  Members: number[];
  Length: number;
}

// Post /api/chm/role
// Delete /api/chm/role
// Put /api/chm/role
// Patch /api/chm/role
interface RoleActionResponse {
  Type: ResultType;
  Message: string;
}

interface DeleteRoleRequest {
  RoleName: string;
}

interface PutRoleRequest {
  RoleName: string;
  Members: number[];
}

interface PatchRoleRequest {
  RoleName: string;
  Permissions?: number;
  Color?: Color;
}

export type {
  GetRoleResponse,
  GetRoleUsersResponse,
  PostRoleRequest,
  RoleActionResponse,
  DeleteRoleRequest,
  PutRoleRequest,
  PatchRoleRequest,
};
