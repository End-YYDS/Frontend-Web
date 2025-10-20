import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Wifi,
  Globe,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServerSidebarProps {
  selectedServer: string | null;
  onServerSelect: (server: string) => void;
}

// 伺服器清單
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

// Sidebar item 型別
type SidebarItem = {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  path: string;
};

type SidebarCategory = {
  category: string;
  items: SidebarItem[];
};

type SidebarEntry = SidebarItem | SidebarCategory;

// Sidebar 導航資料
const sidebarItems: SidebarEntry[] = [
  { name: 'Dashboard', icon: Home, path: '/' },
  {
    category: 'User',
    items: [
      { name: 'CHM - User & Group', icon: Users, path: '/user-group' },
      { name: 'CHM - Roles', icon: Shield, path: '/roles' },
    ],
  },
  {
    category: 'System',
    items: [
      { name: 'CHM - Backup', icon: Archive, path: '/backup' },
      { name: 'CHM - Settings', icon: Settings, path: '/system-settings' },
      { name: 'System & Host Logs', icon: FileText, path: '/system-logs' },
    ],
  },
  {
    category: 'Host Management',
    items: [
      { name: 'CHM - PC Manager', icon: Monitor, path: '/pc-manager' },
      { name: 'Process Manager & System Shutdown', icon: Power, path: '/process-manager' },
      { name: 'Cron Management', icon: Clock, path: '/cron-management' },
    ],
  },
  {
    category: 'Resources & Services',
    items: [
      { name: 'Servers', icon: Server, path: '/servers' },
      { name: 'Software Package', icon: Package, path: '/software-package' },
      { name: 'File Upload & Download', icon: Download, path: '/file-management' },
    ],
  },
  {
    category: 'Network',
    items: [
      { name: 'Firewall', icon: Wifi, path: '/firewall' },
      { name: 'Network Configuration', icon: Globe, path: '/network-config' },
    ],
  },
];

export function ServerSidebar({ selectedServer, onServerSelect }: ServerSidebarProps) {
  const location = useLocation();
  const [showServers, setShowServers] = useState(location.pathname === '/servers');

  const handleServersClick = (event: React.MouseEvent) => {
    if (location.pathname === '/servers') {
      event.preventDefault();
      setShowServers(!showServers);
    }
  };

  return (
    <div className="fixed left-0 top-0 w-64 bg-slate-800 text-white h-screen flex flex-col overflow-hidden z-40">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white transform rotate-45"></div>
          </div>
          <span className="text-xl font-bold">CHM</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {sidebarItems.map((section, index) => (
          <div key={index} className="mb-6">
            {'category' in section ? (
              <>
                {/* 類別標題 */}
                <div className="px-6 mb-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {section.category}
                  </h3>
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <div key={item.name}>
                      <Link
                        to={item.path}
                        onClick={item.path === '/servers' ? handleServersClick : undefined}
                        className={cn(
                          'flex items-center justify-between px-6 py-2 text-sm hover:bg-slate-700 transition-colors',
                          location.pathname === item.path &&
                            'bg-slate-700 border-r-2 border-purple-500'
                        )}
                      >
                        <div className="flex items-center">
                          {item.icon && <item.icon className="w-4 h-4 mr-3 text-slate-400" />}
                          <span>{item.name}</span>
                        </div>
                        {item.path === '/servers' && location.pathname === '/servers' && (
                          <div className="ml-2">
                            {showServers ? (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        )}
                      </Link>

                      {/* Server 子清單 */}
                      {item.path === '/servers' && location.pathname === '/servers' && showServers && (
                        <div className="ml-6 mt-1 space-y-1">
                          {servers.map((server) => (
                            <div
                              key={server.id}
                              className={cn(
                                'flex items-center px-4 py-2 text-sm rounded cursor-pointer transition-colors',
                                selectedServer === server.id
                                  ? 'bg-purple-600 text-white'
                                  : 'hover:bg-slate-600 text-slate-300'
                              )}
                              onClick={() => onServerSelect(server.id)}
                            >
                              <span>{server.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Link
                to={section.path}
                className={cn(
                  'flex items-center px-6 py-3 text-sm hover:bg-slate-700 transition-colors',
                  location.pathname === section.path &&
                    'bg-slate-700 border-r-2 border-purple-500'
                )}
              >
                {section.icon && <section.icon className="w-4 h-4 mr-3 text-slate-400" />}
                <span>{section.name}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
