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
  permissions: number; // bit operation
  members: Member[];
  memberCount: number;
}

interface RoleEditorProps {
  role: Role;
  allRoles: Role[];
  allUsers: Member[];
  onBack: () => void;
  onSave: (role: Role) => void;
  onRoleSelect: (role: Role) => void;
}

const permissionsList = [
  { id: 0, name: '檢視', bit: 1 << 0 },
  { id: 1, name: '管理身份組', bit: 1 << 1 },
  { id: 2, name: '編輯', bit: 1 << 2 },
  { id: 3, name: '管理', bit: 1 << 3 },
];

export function RoleEditor({ role, allRoles, allUsers, onBack, onSave, onRoleSelect }: RoleEditorProps) {
  const [roleName, setRoleName] = useState(role.name);
  const [selectedColor, setSelectedColor] = useState(role.color);
  const [rolePermissions, setRolePermissions] = useState(role.permissions);
  const [members, setMembers] = useState<Member[]>(role.members);
  const [searchMember, setSearchMember] = useState('');

  const isEveryoneRole = role.id === 'everyone';

  // Update state when role changes
  useEffect(() => {
    setRoleName(role.name);
    setSelectedColor(role.color);
    setRolePermissions(role.permissions);
    setMembers(role.members);
    setSearchMember('');
  }, [role]);

  const handleSave = () => {
    onSave({
      ...role,
      name: roleName,
      color: selectedColor,
      permissions: rolePermissions,
      members: members,
      memberCount: members.length,
    });
  };

  const togglePermission = (bit: number) => {
    if (isEveryoneRole) return;
    
    setRolePermissions(prev => {
      if (prev & bit) {
        return prev & ~bit; // Remove permission
      } else {
        return prev | bit; // Add permission
      }
    });
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
                    permissions={permissionsList.map(perm => ({
                      id: perm.id.toString(),
                      name: perm.name,
                      enabled: (rolePermissions & perm.bit) !== 0,
                      bit: perm.bit
                    }))}
                    isEveryoneRole={isEveryoneRole}
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
                  disabled={isEveryoneRole}
                >
                  儲存
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}