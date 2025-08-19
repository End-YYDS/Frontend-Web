import { type FC, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar"; // 你上面那個 Sidebar

interface SidebarLayoutProps {
  children?: ReactNode;
}

export const SidebarLayout: FC<SidebarLayoutProps> = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <AppSidebar />

        {/* 主內容區 */}
        <SidebarInset className="flex flex-col flex-1">
          <main className="flex-1 overflow-auto p-4">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
