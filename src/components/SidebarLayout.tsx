import { type FC } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface SidebarLayoutProps {
  onLogout?: () => void;
}

export const SidebarLayout: FC<SidebarLayoutProps> = ({ onLogout }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* 左側 Sidebar */}
        <AppSidebar />

        {/* 右側主畫面 */}
        <SidebarInset className="flex flex-col flex-1">
          <AppHeader onLogout={onLogout} />
          <main className="flex-1 overflow-auto p-4">
            <Outlet /> {/* 子頁面會渲染在這 */}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
