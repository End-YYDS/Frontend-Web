import { Link, useLocation } from 'react-router-dom';
import * as React from 'react';
import {
  Home,
  Users,
  Shield,
  Settings,
  Archive,
  FileText,
  Monitor,
  Power,
  Clock,
  Server,
  Package,
  Download,
  BrickWallFire,
  Globe,
  type LucideIcon,
} from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';

import Logo from '@/assets/CHM.png';

// Menu items（保持扁平結構）
type Item = { title: string; url: string; icon: LucideIcon };
const items: Item[] = [
  { title: 'Dashboard', url: '/', icon: Home },

  { title: 'CHM - User & Group', url: '/user_group', icon: Users },
  { title: 'CHM - Roles', url: '/roles', icon: Shield },

  { title: 'CHM - Backup', url: '/backup', icon: Archive },
  { title: 'CHM - Settings', url: '/settings', icon: Settings },
  { title: 'System & Host Logs', url: '/s&h-logs', icon: FileText },

  { title: 'CHM - PC Manager', url: '/pc-manager', icon: Monitor },
  { title: 'Process Manager', url: '/process-manager', icon: Power },
  { title: 'Cron Management', url: '/cron_management', icon: Clock },

  { title: 'Servers', url: '/servers', icon: Server },
  { title: 'Software Package', url: '/software_packages', icon: Package },
  { title: 'File Manager', url: '/file-manager', icon: Download },

  { title: 'Firewall', url: '/firewall', icon: BrickWallFire },
  { title: 'Network Configuration', url: '/network_configuration', icon: Globe },
];

// 分類配置：父層是分類名稱，子層是要顯示的 item 標題
const categories: Record<string, string[]> = {
  User: ['CHM - User & Group', 'CHM - Roles'],
  System: ['CHM - Backup', 'CHM - Settings', 'System & Host Logs'],
  'Host Management': ['CHM - PC Manager', 'Process Manager', 'Cron Management'],
  'Resources & Services': ['Servers', 'Software Package', 'File Manager'],
  Network: ['Firewall', 'Network Configuration'],
};

export function AppSidebar() {
  const location = useLocation();
  const dashboard = items[0];
  const DashboardIcon = dashboard.icon;
  const byTitle = React.useMemo(() => {
    const m = new Map<string, Item>();
    for (const it of items) m.set(it.title, it);
    return m;
  }, []);

  const isActive = (url: string) =>
    url === '/'
      ? location.pathname === '/'
      : location.pathname === url || location.pathname.startsWith(url + '/');

  return (
    <Sidebar>
      {/* Header */}
      <SidebarHeader className='flex items-center p-3 bg-[#1E232E]/75 w-full whitespace-nowrap'>
        <div className='flex items-center gap-3 flex-shrink-0 scale-90 sm:scale-100'>
          <img src={Logo} alt='CHM Logo' className='w-12 h-12 object-contain' />
          <span className='text-3xl font-bold leading-none relative top-[2px]'>CHM</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard：獨立顯示 */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive(dashboard.url)} /* ⭐ NEW */>
                  <Link to={dashboard.url}>
                    <DashboardIcon />
                    <span>{dashboard.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {Object.entries(categories).map(([category, titles]) => {
          return (
            <SidebarGroup key={category}>
              <SidebarGroupLabel>{category}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuSub>
                      {titles
                        .map((t) => byTitle.get(t))
                        .filter(Boolean)
                        .map((subItem) => {
                          const Icon = subItem!.icon;
                          return (
                            <SidebarMenuSubItem key={subItem!.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive(subItem!.url)} // ⭐ NEW
                              >
                                <Link to={subItem!.url}>
                                  <Icon className='size-4' />
                                  <span>{subItem!.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
