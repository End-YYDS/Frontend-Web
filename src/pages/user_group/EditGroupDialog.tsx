import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { Group } from './types';

interface EditGroupDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
  onUpdateGroup: (group: Omit<Group, 'id'>) => void;
  users: { id: number; username: string }[];
  existingGroups: Group[];
}

export const EditGroupDialog: React.FC<EditGroupDialogProps> = ({
  isOpen,
  onOpenChange,
  group,
  onUpdateGroup,
  users,
  existingGroups
}) => {
  const [editGroup, setEditGroup] = useState({
    name: '',
    users: [] as string[]
  });

  useEffect(() => {
    setEditGroup({
      name: group.name,
      users: group.users
    });
  }, [group]);

  const isDuplicateName = existingGroups.some(existingGroup => 
    existingGroup.name === editGroup.name && 
    existingGroup.id !== group.id && 
    editGroup.name !== ''
  );

  const handleUpdateGroup = () => {
    if (isDuplicateName) return;
    
    onUpdateGroup(editGroup);
    onOpenChange(false);
  };

  const handleGroupUserToggle = (username: string) => {
    setEditGroup(prev => ({
      ...prev,
      users: prev.users.includes(username)
        ? prev.users.filter(u => u !== username)
        : [...prev.users, username]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Edit group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Group name</label>
            <Input
              placeholder="enter group name"
              value={editGroup.name}
              onChange={(e) => setEditGroup({...editGroup, name: e.target.value})}
            />
            {isDuplicateName && (
              <p className="text-red-500 text-sm mt-1">名字已重複，需要換一個名字</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Users</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {users.map(user => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-user-${user.id}`}
                    checked={editGroup.users.includes(user.username)}
                    onCheckedChange={() => handleGroupUserToggle(user.username)}
                  />
                  <label htmlFor={`edit-user-${user.id}`} className="text-sm">
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
              onClick={handleUpdateGroup} 
              className="flex-1"
              disabled={isDuplicateName || !editGroup.name}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};