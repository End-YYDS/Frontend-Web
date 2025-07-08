import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit } from 'lucide-react';
import type { User } from './types';
import { AddUserDialog } from './AddUserDialog';
import { EditUserDialog } from './EditUserDialog';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (id: number, user: Omit<User, 'id'>) => void;
  onDeleteUser: (id: number) => void;
  onDeleteSelectedUsers: (ids: number[]) => void;
  groups: { id: number; name: string; users: string[] }[];
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
  itemsPerPage
}) => {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.groups.some(group => group.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map(user => user.id));
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditUserDialogOpen(true);
  };

  const handleDeleteSelectedUsers = () => {
    onDeleteSelectedUsers(selectedUsers);
    setSelectedUsers([]);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <AddUserDialog
          isOpen={isAddUserDialogOpen}
          onOpenChange={setIsAddUserDialogOpen}
          onAddUser={onAddUser}
          groups={groups}
          onCreateGroup={onCreateGroup}
          existingUsers={users}
          trigger={
            <Button className="bg-[#7B86AA] hover:bg-[#7B86AA]">
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          }
        />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              disabled={selectedUsers.length === 0}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-sm mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>確定要刪除選中的使用者嗎？</AlertDialogTitle>
              <AlertDialogDescription>
                此操作無法還原
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSelectedUsers}>
                刪除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm ml-auto"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                onChange={handleSelectAllUsers}
              />
            </TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Home directory</TableHead>
            <TableHead>Shell</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentUsers.map((user, index) => (
            <TableRow key={user.id}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleSelectUser(user.id)}
                />
              </TableCell>
              <TableCell>{index + 1}.</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.groups.join(', ')}</TableCell>
              <TableCell>{user.homeDirectory}</TableCell>
              <TableCell>{user.shell}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-sm mx-auto">
                      <AlertDialogHeader>
                        <AlertDialogTitle>確定要刪除 {user.username} 嗎？</AlertDialogTitle>
                        <AlertDialogDescription>
                          此操作無法還原
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteUser(user.id)}>
                          刪除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingUser && (
        <EditUserDialog
          isOpen={isEditUserDialogOpen}
          onOpenChange={setIsEditUserDialogOpen}
          user={editingUser}
          onUpdateUser={(user) => onUpdateUser(editingUser.id, user)}
          groups={groups}
          onCreateGroup={onCreateGroup}
          existingUsers={users}
        />
      )}
    </div>
  );
};