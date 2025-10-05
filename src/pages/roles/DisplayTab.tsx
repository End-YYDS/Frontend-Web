import { Input } from '@/components/ui/input';
import { CheckIcon } from '@heroicons/react/24/outline';

export interface DisplayTabProps {
  roleName: string;
  selectedColor: string;
  isEveryoneRole?: boolean;
  onRoleNameChange: (name: string) => void;
  onColorChange: (color: string) => void;
}

const colorOptions = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899',
  '#F87171', '#FBBF24', '#6EE7B7', '#60A5FA', '#A78BFA', '#F472B6'
];

export function DisplayTab({ roleName, selectedColor, isEveryoneRole, onRoleNameChange, onColorChange }: DisplayTabProps) {
  return (
    <div className="space-y-6 mt-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          role name
        </label>
        <Input
          value={roleName}
          onChange={(e) => onRoleNameChange(e.target.value)}
          disabled={isEveryoneRole}
          className="w-full"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          role color
        </label>
        <div className="flex items-center mb-4">
          <div 
            className="w-12 h-12 rounded border-2 border-gray-300 mr-4 flex items-center justify-center"
            style={{ backgroundColor: selectedColor }}
          >
            <CheckIcon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              className="w-8 h-8 rounded cursor-pointer border-2 border-transparent hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
              disabled={isEveryoneRole}
            />
          ))}
        </div>
      </div>
    </div>
  );
}