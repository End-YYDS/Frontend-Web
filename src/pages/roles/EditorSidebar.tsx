import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export interface Member {
  id: string;
  name: string;
  avatar?: string;
}

export interface Role {
  id: string;
  name: string;
  color: string;
  permissions: number; // bit operation
  memberCount: number;
  members: Member[];
}

export interface RoleEditorSidebarProps {
  roleName: string;
  selectedColor: string;
  currentRole: Role;
  allRoles: Role[];
  onBack: () => void;
  onRoleSelect: (role: Role) => void;
}

export function RoleEditorSidebar({ 
  roleName, 
  selectedColor, 
  currentRole,
  allRoles, 
  onBack, 
  onRoleSelect 
}: RoleEditorSidebarProps) {
  const everyoneRole = allRoles.find(role => role.id === 'everyone');
  const otherRoles = allRoles.filter(role => role.id !== 'everyone' && role.id !== currentRole.id);

  return (
    <div className="col-span-4">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="space-y-2">
          {/* Current Role (highlighted) */}
          <div className="flex items-center p-3 bg-gray-100 rounded-lg">
            <div 
              className="w-3 h-3 rounded-full mr-3"
              style={{ backgroundColor: selectedColor }}
            ></div>
            <span className="font-medium">{roleName}</span>
          </div>
          
          {/* @everyone role */}
          {everyoneRole && currentRole.id !== 'everyone' && (
            <div 
              className="flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              onClick={() => onRoleSelect(everyoneRole)}
            >
              <div 
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: everyoneRole.color }}
              ></div>
              <span>@everyone</span>
            </div>
          )}
          
          {/* Other roles */}
          {otherRoles.map((role) => (
            <div 
              key={role.id}
              className="flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              onClick={() => onRoleSelect(role)}
            >
              <div 
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: role.color }}
              ></div>
              <span>{role.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}