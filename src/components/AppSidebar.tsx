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
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';

import Logo from '@/assets/CHM.png';

// Menu items (保持扁平結構)
const items = [
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

// 分類配置
const categories = {
  User: ['CHM - User & Group', 'CHM - Roles'],
  System: ['CHM - Backup', 'CHM - Settings', 'System & Host Logs'],
  'Host Management': ['CHM - PC Manager', 'Process Manager', 'Cron Management'],
  'Resources & Services': ['Servers', 'Software Package', 'File Manager'],
  Network: ['Firewall', 'Network Configuration'],
};

export function AppSidebar() {
  const dashboard = items[0]; // 取 Dashboard
  const DashboardIcon = dashboard.icon; // 先存成變數

  return (
    <Sidebar>
      {/* Header */}
      <SidebarHeader className='flex space-x-4 p-3 bg-[#1E232E]/75 w-full'>
        <div className='flex items-center space-x-4 p-2'>
          <img src={Logo} alt='CHM Logo' className='w-10 h-10 object-contain' />
          <span className='text-3xl font-bold'>CHM</span>
        </div>
      </SidebarHeader>

      {/* 分組內容 */}
      <SidebarContent>
        {/* Dashboard 獨立顯示，不要 category */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to={dashboard.url}>
                    <DashboardIcon />
                    <span>{dashboard.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 其他分類 */}
        {Object.entries(categories).map(([category, titles]) => (
          <SidebarGroup key={category}>
            <SidebarGroupLabel>{category}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items
                  .filter((item) => titles.includes(item.title))
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link to={item.url}>
                            <Icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
