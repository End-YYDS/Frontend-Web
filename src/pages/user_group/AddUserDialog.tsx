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
  onAddUser: (user: CreateUserRequest) => Promise<void> | void;
  groups: GroupsCollection | GroupArrayItem[];
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
  const [pendingGroups, setPendingGroups] = useState<string[]>([]);

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

  const existingGroupNames = React.useMemo(() => {
    const lower = normalizedGroups.map((g) => g.name.toLowerCase());
    return new Set(lower);
  }, [normalizedGroups]);

  const combinedGroups: GroupArrayItem[] = React.useMemo(() => {
    const extraGroups = pendingGroups
      .filter((name) => !existingGroupNames.has(name.toLowerCase()))
      .map((name, idx) => ({
        id: normalizedGroups.length + idx,
        name,
        users: [],
      }));
    return [...normalizedGroups, ...extraGroups];
  }, [normalizedGroups, pendingGroups, existingGroupNames]);

  const handleCreateGroupDraft = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    if (existingGroupNames.has(lower) || pendingGroups.some((g) => g.toLowerCase() === lower)) {
      return;
    }
    setPendingGroups((prev) => [...prev, trimmed]);
  };

  useEffect(() => {
    setNewUser((prev) => ({
      ...prev,
      HomeDirectory: prev.Username ? `/home/${prev.Username}` : '',
    }));
  }, [newUser.Username]);

  const isDuplicateName = Object.values(existingUsers || {}).some(
    (user) => user.Username === newUser.Username && newUser.Username !== '',
  );

  const handleAddUser = async () => {
    if (isDuplicateName) return;
    try {
      await Promise.resolve(onAddUser(newUser));
      setNewUser(InitUser);
      setPendingGroups([]);
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to add user or create groups', err);
    }
  };
  const isEmpty = {
    Username: newUser.Username.trim() === '',
    Password: newUser.Password.trim() === '',
    Cn: newUser.Cn.trim() === '',
    Sn: newUser.Sn.trim() === '',
    GivenName: newUser.GivenName.trim() === '',
    DisplayName: newUser.DisplayName.trim() === '',
  };
  const [touched, setTouched] = useState({
    Username: false,
    Password: false,
    Cn: false,
    Sn: false,
    GivenName: false,
    DisplayName: false,
  });

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
                onChange={(e) =>
                  setNewUser({ ...newUser, Username: e.target.value })
                }
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, Username: true }))
                }
              />

              {touched.Username && isEmpty.Username && (
                <p className="text-red-500 text-sm mt-1">
                  Username is required.
                </p>
              )}

              {touched.Username && !isEmpty.Username && isDuplicateName && (
                <p className="text-red-500 text-sm mt-1">
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
                onChange={(e) =>
                  setNewUser({ ...newUser, Password: e.target.value })
                }
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, Password: true }))
                }
              />

              {touched.Password && isEmpty.Password && (
                <p className="text-red-500 text-sm mt-1">
                  Password is required.
                </p>
              )}
            </div>

            {/* Full name (Cn) */}
            <div>
              <label className='block text-sm font-medium mb-1'>Full name</label>
              <Input
                placeholder='enter full name'
                value={newUser.Cn}
                onChange={(e) =>
                  setNewUser({ ...newUser, Cn: e.target.value })
                }
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, Cn: true }))
                }
              />

              {touched.Cn && isEmpty.Cn && (
                <p className="text-red-500 text-sm mt-1">
                  Full name is required.
                </p>
              )}
            </div>

            {/* Last name (Sn) */}
            <div>
              <label className='block text-sm font-medium mb-1'>Last name</label>
              <Input
                placeholder='enter last name'
                value={newUser.Sn}
                onChange={(e) =>
                  setNewUser({ ...newUser, Sn: e.target.value })
                }
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, Sn: true }))
                }
              />

              {touched.Sn && isEmpty.Sn && (
                <p className="text-red-500 text-sm mt-1">
                  Full name is required.
                </p>
              )}
            </div>

            {/* Given name */}
            <div>
              <label className='block text-sm font-medium mb-1'>Given name</label>
              <Input
                placeholder='enter given name'
                value={newUser.GivenName}
                onChange={(e) =>
                  setNewUser({ ...newUser, GivenName: e.target.value })
                }
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, GivenName: true }))
                }
              />

              {touched.GivenName && isEmpty.GivenName && (
                <p className="text-red-500 text-sm mt-1">
                  Full name is required.
                </p>
              )}
            </div>

            {/* Display name */}
            <div>
              <label className='block text-sm font-medium mb-1'>Display name</label>
              <Input
                placeholder='enter display name'
                value={newUser.DisplayName}
                onChange={(e) =>
                  setNewUser({ ...newUser, DisplayName: e.target.value })
                }
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, DisplayName: true }))
                }
              />

              {touched.DisplayName && isEmpty.DisplayName && (
                <p className="text-red-500 text-sm mt-1">
                  Full name is required.
                </p>
              )}
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
                disabled={isDuplicateName || Object.values(isEmpty).some(Boolean)}
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
        groups={combinedGroups}
        selectedGroups={newUser.Group}
        onGroupsChange={(selected) => setNewUser((prev) => ({ ...prev, Group: selected }))}
        onCreateGroup={handleCreateGroupDraft}
      />
    </>
  );
};
