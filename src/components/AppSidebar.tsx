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
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { SiApache, SiNginx, SiFilezilla } from "react-icons/si";
import { FaGlobe } from "react-icons/fa";
import { LuIdCard } from "react-icons/lu";
import { TbNetwork, TbBrandMysql, TbFolders } from "react-icons/tb";
import { GiSquid } from "react-icons/gi";
import { IoTerminal } from "react-icons/io5";

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
import { useEffect, useState } from 'react';
import { isPathDisabled } from '@/routeRegistry';

const servers = [
  { id: 'apache', name: 'Apache', installed: true },
  { id: 'nginx', name: 'Nginx', installed: false },
  { id: 'bind', name: 'BIND DNS', installed: true },
  { id: 'dhcp', name: 'DHCP', installed: false },
  { id: 'ldap', name: 'LDAP', installed: true },
  { id: 'mysql', name: 'MySQL Database', installed: true },
  { id: 'proftpd', name: 'ProFTPD', installed: true },
  { id: 'samba', name: 'Samba', installed: false },
  { id: 'squid', name: 'Squid Proxy', installed: true },
  { id: 'ssh', name: 'SSH', installed: true },
];

interface SidebarLeaf {
  name: string;
  icon: LucideIcon;
  path: string;
}

interface SidebarCategory {
  category: string;
  items: SidebarLeaf[];
}

type SidebarItem = SidebarLeaf | SidebarCategory;

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', icon: Home, path: '/dashboard' },
  {
    category: 'User',
    items: [
      { name: 'CHM - User & Group', icon: Users, path: '/user_group' },
      { name: 'CHM - Roles', icon: Shield, path: '/roles' },
    ],
  },
  {
    category: 'System',
    items: [
      { name: 'CHM - Backup', icon: Archive, path: '/backup' },
      { name: 'CHM - Settings', icon: Settings, path: '/settings' },
      { name: 'CHM - mCA', icon: ShieldCheck, path: '/certificate_management' },
      { name: 'System & Host Logs', icon: FileText, path: '/syslogs' },
    ],
  },
  {
    category: 'Host Management',
    items: [
      { name: 'CHM - PC Manager', icon: Monitor, path: '/pc-manager' },
      { name: 'Process Manager', icon: Power, path: '/process-manager' },
      { name: 'Cron Management', icon: Clock, path: '/cron_management' },
    ],
  },
  {
    category: 'Resources & Services',
    items: [
      { name: 'Servers', icon: Server, path: '/servers' },
      { name: 'Software Package', icon: Package, path: '/software_packages' },
      { name: 'File Manager', icon: Download, path: '/file-manager' },
    ],
  },
  {
    category: 'Network',
    items: [
      { name: 'Firewall', icon: BrickWallFire, path: '/firewall' },
      { name: 'Network Configuration', icon: Globe, path: '/network_configuration' },
    ],
  },
];

const serverIcons: Record<string, React.ReactNode> = {
  apache: <SiApache className="size-4" />,
  nginx: <SiNginx className="size-4" />,
  bind: <FaGlobe className="size-4" />,
  dhcp: <TbNetwork className="size-4" />,
  ldap: <LuIdCard className="size-4" />,
  mysql: <TbBrandMysql className="size-4" />,
  proftpd: <SiFilezilla className="size-4" />,
  samba: <TbFolders className="size-4" />,
  squid: <GiSquid className="size-4" />,
  ssh: <IoTerminal className="size-4" />,
};


export function AppSidebar() {
  const location = useLocation();
  const [showServers, setShowServers] = useState(false);
  const dashboard = sidebarItems[0] as SidebarLeaf;
  const DashboardIcon = dashboard.icon;
  const dashboardDisabled = isPathDisabled(dashboard.path);
  const isActive = (url: string) =>
    url === '/'
      ? location.pathname === '/'
      : location.pathname === url || location.pathname.startsWith(url + '/');
  useEffect(() => {
    if (location.pathname.startsWith('/servers')) {
      setShowServers(true);
    }
  }, [location.pathname]);
  const preventNavigationIfDisabled =
    (disabled: boolean): React.MouseEventHandler<HTMLAnchorElement> =>
    (e) => {
      if (!disabled) return;
      e.preventDefault();
      e.stopPropagation();
    };

  const renderLeaf = (leaf: SidebarLeaf) => {
    const Icon = leaf.icon;
    const disabled = isPathDisabled(leaf.path);
    return (
      <SidebarMenuItem key={leaf.path}>
        <SidebarMenuButton asChild isActive={isActive(leaf.path)}>
          <Link
            to={leaf.path}
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : undefined}
            onClick={preventNavigationIfDisabled(disabled)}
            className={disabled ? 'cursor-not-allowed' : undefined}
          >
            <Icon className='size-4' />
            <span>{leaf.name}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderServers = (leaf: SidebarLeaf) => {
    const Icon = leaf.icon;
    const isServersActive = isActive('/servers');
    const disabled = isPathDisabled('/servers');
    const handleServersClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
      if (disabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      e.preventDefault();
      setShowServers((prev) => !prev);
    };

    return (
      <SidebarMenuItem key='__servers__'>
        <SidebarMenuButton asChild isActive={isServersActive}>
          <Link
            to='/servers'
            onClick={handleServersClick}
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : undefined}
            className={disabled ? 'cursor-not-allowed' : undefined}
          >
            <Icon className='size-4' />
            <span>{leaf.name}</span>
            <div className='ml-auto flex items-center'>
              {showServers ? (
                <ChevronDown className='size-4 opacity-70' />
              ) : (
                <ChevronRight className='size-4 opacity-70' />
              )}
            </div>
          </Link>
        </SidebarMenuButton>

        {showServers && (
          <SidebarMenuSub>
            {servers.map((s) => {
              const to = `/servers/${s.id}`;
              const subDisabled = isPathDisabled(to);
              return (
                <SidebarMenuSubItem key={s.id}>
                  <SidebarMenuSubButton asChild isActive={isActive(to)}>
                    <Link
                      to={to}
                      aria-disabled={subDisabled || undefined}
                      tabIndex={subDisabled ? -1 : undefined}
                      onClick={preventNavigationIfDisabled(subDisabled)}
                      className={subDisabled ? 'cursor-not-allowed' : undefined}
                    >
                      <span className='truncate'>{serverIcons[s.id]}</span>
                      <span className='truncate'>{s.name}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar>
      {/* Header */}
      <SidebarHeader className='flex items-center p-3 bg-[#1E232E]/75 w-full whitespace-nowrap'>
        <div className='flex items-center gap-3 shrink-0 scale-90 sm:scale-100'>
          <img src={Logo} alt='CHM Logo' className='w-12 h-12 object-contain' />
          <span className='text-3xl font-bold leading-none relative top-0.5'>CHM</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard：獨立顯示 */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive(dashboard.path)}>
                  <Link
                    to={dashboard.path}
                    aria-disabled={dashboardDisabled || undefined}
                    tabIndex={dashboardDisabled ? -1 : undefined}
                    onClick={preventNavigationIfDisabled(dashboardDisabled)}
                    className={dashboardDisabled ? 'cursor-not-allowed' : undefined}
                  >
                    <DashboardIcon className='size-4' />
                    <span>{dashboard.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 其他分類 */}
        {sidebarItems
          .filter((it): it is SidebarCategory => 'category' in it)
          .map((section) => (
            <SidebarGroup key={section.category}>
              <SidebarGroupLabel>{section.category}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((leaf) => {
                    if (leaf.path === '/servers') return renderServers(leaf);
                    return renderLeaf(leaf);
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
      </SidebarContent>
    </Sidebar>
  );
}
