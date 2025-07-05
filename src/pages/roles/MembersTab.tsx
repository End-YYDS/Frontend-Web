import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MagnifyingGlassIcon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { AddMemberDialog } from './AddMemberDialog';

interface Member {
  id: string;
  name: string;
  avatar?: string;
}

interface MembersTabProps {
  members: Member[];
  allUsers: Member[];
  searchMember: string;
  isEveryoneRole?: boolean;
  onSearchMemberChange: (search: string) => void;
  onAddMember: (user: Member) => void;
  onRemoveMember: (memberId: string) => void;
}

export function MembersTab({ 
  members, 
  allUsers, 
  searchMember, 
  isEveryoneRole,
  onSearchMemberChange, 
  onAddMember, 
  onRemoveMember 
}: MembersTabProps) {
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchMember.toLowerCase())
  );

  return (
    <div className="space-y-6 mt-6">
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="搜尋成員"
            value={searchMember}
            onChange={(e) => onSearchMemberChange(e.target.value)}
            className="pl-10"
          />
        </div>
        {!isEveryoneRole && (
          <AddMemberDialog 
            allUsers={allUsers}
            members={members}
            onAddMember={onAddMember}
          />
        )}
      </div>
      
      <div className="space-y-3">
        {filteredMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-gray-600" />
              </div>
              <span className="font-medium">{member.name}</span>
            </div>
            {!isEveryoneRole && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveMember(member.id)}
                className="text-red-500 hover:text-red-700"
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        {filteredMembers.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            {members.length === 0 ? '尚無成員' : '沒有符合搜尋條件的成員'}
          </div>
        )}
      </div>
    </div>
  );
}