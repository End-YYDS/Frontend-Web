import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserEntry } from './types';
import { GroupSelectionDialog } from './GroupSelectionDialog';

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserEntry;
  onUpdateUser: (user: UserEntry) => void;
  groups: { id: number; name: string; users: string[] }[];
  onCreateGroup: (name: string) => void;
  existingUsers: Record<string, UserEntry>; // uid -> UserEntry
}

const shellOptions = [
  { value: '/bin/bash', label: 'bash' },
  { value: '/bin/zsh', label: 'zsh' },
  { value: '/usr/bin/fish', label: 'fish' },
  { value: '/bin/sh', label: 'sh' }
];

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  isOpen,
  onOpenChange,
  user,
  onUpdateUser,
  groups,
  onCreateGroup,
  existingUsers
}) => {
  const [editUser, setEditUser] = useState<UserEntry>({
    Username: '',
    Group: [],
    Home_directory: '',
    Shell: '/bin/bash'
  });

  const [isGroupSelectionDialogOpen, setIsGroupSelectionDialogOpen] = useState(false);

  // 初始化 editUser
  useEffect(() => {
    setEditUser({
      Username: user.Username,
      Group: user.Group,
      Home_directory: user.Home_directory,
      Shell: user.Shell
    });
  }, [user]);

  // 當 Username 改變時自動更新 Home_directory
  useEffect(() => {
    if (editUser.Username) {
      setEditUser(prev => ({
        ...prev,
        Home_directory: `/home/${editUser.Username}`
      }));
    }
  }, [editUser.Username]);

  // 檢查名稱是否重複
  const isDuplicateName = Object.values(existingUsers).some(existingUser =>
    existingUser.Username === editUser.Username &&
    existingUser.Username !== user.Username &&
    editUser.Username !== ''
  );

  const handleUpdateUser = () => {
    if (isDuplicateName) return;
    onUpdateUser(editUser);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Edit user information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input
                placeholder="enter username"
                value={editUser.Username}
                onChange={(e) => setEditUser({ ...editUser, Username: e.target.value })}
              />
              {isDuplicateName && (
                <p className="text-red-500 text-sm mt-1">
                  The name already exists, you need to change it.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Group</label>
              <Button
                variant="outline"
                className="w-full justify-start text-gray-500"
                onClick={() => setIsGroupSelectionDialogOpen(true)}
              >
                Add to group
              </Button>
              {editUser.Group.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {editUser.Group.map(group => (
                    <span key={group} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {group}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Home directory</label>
              <Input
                value={editUser.Home_directory}
                readOnly
                className="bg-gray-100"
                placeholder="Auto-generated based on username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Shell</label>
              <Select
                value={editUser.Shell}
                onValueChange={(value) => setEditUser({ ...editUser, Shell: value })}
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

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUser}
                style={{ backgroundColor: '#7B86AA' }}
                className="flex-1 hover:opacity-90"
                disabled={isDuplicateName || !editUser.Username}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <GroupSelectionDialog
        isOpen={isGroupSelectionDialogOpen}
        onOpenChange={setIsGroupSelectionDialogOpen}
        groups={groups}
        selectedGroups={editUser.Group}
        onGroupsChange={(groups) => setEditUser(prev => ({ ...prev, Group: groups }))}
        onCreateGroup={onCreateGroup}
      />
    </>
  );
};