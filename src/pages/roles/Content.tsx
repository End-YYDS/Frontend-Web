import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Trash2 } from 'lucide-react';
import { RoleEditor } from './Editor';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import axios from 'axios';
import type { GetRoleResponse, GetRoleUsersResponse, RoleActionResponse } from './types';

export interface Member {
  id: string;
  name: string;
  avatar?: string;
}

interface Role {
  id: string;
  name: string;
  color: string;
  permissions: number; // bit operation
  members: Member[];
  memberCount: number;
}

// ---------- API Helpers ----------
interface ApiResponse {
  Type: 'Ok' | 'Err';
  Message: string;
}

// ===== 虛擬資料 (mock data, 已註解) =====
// const mockUsers: Member[] = [
//   { id: '1', name: 'Helena', avatar: '/placeholder.svg' },
//   { id: '2', name: 'Oscar', avatar: '/placeholder.svg' },
//   { id: '3', name: 'Daniel', avatar: '/placeholder.svg' },
//   { id: '4', name: 'Alice', avatar: '/placeholder.svg' },
//   { id: '5', name: 'Bob', avatar: '/placeholder.svg' },
//   { id: '6', name: 'Charlie', avatar: '/placeholder.svg' },
// ];

// const mockRoles: Role[] = [
//   { 
//     id: 'role-0',
//     name: 'role1',
//     color: '#E5E7EB',
//     permissions: 3, 
//     members: [mockUsers[0], mockUsers[1]],
//     memberCount: 2
//   },
//   { 
//     id: 'role-1',
//     name: 'role2',
//     color: '#F59E0B',
//     permissions: 7,
//     members: [mockUsers[2]],
//     memberCount: 1
//   },
//   { 
//     id: 'role-2',
//     name: 'role3',
//     color: '#3B82F6',
//     permissions: 15,
//     members: [mockUsers[3], mockUsers[4], mockUsers[5]],
//     memberCount: 3
//   },
// ];

// ---------- API Functions ----------
const fetchAllUsers = async (): Promise<Member[]> => {
  try {
    const res = await axios.get<GetRoleUsersResponse>('/api/chm/role/users');
    const data = res.data;

    if (!data || !data.Users || typeof data.Users !== 'object') {
      console.warn('Invalid Users response:', data);
      toast.error('Invalid user data received');
      return [];
    }

    return Object.entries(data.Users).map(([uid, name]) => ({
      id: uid,
      name: String(name),
      avatar: '/placeholder.svg'
    }));
  } catch (err) {
    console.error(err);
    toast.error('Failed to fetch users');
    return [];
  }
};


const fetchAllRoles = async (usersList: Member[]): Promise<Role[]> => {
  try {
    const res = await axios.get<GetRoleResponse>('/api/chm/role');
    const data = res.data;

    if (!data || !Array.isArray(data.Roles)) {
      console.warn('Invalid Roles response:', data);
      toast.error('Invalid roles data received');
      return [];
    }

    return data.Roles.map((r: any, idx: number) => ({
      id: `role-${idx}`,
      name: String(r.RoleName ?? 'Unnamed Role'),
      color: String(r.Color ?? '#E5E7EB'),
      permissions: Number(r.Permissions ?? 0),
      members: Array.isArray(r.Members)
        ? r.Members
            .map((uid: string) => usersList.find(u => u.id === String(uid)))
            .filter((u: Member | undefined): u is Member => u !== undefined)
        : [],
      memberCount: Number(r.Length ?? 0)
    }));
  } catch (err) {
    console.error('fetchAllRoles error:', err);
    toast.error('Failed to fetch roles');
    return []; // fallback: empty array
  }
};

const createRole = async (role: Role): Promise<ApiResponse> => {
  try {
    const body = {
      RoleName: role.name,
      Permissions: role.permissions,
      Color: role.color,
      Members: role.members.map(m => Number(m.id)),
      Length: role.members.length
    };
    const res = await axios.post<RoleActionResponse>('/api/chm/role', body);
    return res.data;
  } catch (err) {
    console.error(err);
    toast.error('Failed to create role');
    return { Type: 'Err', Message: 'Create role failed' };
  }
};

const deleteRoleApi = async (roleName: string): Promise<ApiResponse> => {
  try {
    const res = await axios.delete<RoleActionResponse>('/api/chm/role', { data: { RoleName: roleName } });
    return res.data;
  } catch (err) {
    console.error(err);
    toast.error('Failed to delete role');
    return { Type: 'Err', Message: 'Delete role failed' };
  }
};

const updateRoleMembers = async (roleName: string, members: Member[]): Promise<ApiResponse> => {
  try {
    const res = await axios.put<RoleActionResponse>('/api/chm/role', {
      RoleName: roleName,
      Members: members.map(m => Number(m.id))
    });
    return res.data;
  } catch (err) {
    console.error(err);
    toast.error('Failed to update role members');
    return { Type: 'Err', Message: 'Update members failed' };
  }
};

