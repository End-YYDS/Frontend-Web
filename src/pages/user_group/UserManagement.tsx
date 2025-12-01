import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import { AddUserDialog } from './AddUserDialog';
import { EditUserDialog } from './EditUserDialog';
import type { CreateUserRequest, PatchUserEntry } from '@/api/openapi-client';
import type { GroupRow, UserRow } from '.';

// export interface User extends UserEntry {
//   uid: string;
// }

interface UserManagementProps {
  users: UserRow[];
  onAddUser: (user: CreateUserRequest) => void;
  onUpdateUser: (uid: string, patch: PatchUserEntry) => void;
  onDeleteUser: (uid: string) => void;
  onDeleteSelectedUsers: (uids: string[]) => void;
  // groups: { gid: string; Groupname: string; Users: string[] }[];
  groups: GroupRow[];
  onCreateGroup: (name: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  currentPage: number;
  itemsPerPage: number;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onDeleteSelectedUsers,
  groups,
  onCreateGroup,
  searchTerm,
  onSearchChange,
  currentPage,
  itemsPerPage,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const sortedUsers = [...users].sort((a, b) => a.Username.localeCompare(b.Username));
  const filteredUsers = sortedUsers.filter(
    (user) =>
      user.Username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.Group.some((group) => group.toLowerCase().includes(searchTerm.toLowerCase())),
  );
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSelectUser = (uid: string) => {
    setSelectedUsers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid],
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map((user) => user.uid));
    }
  };

  const handleEditUser = (user: UserRow) => {
    setEditingUser(user);
    setIsEditUserDialogOpen(true);
  };

  const handleDeleteSelectedUsers = () => {
    onDeleteSelectedUsers(selectedUsers);
    setSelectedUsers([]);
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    setSelectedUsers([]);
    setIsEditMode(false);
  };

  return (
    <div>
      <div className='flex flex-wrap gap-2 mb-4 items-center'>
        {!isEditMode ? (
          <>
            <AddUserDialog
              isOpen={isAddUserDialogOpen}
              onOpenChange={setIsAddUserDialogOpen}
              onAddUser={onAddUser}
              groups={groups.map((group, idx) => ({
                id: idx,
                name: group.Groupname,
                users: group.Users ?? [],
                gid: group.gid,
              }))}
              onCreateGroup={onCreateGroup}
              existingUsers={Object.fromEntries(
                users.map((user) => [user.uid, { Username: user.Username }]),
              )}
              trigger={
                <Button style={{ backgroundColor: '#7B86AA' }} className='hover:opacity-90'>
                  <Plus className='h-4 w-4 mr-2' />
                  New
                </Button>
              }
            />

            <Button variant='outline' onClick={() => setIsEditMode(true)}>
              <Edit className='h-4 w-4 mr-2' />
              Edit
            </Button>
          </>
        ) : (
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant='destructive'
                  disabled={selectedUsers.length === 0}
                  className='bg-red-500 hover:bg-red-600'
                >
                  <Trash2 className='h-4 w-4 mr-2' />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className='max-w-sm mx-auto'>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to delete the selected users?
                  </AlertDialogTitle>
                  <AlertDialogDescription>This operation cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteSelectedUsers}
                    className='bg-red-500 hover:bg-red-600'
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant='outline' onClick={handleCancelEdit}>
              <X className='h-4 w-4 mr-2' />
              Cancel
            </Button>
          </>
        )}

        <Input
          placeholder='Search...'
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className='max-w-sm ml-auto'
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {isEditMode && (
              <TableHead className='w-12'>
                <input
                  type='checkbox'
                  checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                  onChange={handleSelectAllUsers}
                />
              </TableHead>
            )}
            <TableHead>Username</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Home directory</TableHead>
            <TableHead>Shell</TableHead>
            {isEditMode && <TableHead>Operation</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentUsers.map((user) => (
            <TableRow key={user.uid}>
              {isEditMode && (
                <TableCell>
                  <input
                    type='checkbox'
                    checked={selectedUsers.includes(user.uid)}
                    onChange={() => handleSelectUser(user.uid)}
                  />
                </TableCell>
              )}
              <TableCell className='max-w-40 truncate' title={user.Username}>
                {user.Username}
              </TableCell>
              <TableCell className='max-w-[200px] truncate' title={user.Group.join(', ')}>
                {user.Group.join(', ')}
              </TableCell>
              <TableCell className='max-w-[220px] truncate' title={user.HomeDirectory}>
                {user.HomeDirectory}
              </TableCell>
              <TableCell className='max-w-[150px] truncate' title={user.Shell}>
                {user.Shell}
              </TableCell>
              {isEditMode && (
                <TableCell>
                  <div className='flex gap-1'>
                    <Button variant='ghost' size='sm' onClick={() => handleEditUser(user)}>
                      <Edit className='h-3 w-3' />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-red-500 hover:text-red-700 hover:bg-red-50'
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className='max-w-sm mx-auto'>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you sure you want to delete {user.Username}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This operation cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteUser(user.uid)}
                            className='bg-red-500 hover:bg-red-600'
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingUser && (
        <EditUserDialog
          isOpen={isEditUserDialogOpen}
          onOpenChange={setIsEditUserDialogOpen}
          user={editingUser}
          onUpdateUser={(patch) => onUpdateUser(editingUser.uid, patch)}
          groups={groups.map((group, idx) => ({
            id: idx,
            name: group.Groupname,
            users: group.Users ?? [],
          }))}
          onCreateGroup={onCreateGroup}
          existingUsers={Object.fromEntries(
            users.map((user) => [user.uid, { Username: user.Username }]),
          )}
        />
      )}
    </div>
  );
};
