import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { CreateGroupRequest, GroupEntry } from '@/api/openapi-client';

interface AddGroupDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGroup: (group: CreateGroupRequest) => void;
  users: { uid: string; username: string }[];
  existingGroups: Record<string, GroupEntry>;
  trigger: React.ReactNode;
}

export const AddGroupDialog: React.FC<AddGroupDialogProps> = ({
  isOpen,
  onOpenChange,
  onAddGroup,
  users,
  trigger,
  existingGroups,
}) => {
  const [newGroup, setNewGroup] = useState<CreateGroupRequest>({
    Groupname: '',
    Users: [],
  });
  const isDuplicateName = Object.values(existingGroups).some(
    (group) => group.Groupname === newGroup.Groupname && newGroup.Groupname !== '',
  );
  const handleAddGroup = () => {
    if (isDuplicateName || !newGroup.Groupname) return;
    onAddGroup(newGroup);
    setNewGroup({
      Groupname: '',
      Users: [],
    });
    onOpenChange(false);
  };

  const handleGroupUserToggle = (username: string) => {
    setNewGroup((prev) => ({
      ...prev,
      Users: prev.Users.includes(username)
        ? prev.Users.filter((u) => u !== username)
        : [...prev.Users, username],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-w-md mx-auto'>
        <DialogHeader>
          <DialogTitle>Create a new group</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          {/* Group name */}
          <div>
            <label className='block text-sm font-medium mb-1'>Group name</label>
            <Input
              placeholder='enter group name'
              value={newGroup.Groupname}
              onChange={(e) => setNewGroup({ ...newGroup, Groupname: e.target.value })}
            />
            {isDuplicateName && (
              <p className='text-red-500 text-sm mt-1'>
                The name already exists, please choose another one.
              </p>
            )}
          </div>

          {/* Users list */}
          <div>
            <label className='block text-sm font-medium mb-1'>Users</label>
            <div className='space-y-2 max-h-[40vh] overflow-y-auto'>
              {users.map((user) => (
                <div key={user.uid} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`user-${user.uid}`}
                    checked={newGroup.Users.includes(user.username)}
                    onCheckedChange={() => handleGroupUserToggle(user.username)}
                  />
                  <label htmlFor={`user-${user.uid}`} className='text-sm'>
                    {user.username}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className='flex gap-2 pt-4'>
            <Button variant='outline' onClick={() => onOpenChange(false)} className='flex-1'>
              Cancel
            </Button>
            <Button
              onClick={handleAddGroup}
              style={{ backgroundColor: '#7B86AA' }}
              className='flex-1 hover:opacity-90'
              disabled={isDuplicateName || !newGroup.Groupname}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
