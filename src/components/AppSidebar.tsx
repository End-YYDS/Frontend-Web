// import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  Settings, 
  Package, 
  Network, 
  Shield, 
  Users,
  Clock,
  Home,
  UserCheck,
  Archive,
  FileText,
  Server,
  UploadCloud,
  Power,
} from 'lucide-react';

const userItems = [
  { title: "CHM - User & Group", url: "/user-group", icon: Users },
  { title: "CHM - Roles", url: "/roles", icon: UserCheck },
];

const systemItems = [
  { title: "CHM - Backup", url: "/backup", icon: Archive },
  { title: "CHM - Settings", url: "/settings", icon: Settings },
  { title: "CHM - mCA", url: "/certificate-management", icon: Shield },
  { title: "System & Host Logs", url: "/system-logs", icon: FileText },
];

const hostManagementItems = [
  { title: "CHM - PC Manager", url: "/network-configuration", icon: Network },
  { title: "Process Manager & System Shutdown", url: "/process-manager", icon: Power },
  { title: "Cron Management", url: "/cron-management", icon: Clock },
];

const resourcesItems = [
  { title: "Servers", url: "/servers", icon: Server },
  { title: "Software Package", url: "/software-packages", icon: Package },
  { title: "File Upload & Download", url: "/file-manager", icon: UploadCloud },
];

const networkItems = [
  { title: "Firewall", url: "/firewall", icon: Shield },
  { title: "Network Configuration", url: "/network-configuration", icon: Network },
];

interface AppSidebarProps {
  selectedServer: string | null;
  onServerSelect: (serverId: string) => void;
}

export function AppSidebar({ selectedServer, onServerSelect }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === "collapsed";

  const getNavClass = (path: string) => 
    isActive(path) 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50";

  const MenuItem = ({ item }: { item: typeof userItems[0] }) => (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink to={item.url} className={getNavClass(item.url)}>
          <item.icon className="h-4 w-4" />
          {!isCollapsed && <span className="text-sm">{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent className="px-2">
        {/* Dashboard */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" className={getNavClass("/")}>
                    <Home className="h-4 w-4" />
                    {!isCollapsed && <span className="text-sm">Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-sidebar-foreground/70">
            User
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => (
                <MenuItem key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-sidebar-foreground/70">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <MenuItem key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Host Management */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-sidebar-foreground/70">
            Host Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {hostManagementItems.map((item) => (
                <MenuItem key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Resources & Services */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-sidebar-foreground/70">
            Resources & Services
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourcesItems.map((item) => {
                if (item.title === "Servers") {
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={getNavClass(item.url)}
                          onClick={() => onServerSelect("server-1")}
                        >
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && (
                            <span className="text-sm">
                              {item.title}
                              {selectedServer && ` (${selectedServer})`}
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
                return <MenuItem key={item.url} item={item} />;
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Network */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-sidebar-foreground/70">
            Network
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {networkItems.map((item) => (
                <MenuItem key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
