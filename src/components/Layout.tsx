// components/Layout.tsx
import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // 狀態放在 Layout，讓 Sidebar & Main 共用
  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AppSidebar 
        selectedServer={selectedServer} 
        onServerSelect={(serverId) => setSelectedServer(serverId)} 
      />

      {/* Main Content */}
      <div className="flex-1 ml-64 bg-gray-50">
        {/* 頂部 Header */}
        <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white shadow-sm">
          <h1 className="text-lg font-semibold">CHM System</h1>

          {/* 如果有選 server，在 header 顯示 */}
          {selectedServer && (
            <div className="text-sm text-gray-600">
              Active Server: <span className="font-medium text-purple-600">{selectedServer}</span>
            </div>
          )}
        </header>

        {/* 主要內容區塊 */}
        <main className="p-6 overflow-y-auto h-[calc(100%-3.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
