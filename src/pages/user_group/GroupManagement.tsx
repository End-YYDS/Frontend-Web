import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit, Table } from 'lucide-react';
import type { Group } from './types';
import { AddGroupDialog } from './AddGroupDialog';
import { EditGroupDialog } from './EditGroupDialog';

interface GroupManagementProps {
  groups: Group[];
  users: { id: number; username: string }[];
  onAddGroup: (group: Omit<Group, 'id'>) => void;
  onUpdateGroup: (id: number, group: Omit<Group, 'id'>) => void;
  onDeleteGroup: (id: number) => void;
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
  itemsPerPage
}) => {
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentGroups = filteredGroups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setIsEditGroupDialogOpen(true);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <AddGroupDialog
          isOpen={isAddGroupDialogOpen}
          onOpenChange={setIsAddGroupDialogOpen}
          onAddGroup={onAddGroup}
          users={users}
          existingGroups={groups}
          trigger={
            <Button className="bg-[#7B86AA] hover:bg-[#7B86AA]">
              <Plus className="h-4 w-4 mr-2" />
              New Group
            </Button>
          }
        />

        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm ml-auto"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentGroups.map(group => (
          <Card key={group.id} className="p-4 border border-gray-300 shadow-sm rounded-md">
            <div className="mb-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-lg">{group.name}</h3>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => handleEditGroup(group)} className="gap-1">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-sm mx-auto">
                      <AlertDialogHeader>
                        <AlertDialogTitle>確定要刪除群組 {group.name} 嗎？</AlertDialogTitle>
                        <AlertDialogDescription>此操作無法還原</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteGroup(group.id)}>刪除</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* 分隔線 */}
              {/* <div className="mt-3.5 border-t border-gray-300 my-1" /> */}
              <hr className="mt-3.5 border-t border-gray-300 my-1"></hr>
            </div>

            <div className="text-sm text-gray-600">users</div>
            <div className="space-y-0.5">
              {group.users.map((user) => (
                <div key={user} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" />
                  <span>{user}</span>
                </div>
              ))}
            </div>
          </Card>

        ))}
      </div>

      {editingGroup && (
        <EditGroupDialog
          isOpen={isEditGroupDialogOpen}
          onOpenChange={setIsEditGroupDialogOpen}
          group={editingGroup}
          onUpdateGroup={(group) => onUpdateGroup(editingGroup.id, group)}
          users={users}
          existingGroups={groups}
        />
      )}
    </div>
  );
};