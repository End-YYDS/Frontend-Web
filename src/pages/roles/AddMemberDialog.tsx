
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MagnifyingGlassIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline';

interface Member {
  id: string;
  name: string;
  avatar?: string;
}

interface AddMemberDialogProps {
  allUsers: Member[];
  members: Member[];
  onAddMember: (user: Member) => void;
}

export function AddMemberDialog({ allUsers, members, onAddMember }: AddMemberDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchAllUsers, setSearchAllUsers] = useState('');

  const availableUsers = allUsers.filter(user => 
    !members.find(m => m.id === user.id) &&
    user.name.toLowerCase().includes(searchAllUsers.toLowerCase())
  );

  const handleAddMember = (user: Member) => {
    onAddMember(user);
    setIsOpen(false);
    setSearchAllUsers('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          style={{ backgroundColor: '#7B86AA' }}
          className="hover:opacity-90 text-white"
        >
          新增成員
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>選擇成員</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜尋使用者"
              value={searchAllUsers}
              onChange={(e) => setSearchAllUsers(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {availableUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                onClick={() => handleAddMember(user)}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium">{user.name}</span>
                </div>
                <PlusIcon className="w-4 h-4 text-gray-400" />
              </div>
            ))}
            {availableUsers.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                沒有可新增的使用者
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}