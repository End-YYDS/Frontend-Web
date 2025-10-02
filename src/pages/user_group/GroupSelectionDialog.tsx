
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from 'lucide-react';

interface GroupSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  groups: { id: number; name: string; users: string[] }[];
  selectedGroups: string[];
  onGroupsChange: (groups: string[]) => void;
  onCreateGroup: (name: string) => void;
}

export const GroupSelectionDialog: React.FC<GroupSelectionDialogProps> = ({
  isOpen,
  onOpenChange,
  groups,
  selectedGroups,
  onGroupsChange,
  onCreateGroup
}) => {
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const handleGroupToggle = (groupName: string) => {
    const newGroups = selectedGroups.includes(groupName)
      ? selectedGroups.filter(g => g !== groupName)
      : [...selectedGroups, groupName];
    onGroupsChange(newGroups);
  };

  const handleCreateNewGroup = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName);
      const newGroups = [...selectedGroups, newGroupName];
      onGroupsChange(newGroups);
      setNewGroupName('');
      setIsCreateGroupDialogOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Add to group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-blue-600"
                onClick={() => setIsCreateGroupDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create a new group
              </Button>
              {groups.map(group => (
                <div key={group.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`group-${group.id}`}
                    checked={selectedGroups.includes(group.name)}
                    onCheckedChange={() => handleGroupToggle(group.name)}
                  />
                  <label htmlFor={`group-${group.id}`} className="text-sm">
                    {group.name}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={() => onOpenChange(false)}
                style={{ backgroundColor: '#7B86AA' }}
                className="flex-1 hover:opacity-90"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateGroupDialogOpen} onOpenChange={setIsCreateGroupDialogOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Create a new group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Group name</label>
              <Input
                placeholder="enter group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateGroupDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateNewGroup}
                style={{ backgroundColor: '#7B86AA' }}
                className="flex-1 hover:opacity-90"
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};