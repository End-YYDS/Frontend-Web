export interface User {
  id: number;
  username: string;
  groups: string[];
  homeDirectory: string;
  shell: string;
}

export interface Group {
  id: number;
  name: string;
  users: string[];
}

// ------------------------ User ------------------------
export interface UsersCollection {
  Users: User[];
  Length: number;
}

// POST /api/chm/user
export interface CreateUserRequest {
  username: string;
  groups?: string[];
  homeDirectory: string;
  shell: string;
}

// PUT /api/chm/user
export interface PutUsersRequest {
  [uid: string]: User;
}

// PATCH /api/chm/user
export interface PatchUser {
  username?: string;
  groups?: string[];
  homeDirectory?: string;
  shell?: string;
}

export interface PatchUsersRequest {
  [uid: string]: PatchUser;
}

// DELETE /api/chm/user
export interface DeleteUserRequest {
  uid: string;
}

// ------------------------ Group ------------------------
export interface GroupsCollection {
  Groups: Group[];
}

// POST /api/chm/group
export interface CreateGroupRequest {
  name: string;
  users?: string[];
}

// PUT /api/chm/group
export interface PutGroupsRequest {
  [gid: string]: Group;
}

// PATCH /api/chm/group
export interface PatchGroup {
  name?: string;
  users?: string[];
}

export interface PatchGroupsRequest {
  [gid: string]: PatchGroup;
}

// DELETE /api/chm/group
export interface DeleteGroupRequest {
  gid: string;
}
