import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Search } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  enabled: boolean;
  bit: number;
}

interface PermissionsTabProps {
  permissions: Permission[];
  isEveryoneRole?: boolean;
  onPermissionToggle: (bit: number) => void;
}

export function PermissionsTab({ permissions, isEveryoneRole, onPermissionToggle }: PermissionsTabProps) {
  return (
    <div className="space-y-6 mt-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search..."
          className="pl-10 w-full"
          disabled={isEveryoneRole}
        />
      </div>
      
      <div>
        <h3 className="font-medium text-gray-700 mb-4">General Permissions</h3>
        <div className="space-y-4">
          {permissions.map((permission) => (
            <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">{permission.name}</span>
              <Switch
                checked={permission.enabled}
                disabled={isEveryoneRole}
                onCheckedChange={() => onPermissionToggle(permission.bit)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}