import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Download, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ComputerList } from "./ComputerList";
import { ComputerDetail } from "./ComputerDetail";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

// 型別定義（也可放到 types.ts）
interface Server {
  id: string;
  name: string;
  installed: boolean;
}

interface Computer {
  id: string;
  name: string;
  uuid: string;
  status: "online" | "offline";
}

interface ServerContentProps {
  selectedServer: string | null;
  selectedComputer: string | null;
  onComputerSelect: (computer: string | null) => void;
}

export function ServerContent({
  selectedServer,
  selectedComputer,
  onComputerSelect,
}: ServerContentProps) {
  const [servers, setServers] = useState<Server[]>([]);
  const [computers, setComputers] = useState<Computer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComputersForInstall, setSelectedComputersForInstall] =
    useState<string[]>([]);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [installedServers, setInstalledServers] = useState<string[]>([]);
  const { toast } = useToast();

  // 🚀 取得伺服器清單
  const fetchServers = async () => {
  try {
    const res = await axios.get("/api/servers");
    console.log("Fetched servers data:", res.data); // 🧩 觀察實際資料格式

    // 確保一定是陣列
    const data = Array.isArray(res.data)
      ? res.data
      : res.data.servers || [];

    setServers(data);
  } catch (error) {
    console.error("Failed to fetch servers:", error);
    toast({
      title: "Error",
      description: "Failed to load servers list.",
      variant: "destructive",
    });
  }
};


  // 🚀 取得電腦清單
  const fetchComputers = async () => {
    try {
      const res = await axios.get<Computer[]>("/api/computers");
      setComputers(res.data);
    } catch (error) {
      console.error("Failed to fetch computers:", error);
      toast({
        title: "Error",
        description: "Failed to load computers list.",
        variant: "destructive",
      });
    }
  };

  // 初始化載入資料
  useEffect(() => {
    fetchServers();
    fetchComputers();
  }, []);

  // 當切換伺服器時，重置選取狀態
  useEffect(() => {
    if (selectedServer && selectedComputer) {
      onComputerSelect(null);
    }
  }, [selectedServer]);

  const getServerDisplayName = (serverId: string) => {
    const server = servers.find((s) => s.id === serverId);
    return server?.name || serverId;
  };

  const selectedServerData = servers.find((s) => s.id === selectedServer);

  const handleComputerToggle = (computerId: string) => {
    setSelectedComputersForInstall((prev) =>
      prev.includes(computerId)
        ? prev.filter((id) => id !== computerId)
        : [...prev, computerId]
    );
  };

  // 🚀 安裝伺服器 API
  const handleInstallServer = async () => {
    if (selectedComputersForInstall.length === 0) {
      toast({
        title: "Select Computers",
        description: "Please select at least one computer to install.",
        variant: "destructive",
      });
      return;
    }

    setIsInstalling(true);
    try {
      const res = await axios.post("/api/server/install", {
        serverId: selectedServer,
        computers: selectedComputersForInstall,
      });

      // 根據回傳決定顯示
      if (res.status === 200) {
        toast({
          title: "Installation Successful",
          description: `${selectedServerData?.name} installed successfully.`,
        });

        // 標記已安裝
        if (selectedServer && !installedServers.includes(selectedServer)) {
          setInstalledServers((prev) => [...prev, selectedServer]);
        }
      }
    } catch (error) {
      console.error("Installation failed:", error);
      toast({
        title: "Installation Failed",
        description: "Unable to complete installation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInstalling(false);
      setInstallDialogOpen(false);
      setSelectedComputersForInstall([]);
    }
  };

  if (selectedComputer) {
    return (
      <ComputerDetail
        // serverId={selectedServer || ""}
        computerId={selectedComputer}
        onBack={() => onComputerSelect(null)}
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        {/* 標題 + 安裝按鈕 + 搜尋框 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {getServerDisplayName(selectedServer || "")}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* 安裝伺服器 Dialog */}
            <Dialog open={installDialogOpen} onOpenChange={setInstallDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  style={{ backgroundColor: "#7B86AA" }}
                  className="hover:opacity-80 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    Install {selectedServerData?.name || selectedServer}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Select computers to install {selectedServerData?.name} on:
                  </p>

                  {/* 電腦清單（僅顯示線上） */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {computers
                      .filter((computer) => computer.status === "online")
                      .map((computer) => (
                        <div
                          key={computer.id}
                          className="flex items-center space-x-2 p-2 border rounded"
                        >
                          <Checkbox
                            id={computer.id}
                            checked={selectedComputersForInstall.includes(
                              computer.id
                            )}
                            onCheckedChange={() =>
                              handleComputerToggle(computer.id)
                            }
                          />
                          <label
                            htmlFor={computer.id}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{computer.name}</span>
                            </div>
                            <p className="text-xs text-slate-500">
                              {computer.uuid}
                            </p>
                          </label>
                        </div>
                      ))}
                  </div>

                  {/* 操作按鈕 */}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setInstallDialogOpen(false)}
                      disabled={isInstalling}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleInstallServer}
                      disabled={
                        isInstalling || selectedComputersForInstall.length === 0
                      }
                      style={{ backgroundColor: "#7B86AA" }}
                      className="hover:opacity-80 text-white"
                    >
                      {isInstalling ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Installing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Confirm Install
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* 搜尋框 */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search computers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* 已安裝伺服器顯示 */}
        {installedServers.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Installed Servers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {installedServers.map((serverId) => {
                  const server = servers.find((s) => s.id === serverId);
                  return (
                    <Badge
                      key={serverId}
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      {server?.name || serverId}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 電腦清單 */}
      <ComputerList
        serverId={selectedServer || ""}
        searchTerm={searchTerm}
        onComputerSelect={onComputerSelect}
      />
    </div>
  );
}