const updateRolePermissions = async (role: Role): Promise<ApiResponse> => {
  try {
    const res = await axios.patch<RoleActionResponse>('/api/chm/role', {
      RoleName: role.name,
      Permissions: role.permissions,
      Color: role.color
    });
    return res.data;
  } catch (err) {
    console.error(err);
    toast.error('Failed to update role permissions');
    return { Type: 'Err', Message: 'Update permissions failed' };
  }
};

// ---------- RolesContent ----------
export function RolesContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allUsers, setAllUsers] = useState<Member[]>([]);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const everyoneRole: Role = {
    id: 'everyone',
    name: '@everyone',
    color: '#6B7280',
    permissions: 1,
    members: allUsers,
    memberCount: allUsers.length
  };

  const allRolesIncludingEveryone = [everyoneRole, ...roles];

  useEffect(() => {
    const loadData = async () => {
      try {
        const users = await fetchAllUsers();
        setAllUsers(users);

        const rolesData = await fetchAllRoles(users);
        setRoles(rolesData);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const handleCreateRole = () => {
    const newRole: Role = {
      id: 'new-role',
      name: 'new role',
      color: '#E5E7EB',
      permissions: 1,
      members: [],
      memberCount: 0,
    };
    setEditingRole(newRole);
  };

  const handleEditRole = (role: Role) => setEditingRole(role);

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (roleId === 'everyone') {
      toast.error('Cannot delete @everyone role');
      return;
    }
    const res = await deleteRoleApi(roleName);
    if (res.Type === 'Ok') {
      setRoles(roles.filter(role => role.id !== roleId));
      toast.success(`Role "${roleName}" has been deleted`);
    } else {
      toast.error(res.Message);
    }
  };

  const handleBackToList = () => setEditingRole(null);

  const handleSaveRole = async (updatedRole: Role) => {
    if (updatedRole.id === 'everyone') {
      setEditingRole(null);
      return;
    }

    try {
      if (updatedRole.id === 'new-role') {
        const res = await createRole(updatedRole);
        if (res.Type === 'Ok') {
          setRoles([...roles, { ...updatedRole, id: `role-${roles.length}`, memberCount: updatedRole.members.length }]);
          toast.success(`Role "${updatedRole.name}" has been created`);
        } else {
          toast.error(res.Message);
        }
      } else {
        const res1 = await updateRoleMembers(updatedRole.name, updatedRole.members);
        if (res1.Type !== 'Ok') throw new Error(res1.Message);

        const res2 = await updateRolePermissions(updatedRole);
        if (res2.Type !== 'Ok') throw new Error(res2.Message);

        setRoles(roles.map(r => r.id === updatedRole.id ? { ...updatedRole, memberCount: updatedRole.members.length } : r));
        toast.success(`Role "${updatedRole.name}" has been updated`);
      }
    } catch (err: any) {
      toast.error(err.message);
    }

    setEditingRole(null);
  };

  if (editingRole) {
    return (
      <RoleEditor 
        role={editingRole} 
        allRoles={allRolesIncludingEveryone}
        allUsers={allUsers}
        onBack={handleBackToList}
        onSave={handleSaveRole}
        onRoleSelect={(role) => setEditingRole(role)}
      />
    );
  }

  const filteredRoles = roles.filter(role => role.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-linear-to-br">
      {/* Default Role Card */}
      <div 
        className="bg-white rounded-lg shadow-sm p-6 mb-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setEditingRole(everyoneRole)}
      >
        <div className="flex items-center">
          <Users className="w-6 h-6 text-gray-600 mr-3" />
          <div>
            <h3 className="font-semibold text-lg">Default Role</h3>
            <p className="text-gray-600">@everyone</p>
          </div>
        </div>
      </div>

      {/* Search and Create */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search roles"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleCreateRole} style={{ backgroundColor: '#7B86AA' }} className="hover:opacity-90 text-white ml-4">
          Create Role
        </Button>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="grid grid-cols-4 gap-4">
            <div className="font-semibold text-gray-700">Roles - {roles.length}</div>
            <div className="font-semibold text-gray-700">Members</div>
            <div className="font-semibold text-gray-700">Permissions</div>
            <div></div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredRoles.map((role) => (
            <div key={role.id} className="px-6 py-4 hover:bg-gray-50 cursor-pointer grid grid-cols-4 gap-4 items-center">
              <div className="flex items-center" onClick={() => handleEditRole(role)}>
                <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: role.color }}></div>
                <span className="font-medium">{role.name}</span>
              </div>
              <div className="text-gray-600" onClick={() => handleEditRole(role)}>{role.memberCount}</div>
              <div className="text-gray-600" onClick={() => handleEditRole(role)}>{role.permissions}</div>
              <div className="flex justify-end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Delete Role</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the role "{role.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 text-white hover:bg-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRole(role.id, role.name);
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}