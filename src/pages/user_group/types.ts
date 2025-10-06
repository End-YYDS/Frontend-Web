// ---------- UserEntry ----------
export interface UserEntry {
  Username: string;
  Group: string[];
  Home_directory: string;
  Shell: string;
}

// ---------- UsersCollection ----------
export interface UsersCollection {
  Users: Record<string, UserEntry>; // HashMap<String, UserEntry>
  Length: number;
}

// ---------- CreateUserRequest (POST /api/chm/user) ----------
export interface CreateUserRequest {
  Username: string;
  Group: string[];
  Home_directory: string;
  Shell: string;
}

// ---------- PutUsersRequest (PUT /api/chm/user) ----------
// 接收整筆資料（用 uid 作 key）
export interface PutUsersRequest {
  [uid: string]: UserEntry; // 相當於 HashMap<String, UserEntry>
}

// ---------- PatchUserEntry (PATCH 單一內容可選) ----------
export interface PatchUserEntry {
  Username?: string;
  Group?: string[];
  Home_directory?: string;
  Shell?: string;
}

// ---------- PatchUsersRequest (PATCH /api/chm/user) ----------
// 接收部分更新（用 uid 作 key）
export interface PatchUsersRequest {
  [uid: string]: PatchUserEntry; // 相當於 HashMap<String, PatchUserEntry>
}

// ---------- DeleteUserRequest (DELETE /api/chm/user) ----------
export interface DeleteUserRequest {
  uid: string;
}

// ---------- GroupEntry ----------
export interface GroupEntry {
  Groupname: string;
  Users: string[]; // uid.username 字串
}

// ---------- GroupsCollection ----------
export interface GroupsCollection {
  Groups: Record<string, GroupEntry>; // HashMap<String, GroupEntry>
}

// ---------- CreateGroupRequest (POST /api/chm/group) ----------
export interface CreateGroupRequest {
  Groupname: string;
  Users: string[];
}

// ---------- PutGroupsRequest (PUT /api/chm/group) ----------
// 接收整筆資料（用 gid 作 key）
export interface PutGroupsRequest {
  [gid: string]: GroupEntry; // HashMap<String, GroupEntry>
}

// ---------- PatchGroupEntry (PATCH 單一內容可選) ----------
export interface PatchGroupEntry {
  Groupname?: string;
  Users?: string[];
}

// ---------- PatchGroupsRequest (PATCH /api/chm/group) ----------
// 局部更新，可接受任意 gid 作為 key
export interface PatchGroupsRequest {
  [gid: string]: PatchGroupEntry; // 建議改為 HashMap<String, PatchGroupEntry>
}

// ---------- DeleteGroupRequest (DELETE /api/chm/group) ----------
export interface DeleteGroupRequest {
  gid: string;
}
