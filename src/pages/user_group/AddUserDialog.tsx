import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GroupSelectionDialog } from './GroupSelectionDialog';
import type {
  CreateUserRequest,
  GetUserEntry,
  GroupEntry,
  GroupsCollection,
} from '@/api/openapi-client';

interface GroupArrayItem {
  id: number;
  name: string;
  users: string[];
  gid?: string;
}

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (user: CreateUserRequest) => void;
  groups: GroupsCollection | GroupArrayItem[];
  onCreateGroup: (name: string) => void;
  trigger: React.ReactNode;
  existingUsers: Record<string, Pick<GetUserEntry, 'Username'>>;
}

const shellOptions = [
  { value: '/bin/bash', label: 'bash' },
  { value: '/bin/zsh', label: 'zsh' },
  { value: '/usr/bin/fish', label: 'fish' },
  { value: '/bin/sh', label: 'sh' },
];

export const AddUserDialog: React.FC<AddUserDialogProps> = ({
  isOpen,
  onOpenChange,
  onAddUser,
  groups,
  onCreateGroup,
  trigger,
  existingUsers,
}) => {
  const InitUser: CreateUserRequest = {
    Username: '',
    Password: '',
    Cn: '',
    Sn: '',
    HomeDirectory: '',
    Shell: '/bin/bash',
    GivenName: '',
    DisplayName: '',
    Group: [],
    Gecos: '',
  };

  const [newUser, setNewUser] = useState<CreateUserRequest>(InitUser);

  const [isGroupSelectionDialogOpen, setIsGroupSelectionDialogOpen] = useState(false);

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

  useEffect(() => {
    setNewUser((prev) => ({
      ...prev,
      Home_directory: prev.Username ? `/home/${prev.Username}` : '',
    }));
  }, [newUser.Username]);

  const isDuplicateName = Object.values(existingUsers || {}).some(
    (user) => user.Username === newUser.Username && newUser.Username !== '',
  );

  const handleAddUser = () => {
    if (isDuplicateName) return;
    onAddUser(newUser);
    setNewUser(InitUser);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className='max-w-md mx-auto'>
          <DialogHeader>
            <DialogTitle>Create a new user</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 max-h-[70vh] overflow-y-auto pr-2'>
            {/* Username */}
            <div>
              <label className='block text-sm font-medium mb-1'>Username</label>
              <Input
                placeholder='enter username'
                value={newUser.Username}
                onChange={(e) => setNewUser({ ...newUser, Username: e.target.value })}
              />
              {isDuplicateName && (
                <p className='text-red-500 text-sm mt-1'>
                  The name already exists, please change it.
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className='block text-sm font-medium mb-1'>Password</label>
              <Input
                type='password'
                placeholder='enter password'
                value={newUser.Password}
                onChange={(e) => setNewUser({ ...newUser, Password: e.target.value })}
              />
            </div>

            {/* Full name (Cn) */}
            <div>
              <label className='block text-sm font-medium mb-1'>Full name</label>
              <Input
                placeholder='enter full name'
                value={newUser.Cn}
                onChange={(e) => setNewUser({ ...newUser, Cn: e.target.value })}
              />
            </div>

            {/* Last name (Sn) */}
            <div>
              <label className='block text-sm font-medium mb-1'>Last name</label>
              <Input
                placeholder='enter last name'
                value={newUser.Sn}
                onChange={(e) => setNewUser({ ...newUser, Sn: e.target.value })}
              />
            </div>

            {/* Given name */}
            <div>
              <label className='block text-sm font-medium mb-1'>Given name</label>
              <Input
                placeholder='enter given name'
                value={newUser.GivenName}
                onChange={(e) => setNewUser({ ...newUser, GivenName: e.target.value })}
              />
            </div>

            {/* Display name */}
            <div>
              <label className='block text-sm font-medium mb-1'>Display name</label>
              <Input
                placeholder='enter display name'
                value={newUser.DisplayName}
                onChange={(e) => setNewUser({ ...newUser, DisplayName: e.target.value })}
              />
            </div>

            {/* Gecos */}
            <div>
              <label className='block text-sm font-medium mb-1'>Gecos</label>
              <Input
                placeholder='enter Gecos'
                value={newUser.Gecos}
                onChange={(e) => setNewUser({ ...newUser, Gecos: e.target.value })}
              />
            </div>

            {/* Groups */}
            <div>
              <label className='block text-sm font-medium mb-1'>Group</label>
              <Button
                variant='outline'
                className='w-full justify-start text-gray-500'
                onClick={() => setIsGroupSelectionDialogOpen(true)}
              >
                Add to group
              </Button>
              {newUser.Group.length > 0 && (
                <div className='mt-2 flex flex-wrap gap-1'>
                  {newUser.Group.map((group) => (
                    <span
                      key={group}
                      className='bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs'
                    >
                      {group}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Home directory */}
            <div>
              <label className='block text-sm font-medium mb-1'>Home directory</label>
              <Input
                value={newUser.HomeDirectory}
                readOnly
                className='bg-gray-100'
                placeholder='Auto-generated based on username'
              />
            </div>

            {/* Shell */}
            <div>
              <label className='block text-sm font-medium mb-1'>Shell</label>
              <Select
                value={newUser.Shell}
                onValueChange={(value) => setNewUser({ ...newUser, Shell: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select shell' />
                </SelectTrigger>
                <SelectContent>
                  {shellOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className='flex gap-2 pt-4'>
              <Button variant='outline' onClick={() => onOpenChange(false)} className='flex-1'>
                Cancel
              </Button>
              <Button
                onClick={handleAddUser}
                style={{ backgroundColor: '#7B86AA' }}
                className='flex-1 hover:opacity-90'
                disabled={isDuplicateName || !newUser.Username}
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
        groups={normalizedGroups}
        selectedGroups={newUser.Group}
        onGroupsChange={(selected) => setNewUser((prev) => ({ ...prev, Group: selected }))}
        onCreateGroup={onCreateGroup}
      />
    </>
  );
};
