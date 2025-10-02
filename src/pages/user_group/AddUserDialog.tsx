import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User } from './types';
import { GroupSelectionDialog } from './GroupSelectionDialog';

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (user: Omit<User, 'id'>) => void;
  groups: { id: number; name: string; users: string[] }[];
  onCreateGroup: (name: string) => void;
  trigger: React.ReactNode;
  existingUsers: User[];
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
  const [newUser, setNewUser] = useState({
    username: '',
    groups: [] as string[],
    homeDirectory: '',
    shell: '/bin/bash'
  });
  const [isGroupSelectionDialogOpen, setIsGroupSelectionDialogOpen] = useState(false);

  // 當 username 改變時自動更新 home directory
  useEffect(() => {
    if (newUser.username) {
      setNewUser(prev => ({
        ...prev,
        homeDirectory: `/home/${newUser.username}`
      }));
    } else {
      setNewUser(prev => ({
        ...prev,
        homeDirectory: ''
      }));
    }
  }, [newUser.username]);

  const isDuplicateName = existingUsers.some(user => user.username === newUser.username && newUser.username !== '');

  const handleAddUser = () => {
    if (isDuplicateName) return;
    
    onAddUser(newUser);
    setNewUser({
      username: '',
      groups: [],
      homeDirectory: '',
      shell: '/bin/bash'
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
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input
                placeholder="enter username"
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              />
              {isDuplicateName && (
                <p className="text-red-500 text-sm mt-1">The name is already exists, you need to change it.</p>
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
              {newUser.groups.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {newUser.groups.map(group => (
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
                value={newUser.homeDirectory}
                readOnly
                className="bg-gray-100"
                placeholder="Auto-generated based on username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Shell</label>
              <Select value={newUser.shell} onValueChange={(value) => setNewUser({...newUser, shell: value})}>
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
                onClick={handleAddUser} 
                style={{ backgroundColor: '#7B86AA' }}
                className="flex-1 hover:opacity-90"
                disabled={isDuplicateName || !newUser.username}
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
        selectedGroups={newUser.groups}
        onGroupsChange={(groups) => setNewUser(prev => ({ ...prev, groups }))}
        onCreateGroup={onCreateGroup}
      />
    </>
  );
};