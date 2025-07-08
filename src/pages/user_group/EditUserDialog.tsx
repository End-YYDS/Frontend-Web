
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from './types';
import { GroupSelectionDialog } from './GroupSelectionDialog';

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onUpdateUser: (user: Omit<User, 'id'>) => void;
  groups: { id: number; name: string; users: string[] }[];
  onCreateGroup: (name: string) => void;
  existingUsers: User[];
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  isOpen,
  onOpenChange,
  user,
  onUpdateUser,
  groups,
  onCreateGroup,
  existingUsers
}) => {
  const [editUser, setEditUser] = useState({
    username: '',
    groups: [] as string[],
    homeDirectory: '',
    shell: ''
  });
  const [isGroupSelectionDialogOpen, setIsGroupSelectionDialogOpen] = useState(false);

  useEffect(() => {
    setEditUser({
      username: user.username,
      groups: user.groups,
      homeDirectory: user.homeDirectory,
      shell: user.shell
    });
  }, [user]);

  const isDuplicateName = existingUsers.some(existingUser => 
    existingUser.username === editUser.username && 
    existingUser.id !== user.id && 
    editUser.username !== ''
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
                value={editUser.username}
                onChange={(e) => setEditUser({...editUser, username: e.target.value})}
              />
              {isDuplicateName && (
                <p className="text-red-500 text-sm mt-1">名字已重複，需要換一個名字</p>
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
              {editUser.groups.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {editUser.groups.map(group => (
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
                placeholder="enter home directory"
                value={editUser.homeDirectory}
                onChange={(e) => setEditUser({...editUser, homeDirectory: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Shell</label>
              <Input
                placeholder="enter shell"
                value={editUser.shell}
                onChange={(e) => setEditUser({...editUser, shell: e.target.value})}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateUser} 
                className="flex-1"
                disabled={isDuplicateName || !editUser.username}
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
        selectedGroups={editUser.groups}
        onGroupsChange={(groups) => setEditUser(prev => ({ ...prev, groups }))}
        onCreateGroup={onCreateGroup}
      />
    </>
  );
};