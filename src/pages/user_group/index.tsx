import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from './UserManagement';
import { GroupManagement } from './GroupManagement';
import { type PageMeta, ResponseType } from '@/types';
import {
  deleteGroup,
  deleteUser,
  getGroup,
  getUser,
  patchGroup,
  patchUser,
  postGroup,
  postUser,
  type CreateGroupRequest,
  type CreateUserRequest,
  type GetUserEntry,
  type GroupEntry,
  type GroupsCollection,
  type PatchGroupEntry,
  type PatchUserEntry,
  type PatchUsersRequest,
  type ResponseResult,
  type UsersCollection,
} from '@/api/openapi-client';

type UsersMap = UsersCollection['Users'];
type GroupsMap = GroupsCollection['Groups'];

export type UserRow = GetUserEntry & { uid: string };
export type GroupRow = GroupEntry & { gid: string };

const UserGroup = () => {
  const [usersMap, setUsersMap] = useState<UsersMap>({});
  const [groupsMap, setGroupsMap] = useState<GroupsMap>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'users' | 'groups'>('users');
  const itemsPerPage = 10;

  const handleApiResult = (res: ResponseResult | undefined, defaultSuccess: string) => {
    if (!res) {
      toast.error('No response from server.');
      return;
    }
    if (res.Type === ResponseType.Ok) {
      toast.success(res.Message || defaultSuccess);
    } else {
      toast.error(res.Message || 'Operation failed.');
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await getUser();
      if (!data || !data.Users || Object.keys(data.Users).length === 0) {
        toast.error('No user data received.');
        return;
      }
      setUsersMap(data.Users);
    } catch {
      toast.error('Failed to fetch user data.');
    }
  };

  const fetchGroups = async () => {
    try {
      const { data } = await getGroup();
      if (!data || !data.Groups || Object.keys(data.Groups).length === 0) {
        toast.error('No group data received.');
        return;
      }
      setGroupsMap(data.Groups);
    } catch {
      toast.error('Failed to fetch group data.');
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      void fetchUsers();
      void fetchGroups();
    } else {
      void fetchGroups();
      void fetchUsers();
    }
  }, [activeTab]);

  const usersArray: UserRow[] = Object.entries(usersMap).map(([uid, u]) => ({ uid, ...u }));
  const groupsArray: GroupRow[] = Object.entries(groupsMap).map(([gid, g]) => ({ gid, ...g }));

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

  const handleAddUser = async (user: CreateUserRequest) => {
    try {
      const { data } = await postUser({ body: user });
      handleApiResult(data, 'User has been added.');
      if (data?.Type === ResponseType.Ok) {
        await fetchUsers();
        await fetchGroups();
      }
    } catch {
      toast.error('Failed to add user.');
    }
  };

  const handleUpdateUser = async (uid: string, patch: PatchUserEntry) => {
    try {
      if (Object.keys(patch).length === 0) {
        toast.info('No changes to update.');
        return;
      }
      const body: PatchUsersRequest = {
        [uid]: patch,
      };
      const { data } = await patchUser({ body });
      handleApiResult(data, 'User has been updated.');
      if (data?.Type === ResponseType.Ok) {
        await fetchUsers();
        await fetchGroups();
      }
    } catch {
      toast.error('Failed to update user.');
    }
  };

  const handleDeleteUser = async (uid: string) => {
    try {
      const { data } = await deleteUser({ body: { Uid: uid } });
      handleApiResult(data, 'User has been deleted.');
      if (data?.Type === ResponseType.Ok) {
        await fetchUsers();
        await fetchGroups();
      }
    } catch {
      toast.error('Failed to delete user.');
    }
  };

  const handleAddGroup = async (group: CreateGroupRequest) => {
    try {
      const { data } = await postGroup({ body: group });
      handleApiResult(data, 'Group has been added.');
      if (data?.Type === ResponseType.Ok) {
        await fetchGroups();
        await fetchUsers();
      }
    } catch {
      toast.error('Failed to add group.');
    }
  };

  const handleUpdateGroup = async (gid: string, patch: PatchGroupEntry) => {
    try {
      // const { data } = await user_groupApi.patchGroups({ [gid]: patch });
      const { data } = await patchGroup({ body: { [gid]: patch } });
      handleApiResult(data, 'Group has been updated.');
      if (data?.Type === ResponseType.Ok) {
        await fetchGroups();
        await fetchUsers();
      }
    } catch {
      toast.error('Failed to update group.');
    }
  };

  const handleDeleteGroup = async (gid: string) => {
    try {
      const { data } = await deleteGroup({ body: { Gid: gid } });
      handleApiResult(data, 'Group has been deleted.');
      if (data?.Type === ResponseType.Ok) {
        await fetchGroups();
        await fetchUsers();
      }
    } catch (err) {
      toast.error('Failed to delete group.');
    }
  };

  return (
    <div className='container mx-auto py-6 px-4'>
      <div className='bg-[#A8AEBD] py-1.5 mb-6'>
        <h1 className='text-4xl font-extrabold text-center text-[#E6E6E6]'>User &amp; Group</h1>
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
              uids.forEach((uid) => {
                void handleDeleteUser(uid);
              });
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
            groups={groupsMap}
            users={usersArray}
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
