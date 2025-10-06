import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GroupSelectionDialog } from './GroupSelectionDialog';

// types.ts 裡的型別
import type { CreateUserRequest, GroupsCollection, UserEntry, GroupEntry } from './types';

interface GroupArrayItem {
  id: number;
  name: string;
  users: string[];
  // optional: keep original gid if you need to map back
  gid?: string;
}

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (user: CreateUserRequest) => void;
  // 支援兩種輸入：後端回傳的 GroupsCollection 或已經是陣列形式
  groups: GroupsCollection | GroupArrayItem[];
  onCreateGroup: (name: string) => void;
  trigger: React.ReactNode;
  existingUsers: Record<string, UserEntry>;
}

const shellOptions = [
  { value: '/bin/bash', label: 'bash' },
  { value: '/bin/zsh', label: 'zsh' },
  { value: '/usr/bin/fish', label: 'fish' },
  { value: '/bin/sh', label: 'sh' }
];

export const AddUserDialog: React.FC<AddUserDialogProps> = ({
  isOpen,
  onOpenChange,
  onAddUser,
  groups,
  onCreateGroup,
  trigger,
  existingUsers
}) => {
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    Username: '',
    Group: [],
    Home_directory: '',
    Shell: '/bin/bash'
  });

  const [isGroupSelectionDialogOpen, setIsGroupSelectionDialogOpen] = useState(false);

  // —— normalize groups to array —— 
  // 若父元件傳的是陣列就直接使用；若是 GroupsCollection (object)，就把它轉成陣列
  const normalizedGroups: GroupArrayItem[] = React.useMemo(() => {
    if (Array.isArray(groups)) {
      return groups as GroupArrayItem[];
    }
    const gc = groups as GroupsCollection;
    const entries = Object.entries(gc?.Groups || {});
    return entries.map(([gid, g], idx) => ({
      id: idx,
      name: (g as GroupEntry).Groupname,
      users: (g as GroupEntry).Users || [],
      gid,
    }));
  }, [groups]);

  // 當 Username 改變時，自動更新 Home_directory
  useEffect(() => {
    setNewUser(prev => ({
      ...prev,
      Home_directory: prev.Username ? `/home/${prev.Username}` : ''
    }));
    // 只在 Username 變動時更新 Home_directory
  }, [newUser.Username]);

  // 判斷重複使用者名稱（existingUsers 為 record）
  const isDuplicateName = Object.values(existingUsers || {}).some(
    user => user.Username === newUser.Username && newUser.Username !== ''
  );

  const handleAddUser = () => {
    if (isDuplicateName) return;

    onAddUser(newUser);

    // reset
    setNewUser({
      Username: '',
      Group: [],
      Home_directory: '',
      Shell: '/bin/bash'
    });
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Create a new user</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input
                placeholder="enter username"
                value={newUser.Username}
                onChange={(e) => setNewUser({ ...newUser, Username: e.target.value })}
              />
              {isDuplicateName && (
                <p className="text-red-500 text-sm mt-1">The name already exists, please change it.</p>
              )}
            </div>

            {/* Groups */}
            <div>
              <label className="block text-sm font-medium mb-1">Group</label>
              <Button
                variant="outline"
                className="w-full justify-start text-gray-500"
                onClick={() => setIsGroupSelectionDialogOpen(true)}
              >
                Add to group
              </Button>
              {newUser.Group.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {newUser.Group.map(group => (
                    <span key={group} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {group}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Home directory */}
            <div>
              <label className="block text-sm font-medium mb-1">Home directory</label>
              <Input
                value={newUser.Home_directory}
                readOnly
                className="bg-gray-100"
                placeholder="Auto-generated based on username"
              />
            </div>

            {/* Shell */}
            <div>
              <label className="block text-sm font-medium mb-1">Shell</label>
              <Select
                value={newUser.Shell}
                onValueChange={(value) => setNewUser({ ...newUser, Shell: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shell" />
                </SelectTrigger>
                <SelectContent>
                  {shellOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleAddUser}
                style={{ backgroundColor: '#7B86AA' }}
                className="flex-1 hover:opacity-90"
                disabled={isDuplicateName || !newUser.Username}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* GroupSelectionDialog: 傳入已正規化的陣列 */}
      <GroupSelectionDialog
        isOpen={isGroupSelectionDialogOpen}
        onOpenChange={setIsGroupSelectionDialogOpen}
        groups={normalizedGroups}
        selectedGroups={newUser.Group}
        onGroupsChange={(selected) => setNewUser(prev => ({ ...prev, Group: selected }))}
        onCreateGroup={onCreateGroup}
      />
    </>
  );
};