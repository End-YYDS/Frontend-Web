import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import Topbar from "./Topbar";
import { SidebarProvider } from "./ui/sidebar";

interface LayoutProps {
  onLogout: () => void;
}

export default function Layout({ onLogout }: LayoutProps) {
  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  return (
    <SidebarProvider>
      {/* Sidebar */}
      <AppSidebar
        selectedServer={selectedServer}
        onServerSelect={(serverId) => setSelectedServer(serverId)}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 bg-gray-50">
        {/* Header */}
        <header className="h-14 border-b border-gray-200">
          <Topbar onLogout={onLogout} />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
