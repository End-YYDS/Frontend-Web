import { useState, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/toaster";
import Login from "./pages/login";
import Index from "./pages/index";
import SettingsPage from "./pages/settings";
import SoftwarePackagesPage from "./pages/software_packages";
import NetworkConfigurationPage from "./pages/network_configuration";
import CertificateManagementPage from "./pages/certificate_management";
import UserGroupPage from "./pages/user_group";
import CronManagementPage from "./pages/cron_management";
import NotFound from "./pages/not_found";
import { SidebarLayout } from "./components/SidebarLayout";

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const localStatus = localStorage.getItem("isLoggedIn");
        if (localStatus === "true") {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        正在檢查登入狀態...
      </div>
    );
  }

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

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Routes>
            <Route element={<SidebarLayout onLogout={handleLogout} />}>
              <Route path="/" element={<Index />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/software-packages" element={<SoftwarePackagesPage />} />
              <Route path="/network-configuration" element={<NetworkConfigurationPage />} />
              <Route path="/certificate-management" element={<CertificateManagementPage />} />
              <Route path="/user-group" element={<UserGroupPage />} />
              <Route path="/cron-management" element={<CronManagementPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <Toaster />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
