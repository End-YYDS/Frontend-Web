
import { useEffect, useState } from "react";
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

interface ServerContentProps {
  selectedServer: string | null;
  selectedComputer: string | null;
  onComputerSelect: (computer: string | null) => void;
}

// Mock data for servers and computers
const servers = [
  { id: "apache", name: "Apache", installed: true },
  { id: "nginx", name: "Nginx", installed: false },
  { id: "bind", name: "BIND DNS", installed: true },
  { id: "dhcp", name: "DHCP", installed: false },
  { id: "ldap", name: "LDAP", installed: true },
  { id: "mysql", name: "MySQL Database", installed: true },
  { id: "postgresql", name: "PostgreSQL Database", installed: false },
  { id: "proftpd", name: "ProFTPD", installed: true },
  { id: "samba", name: "Samba", installed: false },
  { id: "squid", name: "Squid Proxy", installed: true },
  { id: "ssh", name: "SSH", installed: true }
];

const computers = [
  { id: "comp1", name: "SERVER-001", uuid: "uuid-001", status: "online" },
  { id: "comp2", name: "SERVER-002", uuid: "uuid-002", status: "online" },
  { id: "comp3", name: "SERVER-003", uuid: "uuid-003", status: "offline" },
  { id: "comp4", name: "WORKSTATION-001", uuid: "uuid-004", status: "online" },
  { id: "comp5", name: "WORKSTATION-002", uuid: "uuid-005", status: "online" }
];

export function ServerContent({ selectedServer, selectedComputer, onComputerSelect }: ServerContentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComputersForInstall, setSelectedComputersForInstall] = useState<string[]>([]);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [installedServers, setInstalledServers] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Reset selected computer when server changes
    if (selectedServer && selectedComputer) {
      onComputerSelect(null);
    }
  }, [selectedServer]);

  const getServerDisplayName = (serverId: string) => {
    const serverNames: { [key: string]: string } = {
      apache: "Apache Webserver",
      nginx: "Nginx",
      bind: "BIND DNS Server",
      dhcp: "DHCP Server",
      ldap: "LDAP Server",
      mysql: "MySQL Database Server",
      postgresql: "PostgreSQL Database Server",
      proftpd: "ProFTPD Server",
      samba: "Samba Windows File Sharing",
      squid: "Squid Proxy Server",
      ssh: "SSH Server"
    };
    return serverNames[serverId] || serverId;
  };

  const selectedServerData = servers.find(s => s.id === selectedServer);

  const handleComputerToggle = (computerId: string) => {
    setSelectedComputersForInstall(prev => 
      prev.includes(computerId) 
        ? prev.filter(id => id !== computerId)
        : [...prev, computerId]
    );
  };

  const handleInstallServer = async () => {
    if (selectedComputersForInstall.length === 0) {
      toast({
        title: "請選擇主機",
        description: "請至少選擇一台主機進行安裝。",
        variant: "destructive"
      });
      return;
    }

    setIsInstalling(true);
    
    // Simulate installation process
    setTimeout(() => {
      // Add server to installed list
      if (selectedServer && !installedServers.includes(selectedServer)) {
        setInstalledServers(prev => [...prev, selectedServer]);
      }
      
      setIsInstalling(false);
      setInstallDialogOpen(false);
      setSelectedComputersForInstall([]);
      
      toast({
        title: "安裝成功",
        description: `${selectedServerData?.name} 已成功安裝到選定的主機上。`,
      });
    }, 2000);
  };

  if (selectedComputer) {
    return (
      <ComputerDetail 
        serverId={selectedServer || ""}
        computerId={selectedComputer}
        onBack={() => onComputerSelect(null)}
      />
    );
  }

//   const isServerInstalled = (serverId: string) => {
//     const server = servers.find(s => s.id === serverId);
//     return server?.installed || installedServers.includes(serverId);
//   };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {getServerDisplayName(selectedServer || "")}
            </h2>
            <p className="text-slate-600">Manage processes and system operations across all computers</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={installDialogOpen} onOpenChange={setInstallDialogOpen}>
              <DialogTrigger asChild>
                <Button style={{ backgroundColor: '#7B86AA' }} className="hover:opacity-80 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  一鍵安裝
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>安裝 {selectedServerData?.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    選擇要安裝 {selectedServerData?.name} 的主機：
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {computers.map((computer) => (
                      <div key={computer.id} className="flex items-center space-x-2 p-2 border rounded">
                        <Checkbox
                          id={computer.id}
                          checked={selectedComputersForInstall.includes(computer.id)}
                          onCheckedChange={() => handleComputerToggle(computer.id)}
                        />
                        <label htmlFor={computer.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{computer.name}</span>
                            <Badge variant={computer.status === 'online' ? 'default' : 'secondary'}>
                              {computer.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">{computer.uuid}</p>
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setInstallDialogOpen(false)}
                      disabled={isInstalling}
                    >
                      取消
                    </Button>
                    <Button 
                      onClick={handleInstallServer}
                      disabled={isInstalling || selectedComputersForInstall.length === 0}
                      style={{ backgroundColor: '#7B86AA' }}
                      className="hover:opacity-80 text-white"
                    >
                      {isInstalling ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          安裝中...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          確定安裝
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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

        {/* Show installed servers */}
        {installedServers.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                已安裝的伺服器
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {installedServers.map(serverId => {
                  const server = servers.find(s => s.id === serverId);
                  return (
                    <Badge key={serverId} variant="default" className="bg-green-100 text-green-800">
                      {server?.name}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ComputerList 
        serverId={selectedServer || ""}
        searchTerm={searchTerm}
        onComputerSelect={onComputerSelect}
      />
    </div>
  );
}