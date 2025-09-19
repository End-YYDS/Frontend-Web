// // components/AppSidebar.tsx
// import { useState, useEffect } from "react";
// import { Link, useLocation } from "react-router-dom";
// import {
//   Home,
//   Users,
//   Shield,
//   Settings,
//   Archive,
//   FileText,
//   Monitor,
//   Power,
//   Clock,
//   Server,
//   Package,
//   Download,
//   BrickWallFire,
//   Globe,
//   ChevronDown,
//   ChevronRight,
// } from "lucide-react";

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar";

// import { cn } from "@/lib/utils";
// import Logo from "@/assets/CHM.png";

// interface AppSidebarProps {
//   selectedServer: string | null;
//   onServerSelect: (server: string) => void;
// }

// const servers = [
//   { id: "apache", name: "Apache", installed: true },
//   { id: "nginx", name: "Nginx", installed: false },
//   { id: "bind", name: "BIND DNS", installed: true },
//   { id: "dhcp", name: "DHCP", installed: false },
//   { id: "ldap", name: "LDAP", installed: true },
//   { id: "mysql", name: "MySQL Database", installed: true },
//   { id: "postgresql", name: "PostgreSQL Database", installed: false },
//   { id: "proftpd", name: "ProFTPD", installed: true },
//   { id: "samba", name: "Samba", installed: false },
//   { id: "squid", name: "Squid Proxy", installed: true },
//   { id: "ssh", name: "SSH", installed: true },
// ];

// const sidebarItems = [
//   { name: "Dashboard", icon: Home, path: "/dashboard" },
//   {
//     category: "User",
//     items: [
//       { name: "CHM - User & Group", icon: Users, path: "/user_group" },
//       { name: "CHM - Roles", icon: Shield, path: "/roles" },
//     ],
//   },
//   {
//     category: "System",
//     items: [
//       { name: "CHM - Backup", icon: Archive, path: "/backup" },
//       { name: "CHM - Settings", icon: Settings, path: "/settings" },
//       { name: "System & Host Logs", icon: FileText, path: "/s&h-logs" },
//     ],
//   },
//   {
//     category: "Host Management",
//     items: [
//       { name: "CHM - PC Manager", icon: Monitor, path: "/pc-manager" },
//       { name: "Process Manager", icon: Power, path: "/process-manager" },
//       { name: "Cron Management", icon: Clock, path: "/cron_management" },
//     ],
//   },
//   {
//     category: "Resources & Services",
//     items: [
//       { name: "Servers", icon: Server, path: "/servers" },
//       { name: "Software Package", icon: Package, path: "/software_packages" },
//       { name: "File Manager", icon: Download, path: "/file-manager" },
//     ],
//   },
//   {
//     category: "Network",
//     items: [
//       { name: "Firewall", icon: BrickWallFire, path: "/firewall" },
//       { name: "Network Configuration", icon: Globe, path: "/network_configuration" },
//     ],
//   },
// ];

// export function AppSidebar({ onServerSelect }: AppSidebarProps) {
//   const location = useLocation();
//   const [showServers, setShowServers] = useState(false);

  // 自動展開當前是 /servers 頁面
  // useEffect(() => {
  //   if (location.pathname.startsWith("/servers")) {
  //     setShowServers(true);
  //   }
  // }, [location.pathname]);

  // return (
  //   <Sidebar>
  //     {/* Logo 區塊 */}
  //     <SidebarHeader>
  //         <img src={Logo} alt="CHM Logo" className="w-15 h-15 object-contain" />
  //         <span className="text-4xl font-bold">CHM</span>
  //     </SidebarHeader>

  //     <SidebarContent>
  //       {sidebarItems.map((section, index) => (
  //         <SidebarGroup key={index}>
  //           {section.category ? (
  //             <>
  //               <SidebarGroupLabel>{section.category}</SidebarGroupLabel>
  //               <SidebarGroupContent>
  //                 <SidebarMenu>
  //                   {section.items.map((item) => {
  //                     const Icon = item.icon;
  //                     const isServers = item.path === "/servers";

  //                     return (
  //                       <SidebarMenuItem key={item.name}>
  //                         <SidebarMenuButton asChild>
  //                           <Link
  //                             to={item.path}
  //                             onClick={(e) => {
  //                               if (isServers) {
  //                                 e.preventDefault();
  //                                 setShowServers((prev) => !prev);
  //                               }
  //                             }}
  //                             className={cn(
  //                               "flex w-full items-center justify-between px-2 py-2 rounded-md transition-colors",
  //                               location.pathname === item.path
  //                             )}
  //                           >
                              
  //                               <Icon className="w-4 h-4 mr-3" />
  //                               <span>{item.name}</span>
                              
  //                             {isServers &&
  //                               (showServers ? (
  //                                 <ChevronDown className="w-4 h-4" />
  //                               ) : (
  //                                 <ChevronRight className="w-4 h-4" />
  //                               ))}
  //                           </Link>
  //                         </SidebarMenuButton>

  //                         {/* Servers 展開清單 */}
  //                         {isServers && showServers && (
  //                           <div className="ml-6 mt-1 space-y-1">
  //                             {servers.map((server) => (
  //                               <Link
  //                                 key={server.id}
  //                                 to={`/servers/${server.id}`}
  //                                 onClick={() => onServerSelect(server.id)}
  //                                 className={cn(
  //                                   "block px-4 py-2 text-sm rounded transition-colors",
  //                                   location.pathname === `/servers/${server.id}`
  //                                 )}
  //                               >
  //                                 {server.name}
  //                               </Link>
  //                             ))}
  //                           </div>
  //                         )}
  //                       </SidebarMenuItem>
  //                     );
  //                   })}
  //                 </SidebarMenu>
  //               </SidebarGroupContent>
  //             </>
  //           ) : (
  //             <SidebarGroupContent>
  //               <SidebarMenu>
  //                 <SidebarMenuItem>
  //                   <SidebarMenuButton asChild>
  //                     <Link
  //                       to={section.path!}
  //                       className={cn(
  //                         "flex items-center px-2 py-2 rounded-md transition-colors",
  //                         location.pathname === section.path
  //                       )}
  //                     >
  //                       {section.icon && (
  //                         <section.icon className="w-4 h-4 mr-3" />
  //                       )}
  //                       <span>{section.name}</span>
  //                     </Link>
  //                   </SidebarMenuButton>
  //                 </SidebarMenuItem>
  //               </SidebarMenu>
  //             </SidebarGroupContent>
  //           )}
  //         </SidebarGroup>
  //       ))}
  //     </SidebarContent>
  //   </Sidebar>
  // );


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
} from "lucide-react";

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
} from "@/components/ui/sidebar";

