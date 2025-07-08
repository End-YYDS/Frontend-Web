import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UsersIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { RoleEditor } from './Editor';

interface Member {
  id: string;
  name: string;
  avatar?: string;
}

interface Role {
  id: string;
  name: string;
  color: string;
  memberCount: number;
  members: Member[];
}

const allUsers: Member[] = [
  { id: '1', name: 'Helena', avatar: '/placeholder.svg' },
  { id: '2', name: 'Oscar', avatar: '/placeholder.svg' },
  { id: '3', name: 'Daniel', avatar: '/placeholder.svg' },
  { id: '4', name: 'Alice', avatar: '/placeholder.svg' },
  { id: '5', name: 'Bob', avatar: '/placeholder.svg' },
  { id: '6', name: 'Charlie', avatar: '/placeholder.svg' },
];

const everyoneRole: Role = {
  id: 'everyone',
  name: '@everyone',
  color: '#6B7280',
  memberCount: allUsers.length,
  members: allUsers
};

const defaultRoles: Role[] = [
  { 
    id: 'identity1', 
    name: '身份1', 
    color: '#E5E7EB', 
    memberCount: 2,
    members: [
      { id: '1', name: 'Helena', avatar: '/placeholder.svg' },
      { id: '2', name: 'Oscar', avatar: '/placeholder.svg' },
    ]
  },
  { 
    id: 'identity2', 
    name: '身份2', 
    color: '#F59E0B', 
    memberCount: 1,
    members: [
      { id: '3', name: 'Daniel', avatar: '/placeholder.svg' },
    ]
  },
  { 
    id: 'identity3', 
    name: '身份3', 
    color: '#3B82F6', 
    memberCount: 3,
    members: [
      { id: '4', name: 'Alice', avatar: '/placeholder.svg' },
      { id: '5', name: 'Bob', avatar: '/placeholder.svg' },
      { id: '6', name: 'Charlie', avatar: '/placeholder.svg' },
    ]
  },
];

export function RolesContent() {
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const allRolesIncludingEveryone = [everyoneRole, ...roles];

  const handleCreateRole = () => {
    const newRole: Role = {
      id: 'new-role',
      name: 'new role',
      color: '#E5E7EB',
      memberCount: 0,
      members: [],
    };
    setEditingRole(newRole);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
  };

  const handleBackToList = () => {
    setEditingRole(null);
  };

  const handleSaveRole = (updatedRole: Role) => {
    if (updatedRole.id === 'everyone') {
      // @everyone role is read-only, don't save changes
      setEditingRole(null);
      return;
    }
    
    if (updatedRole.id === 'new-role') {
      // 新建角色
      const newId = `identity${roles.length + 1}`;
      const newRole = { ...updatedRole, id: newId, memberCount: updatedRole.members.length };
      setRoles([...roles, newRole]);
    } else {
      // 更新現有角色
      const updatedRoleWithCount = { ...updatedRole, memberCount: updatedRole.members.length };
      setRoles(roles.map(role => role.id === updatedRole.id ? updatedRoleWithCount : role));
    }
    setEditingRole(null);
  };

  const handleRoleSelect = (role: Role) => {
    setEditingRole(role);
  };

  const handleEveryoneClick = () => {
    setEditingRole(everyoneRole);
  };

  if (editingRole) {
    return (
      <RoleEditor 
        role={editingRole} 
        allRoles={allRolesIncludingEveryone}
        allUsers={allUsers}
        onBack={handleBackToList}
        onSave={handleSaveRole}
        onRoleSelect={handleRoleSelect}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br">   

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-2" 
            style={{ color: '#E6E6E6', backgroundColor: '#A8AEBD' }}
          >
            Roles
          </h1>
        </div>

        {/* Default Role Card */}
        <div 
          className="bg-white rounded-lg shadow-sm p-6 mb-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleEveryoneClick}
        >
          <div className="flex items-center">
            <UsersIcon className="w-6 h-6 text-gray-600 mr-3" />
            <div>
              <h3 className="font-semibold text-lg">預設權限</h3>
              <p className="text-gray-600">@everyone</p>
            </div>
          </div>
        </div>

        {/* Search and Create Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜尋身份組"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handleCreateRole}
            style={{ backgroundColor: '#7B86AA' }}
            className="hover:opacity-90 text-white ml-4"
          >
            建立身份組
          </Button>
        </div>

        {/* Roles Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="grid grid-cols-3 gap-4">
              <div className="font-semibold text-gray-700">身份組 - {roles.length}</div>
              <div className="font-semibold text-gray-700">成員</div>
              <div></div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {roles
              .filter(role => role.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((role) => (
                <div 
                  key={role.id} 
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer grid grid-cols-3 gap-4 items-center"
                  onClick={() => handleEditRole(role)}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: role.color }}
                    ></div>
                    <span className="font-medium">{role.name}</span>
                  </div>
                  <div className="text-gray-600">{role.memberCount}</div>
                  <div></div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}