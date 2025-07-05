import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleEditorSidebar } from './EditorSidebar';
import { DisplayTab } from './DisplayTab';
import { PermissionsTab } from './PermissionsTab';
import { MembersTab } from './MembersTab';

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

interface RoleEditorProps {
  role: Role;
  allRoles: Role[];
  allUsers: Member[];
  onBack: () => void;
  onSave: (role: Role) => void;
  onRoleSelect: (role: Role) => void;
}

const permissions = [
  { id: 'view', name: '檢視', enabled: true },
  { id: 'manage_groups', name: '管理身份組', enabled: false },
  { id: 'edit', name: '編輯', enabled: false },
  { id: 'manage', name: '管理..', enabled: false },
];

export function RoleEditor({ role, allRoles, allUsers, onBack, onSave, onRoleSelect }: RoleEditorProps) {
  const [roleName, setRoleName] = useState(role.name);
  const [selectedColor, setSelectedColor] = useState(role.color);
  const [rolePermissions, setRolePermissions] = useState(permissions);
  const [members, setMembers] = useState<Member[]>(role.members);
  const [searchMember, setSearchMember] = useState('');

  const isEveryoneRole = role.id === 'everyone';

  // Update state when role changes
  useEffect(() => {
    setRoleName(role.name);
    setSelectedColor(role.color);
    setMembers(role.members);
    setSearchMember('');
  }, [role]);

  const handleSave = () => {
    onSave({
      ...role,
      name: roleName,
      color: selectedColor,
      members: members,
      memberCount: members.length,
    });
  };

  const togglePermission = (permissionId: string) => {
    setRolePermissions(rolePermissions.map(perm => 
      perm.id === permissionId ? { ...perm, enabled: !perm.enabled } : perm
    ));
  };

  const addMember = (user: Member) => {
    if (!members.find(m => m.id === user.id)) {
      setMembers([...members, user]);
    }
  };

  const removeMember = (memberId: string) => {
    setMembers(members.filter(m => m.id !== memberId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-2" 
            style={{ color: '#E6E6E6', backgroundColor: '#A8AEBD' }}
          >
            Role
          </h1>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <RoleEditorSidebar 
            roleName={roleName}
            selectedColor={selectedColor}
            currentRole={role}
            allRoles={allRoles}
            onBack={onBack}
            onRoleSelect={onRoleSelect}
          />

          <div className="col-span-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">編輯身份 - {roleName}</h2>
              
              <Tabs defaultValue="display" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="display">顯示</TabsTrigger>
                  <TabsTrigger value="permissions">權限</TabsTrigger>
                  <TabsTrigger value="members">管理成員</TabsTrigger>
                </TabsList>
                
                <TabsContent value="display">
                  <DisplayTab 
                    roleName={roleName}
                    selectedColor={selectedColor}
                    isEveryoneRole={isEveryoneRole}
                    onRoleNameChange={setRoleName}
                    onColorChange={setSelectedColor}
                  />
                </TabsContent>
                
                <TabsContent value="permissions">
                  <PermissionsTab 
                    permissions={rolePermissions}
                    onPermissionToggle={togglePermission}
                  />
                </TabsContent>
                
                <TabsContent value="members">
                  <MembersTab 
                    members={members}
                    allUsers={allUsers}
                    searchMember={searchMember}
                    isEveryoneRole={isEveryoneRole}
                    onSearchMemberChange={setSearchMember}
                    onAddMember={addMember}
                    onRemoveMember={removeMember}
                  />
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                <Button variant="outline" onClick={onBack}>
                  取消
                </Button>
                <Button 
                  onClick={handleSave} 
                  style={{ backgroundColor: '#7B86AA' }}
                  className="hover:opacity-90 text-white"
                  // disabled={isEveryoneRole}
                >
                  儲存
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}