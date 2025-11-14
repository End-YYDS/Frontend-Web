export interface UserEntry {
  Username: string;
  Cn: string;
  Sn: string;
  Home_directory: string;
  Shell: string;
  Given_name: string;
  Display_name: string;
  Gid_number: string;
  Group: string[];
  Gecos: string;
}

export interface UsersCollection {
  Users: Record<string, UserEntry>;
  Length: number;
}

export type CreateUserRequest = Omit<UserEntry, 'Gid_number'> & {
  Password: string;
};

export type PutUserEntry = Omit<UserEntry, 'Username' | 'Gid_number'> & {
  Password: string;
};

export interface PutUsersRequest {
  [uid: string]: PutUserEntry;
}

export interface PatchUserEntry {
  Password?: string;
  Cn?: string;
  Sn?: string;
  Home_directory?: string;
  Shell?: string;
  Given_name?: string;
  Display_name?: string;
  Group?: string[];
  Gecos?: string;
}

export interface PatchUsersRequest {
  [uid: string]: PatchUserEntry;
}

export interface DeleteUserRequest {
  uid: string;
}

export interface GroupEntry {
  Groupname: string;
  Users: string[];
}

export interface GroupsCollection {
  Groups: Record<string, GroupEntry>;
}

export interface CreateGroupRequest {
  Groupname: string;
  Users: string[];
}

export interface PutGroupsRequest {
  [gid: string]: GroupEntry;
}

export interface PatchGroupEntry {
  Groupname?: string;
  Users?: string[];
}

export interface PatchGroupsRequest {
  [gid: string]: PatchGroupEntry;
}

export interface DeleteGroupRequest {
  gid: string;
}
