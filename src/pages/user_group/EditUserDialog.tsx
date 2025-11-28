import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import type { UserRow } from '.';
import type { GetUserEntry, PatchUserEntry } from '@/api/openapi-client';

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserRow;
  onUpdateUser: (patch: PatchUserEntry) => void;
  groups: { id: number; name: string; users: string[] }[];
  onCreateGroup: (name: string) => void;
  existingUsers: Record<string, Pick<GetUserEntry, 'Username'>>;
}

const shellOptions = [
  { value: '/bin/bash', label: 'bash' },
  { value: '/bin/zsh', label: 'zsh' },
  { value: '/usr/bin/fish', label: 'fish' },
  { value: '/bin/sh', label: 'sh' },
];

type EditableUser = {
  Password: string;
} & Pick<
  GetUserEntry,
  'Cn' | 'Sn' | 'HomeDirectory' | 'Shell' | 'GivenName' | 'DisplayName' | 'Group' | 'Gecos'
>;

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  isOpen,
  onOpenChange,
  user,
  onUpdateUser,
  groups,
  onCreateGroup,
}) => {
  const [editUser, setEditUser] = useState<EditableUser>({
    Password: '',
    Cn: '',
    Sn: '',
    HomeDirectory: '',
    Shell: '/bin/bash',
    GivenName: '',
    DisplayName: '',
    Group: [],
    Gecos: '',
  });

  const [isGroupSelectionDialogOpen, setIsGroupSelectionDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setEditUser({
      Password: '',
      Cn: user.Cn,
      Sn: user.Sn,
      HomeDirectory: user.HomeDirectory,
      Shell: user.Shell,
      GivenName: user.GivenName,
      DisplayName: user.DisplayName,
      Group: user.Group ?? [],
      Gecos: user.Gecos,
    });
  }, [user]);

  const handleUpdateUser = () => {
    const patch: PatchUserEntry = {};
    if (editUser.Password.trim() !== '') {
      patch.Password = editUser.Password;
    }
    if (editUser.Cn !== user.Cn) patch.Cn = editUser.Cn;
    if (editUser.Sn !== user.Sn) patch.Sn = editUser.Sn;
    if (editUser.HomeDirectory !== user.HomeDirectory) {
      patch.HomeDirectory = editUser.HomeDirectory;
    }
    if (editUser.Shell !== user.Shell) patch.Shell = editUser.Shell;
    if (editUser.GivenName !== user.GivenName) patch.GivenName = editUser.GivenName;
    if (editUser.DisplayName !== user.DisplayName) {
      patch.DisplayName = editUser.DisplayName;
    }
    if (editUser.Gecos !== user.Gecos) patch.Gecos = editUser.Gecos;
    if (
      editUser.Group.length !== user.Group.length ||
      editUser.Group.some((g) => !user.Group.includes(g))
    ) {
      patch.Group = editUser.Group;
    }
    if (Object.keys(patch).length === 0) {
      onOpenChange(false);
      return;
    }
    console.log('Patch to submit:', patch);
    onUpdateUser(patch);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-md mx-auto'>
          <DialogHeader>
            <DialogTitle>Edit user information</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 max-h-[70vh] overflow-y-auto pr-2'>
            {/* Username (不可改) */}
            <div>
              <label className='block text-sm font-medium mb-1'>Username</label>
              <Input value={user.Username} readOnly className='bg-gray-100' />
            </div>
            {/* Password */}
            <div>
              <label className='block text-sm font-medium mb-1'>Password</label>
              <Input
                type='password'
                placeholder='enter new password (leave blank to keep)'
                value={editUser.Password}
                onChange={(e) => setEditUser((prev) => ({ ...prev, Password: e.target.value }))}
              />
            </div>

            {/* Full name (Cn) */}
            <div>
              <label className='block text-sm font-medium mb-1'>Full name</label>
              <Input
                placeholder='enter full name'
                value={editUser.Cn}
                onChange={(e) => setEditUser((prev) => ({ ...prev, Cn: e.target.value }))}
              />
            </div>

            {/* Last name (Sn) */}
            <div>
              <label className='block text-sm font-medium mb-1'>Last name</label>
              <Input
                placeholder='enter last name'
                value={editUser.Sn}
                onChange={(e) => setEditUser((prev) => ({ ...prev, Sn: e.target.value }))}
              />
            </div>

            {/* Given name */}
            <div>
              <label className='block text-sm font-medium mb-1'>Given name</label>
              <Input
                placeholder='enter given name'
                value={editUser.GivenName}
                onChange={(e) => setEditUser((prev) => ({ ...prev, Given_name: e.target.value }))}
              />
            </div>

            {/* Display name */}
            <div>
              <label className='block text-sm font-medium mb-1'>Display name</label>
              <Input
                placeholder='enter display name'
                value={editUser.DisplayName}
                onChange={(e) => setEditUser((prev) => ({ ...prev, Display_name: e.target.value }))}
              />
            </div>

            {/* Gecos */}
            <div>
              <label className='block text-sm font-medium mb-1'>Gecos</label>
              <Input
                placeholder='enter Gecos'
                value={editUser.Gecos}
                onChange={(e) => setEditUser((prev) => ({ ...prev, Gecos: e.target.value }))}
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
              {editUser.Group.length > 0 && (
                <div className='mt-2 flex flex-wrap gap-1'>
                  {editUser.Group.map((group) => (
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
                value={editUser.HomeDirectory}
                onChange={(e) =>
                  setEditUser((prev) => ({ ...prev, Home_directory: e.target.value }))
                }
              />
            </div>

            {/* Shell */}
            <div>
              <label className='block text-sm font-medium mb-1'>Shell</label>
              <Select
                value={editUser.Shell}
                onValueChange={(value) => setEditUser((prev) => ({ ...prev, Shell: value }))}
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
                onClick={handleUpdateUser}
                style={{ backgroundColor: '#7B86AA' }}
                className='flex-1 hover:opacity-90'
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
        onGroupsChange={(groups) => setEditUser((prev) => ({ ...prev, Group: groups }))}
        onCreateGroup={onCreateGroup}
      />
    </>
  );
};