import { ScrollArea } from "@/components/ui/scroll-area"
import Logo from "@/assets/CHM.png";

// Menu items (保持扁平結構)
const items = [
  { title: "Dashboard", url: "/", icon: Home },

  { title: "CHM - User & Group", url: "/user_group", icon: Users },
  { title: "CHM - Roles", url: "/roles", icon: Shield },

  { title: "CHM - Backup", url: "/backup", icon: Archive },
  { title: "CHM - Settings", url: "/settings", icon: Settings },
  { title: "System & Host Logs", url: "/s&h-logs", icon: FileText },

  { title: "CHM - PC Manager", url: "/pc-manager", icon: Monitor },
  { title: "Process Manager", url: "/process-manager", icon: Power },
  { title: "Cron Management", url: "/cron_management", icon: Clock },

  { title: "Servers", url: "/servers", icon: Server },
  { title: "Software Package", url: "/software_packages", icon: Package },
  { title: "File Manager", url: "/file-manager", icon: Download },

  { title: "Firewall", url: "/firewall", icon: BrickWallFire },
  { title: "Network Configuration", url: "/network_configuration", icon: Globe },
];

// 分類配置
const categories = {
  User: ["CHM - User & Group", "CHM - Roles"],
  System: ["CHM - Backup", "CHM - Settings", "System & Host Logs"],
  "Host Management": ["CHM - PC Manager", "Process Manager", "Cron Management"],
  "Resources & Services": ["Servers", "Software Package", "File Manager"],
  Network: ["Firewall", "Network Configuration"],
};

export function AppSidebar() {
  const dashboard = items[0]; // 取 Dashboard
  const DashboardIcon = dashboard.icon; // 先存成變數

  return (
    <Sidebar>
      {/* Header */}
      <SidebarHeader className="flex space-x-4 p-3 bg-[#1E232E]/75 w-full">
        <div className="flex items-center space-x-4 p-2">
          <img src={Logo} alt="CHM Logo" className="w-10 h-10 object-contain" />
          <span className="text-3xl font-bold">CHM</span>
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
                  <a href={dashboard.url}>
                    <DashboardIcon />
                    <span>{dashboard.title}</span>
                  </a>
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
                          <a href={item.url}>
                            <Icon />
                            <span>{item.title}</span>
                          </a>
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


// import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar"

// // Menu items.
// const items = [
//   {
//     title: "Home",
//     url: "#",
//     icon: Home,
//   },
//   {
//     title: "Inbox",
//     url: "#",
//     icon: Inbox,
//   },
//   {
//     title: "Calendar",
//     url: "#",
//     icon: Calendar,
//   },
//   {
//     title: "Search",
//     url: "#",
//     icon: Search,
//   },
//   {
//     title: "Settings",
//     url: "#",
//     icon: Settings,
//   },
// ]

// export function AppSidebar() {
//   return (
//     <Sidebar>
//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel>Application</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {items.map((item) => (
//                 <SidebarMenuItem key={item.title}>
//                   <SidebarMenuButton asChild>
//                     <a href={item.url}>
//                       <item.icon />
//                       <span>{item.title}</span>
//                     </a>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
//     </Sidebar>
//   )
// }