import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from './UserManagement';
import { GroupManagement } from './GroupManagement';
import type {
  UsersCollection,
  CreateUserRequest,
  PatchUserEntry,
  GroupsCollection,
  CreateGroupRequest,
  PatchGroupEntry,
} from './types';
import { type PageMeta } from '@/types';

// ---------------- 前端型別 ----------------
export interface UserEntry {
  Username: string;
  Group: string[];
  Home_directory: string;
  Shell: string;
}

export interface GroupEntry {
  Groupname: string;
  Users: string[];
}

export interface UsersMap {
  [uid: string]: UserEntry;
}

export interface GroupsMap {
  [gid: string]: GroupEntry;
}

// ---------------- 前端狀態 ----------------
const UserGroup = () => {
  const [usersMap, setUsersMap] = useState<UsersMap>({});
  const [groupsMap, setGroupsMap] = useState<GroupsMap>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'users' | 'groups'>('users');
  const itemsPerPage = 10;

  // ---------------- Fetch ----------------
  const fetchUsers = async () => {
    try {
      const res = await axios.get<UsersCollection>('/api/chm/user', { withCredentials: true });
      setUsersMap(res.data.Users);
    } catch {
      toast.error('Failed to fetch user data.');
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get<GroupsCollection>('/api/chm/group', { withCredentials: true });
      setGroupsMap(res.data.Groups);
    } catch {
      toast.error('Failed to fetch group data.');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  // ---------------- 轉成陣列方便前端渲染 ----------------
  const usersArray = Object.entries(usersMap).map(([uid, u]) => ({ uid, ...u }));
  const groupsArray = Object.entries(groupsMap).map(([gid, g]) => ({ gid, ...g }));

  // ---------------- Filter & Pagination ----------------
  const filteredUsers = usersArray.filter(
    (user) =>
      user.Username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.Group.some((group) => group.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const filteredGroups = groupsArray.filter((group) =>
    group.Groupname.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(
    (activeTab === 'users' ? filteredUsers.length : filteredGroups.length) / itemsPerPage,
  );

  // ---------------- User CRUD ----------------
  const handleAddUser = async (user: Omit<UserEntry, 'uid'>) => {
    try {
      const req: CreateUserRequest = user;
      const res = await axios.post<{ uid: string }>('/api/chm/user', req, {
        withCredentials: true,
      });
      setUsersMap((prev) => ({ ...prev, [res.data.uid]: user }));
      toast.success('User has been added.');
      fetchGroups();
    } catch {
      toast.error('Failed to add user.');
    }
  };

  const handleUpdateUser = async (uid: string, user: Partial<UserEntry>) => {
    try {
      const patch: PatchUserEntry = user;
      await axios.patch('/api/chm/user', { [uid]: patch }, { withCredentials: true });
      setUsersMap((prev) => ({ ...prev, [uid]: { ...prev[uid], ...user } }));
      toast.success('User has been updated.');
      fetchGroups();
    } catch {
      toast.error('Failed to update user.');
    }
  };

  const handleDeleteUser = async (uid: string) => {
    try {
      await axios.delete('/api/chm/user', { data: { uid }, withCredentials: true });
      const { [uid]: _, ...rest } = usersMap;
      setUsersMap(rest);
      toast.success('User has been deleted.');
      fetchGroups();
    } catch {
      toast.error('Failed to delete user.');
    }
  };

  // ---------------- Group CRUD ----------------
  const handleAddGroup = async (group: Omit<GroupEntry, 'gid'>) => {
    try {
      const req: CreateGroupRequest = group;
      const res = await axios.post<{ gid: string }>('/api/chm/group', req, {
        withCredentials: true,
      });
      setGroupsMap((prev) => ({ ...prev, [res.data.gid]: group }));
      toast.success('Group has been added.');
    } catch {
      toast.error('Failed to add group.');
    }
  };

  const handleUpdateGroup = async (gid: string, group: Partial<GroupEntry>) => {
    try {
      const patch: PatchGroupEntry = group;
      await axios.patch('/api/chm/group', { [gid]: patch }, { withCredentials: true });
      setGroupsMap((prev) => ({ ...prev, [gid]: { ...prev[gid], ...group } }));
      toast.success('Group has been updated.');
    } catch {
      toast.error('Failed to update group.');
    }
  };

  const handleDeleteGroup = async (gid: string) => {
    try {
      await axios.delete('/api/chm/group', { data: { gid }, withCredentials: true });
      const { [gid]: _, ...rest } = groupsMap;
      setGroupsMap(rest);
      toast.success('Group has been deleted.');
    } catch {
      toast.error('Failed to delete group.');
    }
  };

  return (
    <div className='container mx-auto py-6 px-4'>
      <div className='bg-[#A8AEBD] py-1.5 mb-6'>
        <h1 className='text-4xl font-extrabold text-center text-[#E6E6E6]'>User & Group</h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as 'users' | 'groups');
          setCurrentPage(1);
        }}
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='users'>User</TabsTrigger>
          <TabsTrigger value='groups'>Group</TabsTrigger>
        </TabsList>

        <TabsContent value='users' className='space-y-4'>
          <UserManagement
            users={usersArray}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            groups={groupsArray}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onDeleteSelectedUsers={(uids: string[]) => {
              uids.forEach((uid) => handleDeleteUser(uid));
            }}
            onCreateGroup={() => {
              toast.error('Create group functionality is not implemented yet.');
            }}
          />
          {filteredUsers.length > itemsPerPage && (
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          )}
        </TabsContent>

        <TabsContent value='groups' className='space-y-4'>
          <GroupManagement
            groups={groupsMap} // <- HashMap 型別
            users={usersArray} // <- Converted to array
            onAddGroup={handleAddGroup}
            onUpdateGroup={handleUpdateGroup}
            onDeleteGroup={handleDeleteGroup}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
          {filteredGroups.length > itemsPerPage && (
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ---------------- Pagination ----------------
const PaginationBar = ({
  currentPage,
  totalPages,
  setCurrentPage,
}: {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}) => (
  <div className='mt-4 flex justify-center'>
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => (
          <PaginationItem key={i + 1}>
            <PaginationLink
              onClick={() => setCurrentPage(i + 1)}
              isActive={currentPage === i + 1}
              className='cursor-pointer'
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            className={
              currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
);

(UserGroup as any).meta = {
  requiresAuth: true,
  layout: true,
} satisfies PageMeta;

export default UserGroup;
