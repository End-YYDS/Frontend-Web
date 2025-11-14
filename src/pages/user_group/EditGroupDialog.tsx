import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

// 從 types.ts 匯入
import type { GroupEntry, UserEntry } from './types';

interface UserArrayItem {
  id: number;
  username: string;
}

interface EditGroupDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  group: GroupEntry & { id?: number; gid?: string };
  onUpdateGroup: (group: GroupEntry) => void;
  users: UserArrayItem[] | Record<string, UserEntry>;
  existingGroups: (GroupEntry & { id?: number })[];
}

export const EditGroupDialog: React.FC<EditGroupDialogProps> = ({
  isOpen,
  onOpenChange,
  group,
  onUpdateGroup,
  users,
  existingGroups,
}) => {
  const [editGroup, setEditGroup] = useState<GroupEntry>({
    Groupname: '',
    Users: [],
  });
  const normalizedUsers: UserArrayItem[] = React.useMemo(() => {
    if (Array.isArray(users)) return users;
    const recordUsers = users as Record<string, UserEntry>;
    return Object.entries(recordUsers).map(([, user], idx) => ({
      id: idx,
      username: user.Username,
    }));
  }, [users]);
  useEffect(() => {
    if (group) {
      setEditGroup({
        Groupname: group.Groupname,
        Users: group.Users,
      });
    }
  }, [group]);

  const isDuplicateName = existingGroups.some(
    (existingGroup) =>
      existingGroup.Groupname === editGroup.Groupname &&
      existingGroup.Groupname !== group.Groupname &&
      editGroup.Groupname !== '',
  );

  const handleUpdateGroup = () => {
    if (isDuplicateName) return;

    onUpdateGroup(editGroup);
    onOpenChange(false);
  };

  const handleGroupUserToggle = (username: string) => {
    setEditGroup((prev) => ({
      ...prev,
      Users: prev.Users.includes(username)
        ? prev.Users.filter((u) => u !== username)
        : [...prev.Users, username],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md mx-auto'>
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          {/* Group name */}
          <div>
            <label className='block text-sm font-medium mb-1'>Group name</label>
            <Input
              placeholder='Enter group name'
              value={editGroup.Groupname}
              onChange={(e) => setEditGroup({ ...editGroup, Groupname: e.target.value })}
            />
            {isDuplicateName && (
              <p className='text-red-500 text-sm mt-1'>
                The name already exists, please change it.
              </p>
            )}
          </div>

          {/* Users list */}
          <div>
            <label className='block text-sm font-medium mb-1'>Users</label>
            <div className='space-y-2 max-h-40 overflow-y-auto'>
              {normalizedUsers.map((user) => (
                <div key={user.id} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`edit-user-${user.id}`}
                    checked={editGroup.Users.includes(user.username)}
                    onCheckedChange={() => handleGroupUserToggle(user.username)}
                  />
                  <label htmlFor={`edit-user-${user.id}`} className='text-sm'>
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
              onClick={handleUpdateGroup}
              style={{ backgroundColor: '#7B86AA' }}
              className='flex-1 hover:opacity-90'
              disabled={isDuplicateName || !editGroup.Groupname}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
