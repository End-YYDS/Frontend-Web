import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import Topbar from './Topbar';
import { SidebarProvider } from './ui/sidebar';
import { useAuth } from '@/auth';
export default function Layout() {
  const { signOut } = useAuth();
  return (
    <SidebarProvider>
      <AppSidebar />
      {/* Main Content */}
      <div className='flex flex-col flex-1 bg-gray-50'>
        {/* Header */}
        <header className='h-14 border-b border-gray-200'>
          <Topbar onLogout={signOut} />
        </header>
        {/* Content */}
        <main className='flex-1 overflow-y-auto p-6'>
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}