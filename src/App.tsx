import { useState, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/toaster";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import Login from "./pages/login";
import Index from "./pages/index";
import SettingsPage from "./pages/settings";
import SoftwarePackagesPage from "./pages/software_packages";
import NetworkConfigurationPage from "./pages/network_configuration";
import CertificateManagementPage from "./pages/certificate_management";
import UserGroupPage from "./pages/user_group";
import CronManagementPage from "./pages/cron_management";
import NotFound from "./pages/not_found";

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ 用來顯示正在檢查登入狀態

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  // ✅ 初始化時檢查登入狀態（localStorage + /api/me）
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const localStatus = localStorage.getItem("isLoggedIn");
        if (localStatus === "true") {
          // 嘗試打 API 確認 session 還有效
          const res = await fetch("/api/me", { credentials: "include" });
          if (res.ok) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            localStorage.removeItem("isLoggedIn");
          }
        }
      } catch (err) {
        console.error("檢查登入狀態失敗:", err);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ✅ 檢查中時顯示 Loading 畫面
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        正在檢查登入狀態...
      </div>
    );
  }

  // ✅ 未登入顯示登入頁
  if (!isLoggedIn) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Login
            onSuccess={() => {
              setIsLoggedIn(true);
              localStorage.setItem("isLoggedIn", "true");
            }}
          />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // ✅ 已登入顯示主畫面
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <SidebarInset className="flex flex-col flex-1">
                <AppHeader onLogout={handleLogout} />
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route
                      path="/software-packages"
                      element={<SoftwarePackagesPage />}
                    />
                    <Route
                      path="/network-configuration"
                      element={<NetworkConfigurationPage />}
                    />
                    <Route
                      path="/certificate-management"
                      element={<CertificateManagementPage />}
                    />
                    <Route path="/user-group" element={<UserGroupPage />} />
                    <Route
                      path="/cron-management"
                      element={<CronManagementPage />}
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </SidebarInset>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
