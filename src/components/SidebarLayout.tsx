import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface SidebarLayoutProps {
  onLogout?: () => void;
}

export default function SidebarLayout({ onLogout }: SidebarLayoutProps) {
  // 狀態放在 Layout，讓 Sidebar & Main 共用
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const location = useLocation();

  // 只有 /servers 或 /servers/:id 顯示 selectedServer
  const showSelectedServer = location.pathname.startsWith("/servers");

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AppSidebar
        selectedServer={selectedServer}
        onServerSelect={(serverId) => setSelectedServer(serverId)}
      />

      {/* Main Content */}
      <div className="flex-1 ml-64 bg-gray-50">
        {/* Header */}
        <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white shadow-sm">
          {/* 左邊 Title */}
          <h1 className="text-lg font-semibold">CHM System</h1>

          {/* 右邊區塊：登入/登出 & Active Server */}
          <div className="flex items-center gap-4">
            {showSelectedServer && selectedServer && (
              <div className="text-sm text-gray-600">
                Active Server:{" "}
                <span className="font-medium text-purple-600">
                  {selectedServer}
                </span>
              </div>
            )}

            {/* AppHeader：放右上角登出按鈕 */}
            <AppHeader onLogout={onLogout} />
          </div>
        </header>

        {/* 主內容區塊 */}
        <main className="p-6 overflow-y-auto h-[calc(100%-3.5rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
