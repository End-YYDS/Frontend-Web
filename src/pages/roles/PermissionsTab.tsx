
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Permission {
  id: string;
  name: string;
  enabled: boolean;
}

interface PermissionsTabProps {
  permissions: Permission[];
  onPermissionToggle: (permissionId: string) => void;
}

export function PermissionsTab({ permissions, onPermissionToggle }: PermissionsTabProps) {
  return (
    <div className="space-y-6 mt-6">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search..."
          className="pl-10 w-full"
        />
      </div>
      
      <div>
        <h3 className="font-medium text-gray-700 mb-4">一般權限</h3>
        <div className="space-y-4">
          {permissions.map((permission) => (
            <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">{permission.name}</span>
              <Switch
                checked={permission.enabled}
                onCheckedChange={() => onPermissionToggle(permission.id)}
              />
            </div>
          ))}
          <div className="p-3 text-gray-500">...</div>
        </div>
      </div>
    </div>
  );
}