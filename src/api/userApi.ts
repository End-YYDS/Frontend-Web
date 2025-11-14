// import { api } from '@/lib/apiClient';
// import {
//   CreateUserRequest,
//   type GroupsCollection,
//   type UsersCollection,
// } from '@/pages/user_group/types';
// import { getgroups } from 'process';

// export const user_groupApi = {
//   getUsers() {
//     return api.get<UsersCollection>('/chm/user');
//   },
//   getGroups() {
//     return api.get<GroupsCollection>('/chm/group');
//   },
//   addUser(payload: CreateUserRequest) {
//     return api.post<CreateUserRequest>('/chm/user', payload);
//   },
// };

// userApi.ts
import { api } from '@/lib/apiClient';
import type {
  CreateUserRequest,
  UsersCollection,
  GroupsCollection,
  CreateGroupRequest,
  PatchUsersRequest,
  DeleteUserRequest,
  PatchGroupsRequest,
  DeleteGroupRequest,
} from '@/pages/user_group/types';
import type { CommonResponse } from '@/types';

export const user_groupApi = {
  getUsers() {
    return api.get<UsersCollection>('/chm/user');
  },

  getGroups() {
    return api.get<GroupsCollection>('/chm/group');
  },

  addUser(payload: CreateUserRequest) {
    return api.post<CommonResponse>('/chm/user', payload);
  },

  patchUsers(payload: PatchUsersRequest) {
    return api.patch<CommonResponse>('/chm/user', payload);
  },

  deleteUser(payload: DeleteUserRequest) {
    return api.delete<CommonResponse>('/chm/user', { data: payload });
  },

  addGroup(payload: CreateGroupRequest) {
    return api.post<CommonResponse>('/chm/group', payload);
  },

  patchGroups(payload: PatchGroupsRequest) {
    return api.patch<CommonResponse>('/chm/group', payload);
  },

  deleteGroup(payload: DeleteGroupRequest) {
    return api.delete<CommonResponse>('/chm/group', { data: payload });
  },
};
