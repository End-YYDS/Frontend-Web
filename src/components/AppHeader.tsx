import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Bell, LogOut } from 'lucide-react';

interface AppHeaderProps {
  onLogout?: () => void;
}

export function AppHeader({ onLogout }: AppHeaderProps) {
  return (
    <header className='flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6'>
      <SidebarTrigger className='-ml-1' />

      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 bg-blue-600 rounded flex items-center justify-center'>
            <span className='text-white text-sm font-bold'>CHM</span>
          </div>
          <span className='font-semibold text-lg'>CHM</span>
        </div>
      </div>

      <div className='flex-1 flex justify-center'>
        <div className='relative w-full max-w-md'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input type='search' placeholder='Search...' className='pl-8 w-full' />
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <Button variant='ghost' size='icon'>
          <Bell className='h-4 w-4' />
        </Button>

        <div className='text-sm text-muted-foreground'>Derrick Lin</div>

        {onLogout && (
          <Button variant='ghost' size='icon' onClick={onLogout} className='ml-2'>
            <LogOut className='h-4 w-4' />
          </Button>
        )}
      </div>
    </header>
  );
}
