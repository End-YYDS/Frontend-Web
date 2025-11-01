import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import Topbar from './Topbar';
import { SidebarProvider } from './ui/sidebar';
import { useAuth } from '@/auth';
import { useEffect } from 'react';
import { toast } from 'sonner';
export default function Layout() {
  const { signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    toast.dismiss();
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <AppSidebar />
      {/* Main Content */}
      <div className='flex flex-col flex-1 bg-gray-50 min-w-0'>
        {/* Header */}
        <header className='h-14 border-b border-gray-200'>
          <Topbar onLogout={signOut} />
        </header>
        {/* Content */}
        <main className='flex-1 min-w-0 overflow-y-auto p-6'>
          <div
            className='mx-auto w-full px-6
                          max-w-[min(calc(100vh*1.7778),1600px)]'
          >
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
