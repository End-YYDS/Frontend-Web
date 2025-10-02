import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { Group } from './types';

interface AddGroupDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGroup: (group: Omit<Group, 'id'>) => void;
  users: { id: number; username: string }[];
  trigger: React.ReactNode;
  existingGroups: Group[];
}

export const AddGroupDialog: React.FC<AddGroupDialogProps> = ({
  isOpen,
  onOpenChange,
  onAddGroup,
  users,
  trigger,
  existingGroups
}) => {
  const [newGroup, setNewGroup] = useState({
    name: '',
    users: [] as string[]
  });

  const isDuplicateName = existingGroups.some(group => group.name === newGroup.name && newGroup.name !== '');

  const handleAddGroup = () => {
    if (isDuplicateName) return;
    
    onAddGroup(newGroup);
    setNewGroup({
      name: '',
      users: []
    });
    onOpenChange(false);
  };

  const handleGroupUserToggle = (username: string) => {
    setNewGroup(prev => ({
      ...prev,
      users: prev.users.includes(username)
        ? prev.users.filter(u => u !== username)
        : [...prev.users, username]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Create a new group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Group name</label>
            <Input
              placeholder="enter group name"
              value={newGroup.name}
              onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
            />
            {isDuplicateName && (
              <p className="text-red-500 text-sm mt-1">The name is already exists, you need to change it.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Users</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {users.map(user => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={newGroup.users.includes(user.username)}
                    onCheckedChange={() => handleGroupUserToggle(user.username)}
                  />
                  <label htmlFor={`user-${user.id}`} className="text-sm">
                    {user.username}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleAddGroup} 
              style={{ backgroundColor: '#7B86AA' }}
              className="flex-1 hover:opacity-90"
              disabled={isDuplicateName || !newGroup.name}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};