import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
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
import { Plus, Trash2, Edit } from 'lucide-react';
import type { GroupEntry } from './types';
import { AddGroupDialog } from './AddGroupDialog';
import { EditGroupDialog } from './EditGroupDialog';

interface GroupManagementProps {
  groups: Record<string, GroupEntry>;
  users: { uid: string; Username: string }[];
  onAddGroup: (group: Omit<GroupEntry, 'Groupname'> & { Groupname: string }) => void;
  onUpdateGroup: (gid: string, group: GroupEntry) => void;
  onDeleteGroup: (gid: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  currentPage: number;
  itemsPerPage: number;
}

export const GroupManagement: React.FC<GroupManagementProps> = ({
  groups,
  users,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  searchTerm,
  onSearchChange,
  currentPage,
  itemsPerPage,
}) => {
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const groupList = Object.entries(groups)
    .map(([gid, group]) => ({ gid, ...group }))
    .sort((a, b) => a.Groupname.localeCompare(b.Groupname));
  const filteredGroups = groupList.filter((group) =>
    group.Groupname.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const currentGroups = filteredGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const handleEditGroup = (gid: string) => {
    setEditingGroupId(gid);
    setIsEditGroupDialogOpen(true);
  };
  const editingGroup = editingGroupId ? groups[editingGroupId] : null;

  return (
    <div>
      <div className='flex flex-wrap gap-2 mb-4 items-center'>
        <AddGroupDialog
          isOpen={isAddGroupDialogOpen}
          onOpenChange={setIsAddGroupDialogOpen}
          onAddGroup={onAddGroup}
          users={users.map((u) => ({ uid: u.uid, username: u.Username }))}
          existingGroups={Object.fromEntries(
            Object.entries(groups).map(([gid, group]) => [gid, group]),
          )}
          trigger={
            <Button style={{ backgroundColor: '#7B86AA' }} className='hover:opacity-90'>
              <Plus className='h-4 w-4 mr-2' />
              New Group
            </Button>
          }
        />
        <Input
          placeholder='Search...'
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className='max-w-sm ml-auto'
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {currentGroups.map((group) => (
          <Card key={group.gid} className='p-4 border border-gray-300 shadow-sm rounded-md'>
            <div className='mb-2'>
              <div className='flex items-center justify-between'>
                <h3 className='font-medium text-lg'>{group.Groupname}</h3>
                <div className='flex gap-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleEditGroup(group.gid)}
                    className='gap-1'
                  >
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
                          Are you sure you want to delete group {group.Groupname}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteGroup(group.gid)}
                          className='bg-red-500 hover:bg-red-600'
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <hr className='mt-3.5 border-t border-gray-300 my-1' />
            </div>
            <div className='text-sm text-gray-600'>users</div>
            <div className='space-y-0.5'>
              {group.Users.map((uid) => {
                const user = users.find((u) => u.uid === uid);
                return (
                  <div key={uid} className='flex items-center gap-2 text-sm'>
                    {/* <input type='checkbox' /> */}
                    <span>{user ? user.Username : uid}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {editingGroup && editingGroupId && (
        <EditGroupDialog
          isOpen={isEditGroupDialogOpen}
          onOpenChange={setIsEditGroupDialogOpen}
          group={{ gid: editingGroupId, ...editingGroup }}
          onUpdateGroup={(group) => onUpdateGroup(editingGroupId, group)}
          users={users.map((u, index) => ({
            id: index,
            username: u.Username,
            uid: u.uid,
          }))}
          existingGroups={groupList}
        />
      )}
    </div>
  );
};
