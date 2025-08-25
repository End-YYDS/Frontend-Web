
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, Square, RotateCcw, Monitor, Cpu, MemoryStick, Network, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ComputerDetailProps {
  serverId: string;
  computerId: string;
  onBack: () => void;
}

interface ServerStatus {
  Hostname: string;
  Status: "active" | "stopped";
  Cpu: number;
  Memory: number;
  Connections: number;
  Logs: {
    Error_log: Array<{
      Date: {
        Year: number;
        Month: string;
        Day: number;
        Week: string;
        Time: { Hour: number; Min: number };
      };
      Module: string;
      Level: string;
      Pid: number;
      Client: string;
      Message: string;
    }>;
    Errlength: number;
    Access_log: Array<{
      Ip: string;
      Date: {
        Year: number;
        Month: string;
        Day: number;
        Time: { Hour: number; Min: number };
      };
      Method: string;
      URL: string;
      Protocol: string;
      Status: number;
      Byte: number;
      Referer: string;
      User_Agent: string;
    }>;
    Acclength: number;
  };
}

export function ComputerDetail({ serverId, computerId, onBack }: ComputerDetailProps) {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchServerStatus();
  }, [serverId, computerId]);

  const fetchServerStatus = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: ServerStatus = {
        Hostname: "DESKTOP-001",
        Status: "active",
        Cpu: 45.2,
        Memory: 67.8,
        Connections: 127,
        Logs: {
          Error_log: [
            {
              Date: { Year: 2024, Month: "Dec", Day: 24, Week: "Tue", Time: { Hour: 10, Min: 30 } },
              Module: "core",
              Level: "error",
              Pid: 1234,
              Client: "192.168.1.100:8080",
              Message: "File not found: /var/www/html/missing.html"
            },
            {
              Date: { Year: 2024, Month: "Dec", Day: 24, Week: "Tue", Time: { Hour: 9, Min: 15 } },
              Module: "ssl",
              Level: "warn",
              Pid: 1235,
              Client: "192.168.1.101:443",
              Message: "SSL certificate will expire in 30 days"
            }
          ],
          Errlength: 2,
          Access_log: [
            {
              Ip: "192.168.1.100",
              Date: { Year: 2024, Month: "Dec", Day: 24, Time: { Hour: 10, Min: 45 } },
              Method: "GET",
              URL: "/index.html",
              Protocol: "HTTP/1.1",
              Status: 200,
              Byte: 1024,
              Referer: "https://example.com",
              User_Agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
          ],
          Acclength: 1
        }
      };
      
      setServerStatus(mockData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch server status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleServerAction = async (action: "start" | "stop" | "restart") => {
    setActionLoading(action);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Success",
        description: `Server ${action} completed successfully`,
      });
      
      // Refresh status
      fetchServerStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} server`,
        variant: "destructive",
      });
    } finally {
      setActionLoading("");
    }
  };

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!serverStatus) {
    return (
      <div className="p-6">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">Failed to load server status</h3>
            <Button onClick={fetchServerStatus}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {getServerDisplayName(serverId)} - {serverStatus.Hostname}
            </h1>
            <p className="text-slate-600">{computerId}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleServerAction("start")}
            disabled={serverStatus.Status === "active" || actionLoading !== ""}
            className="bg-green-600 hover:bg-green-700"
          >
            {actionLoading === "start" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Start
          </Button>
          <Button
            onClick={() => handleServerAction("stop")}
            disabled={serverStatus.Status === "stopped" || actionLoading !== ""}
            variant="destructive"
          >
            {actionLoading === "stop" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Square className="w-4 h-4 mr-2" />
            )}
            Stop
          </Button>
          <Button
            onClick={() => handleServerAction("restart")}
            disabled={actionLoading !== ""}
            variant="outline"
          >
            {actionLoading === "restart" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            Restart
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Monitor className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-slate-600">Status</p>
                <Badge 
                  variant={serverStatus.Status === "active" ? "default" : "secondary"}
                  className={serverStatus.Status === "active" ? "bg-green-500" : "bg-red-500"}
                >
                  {serverStatus.Status === "active" ? "Running" : "Stopped"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Cpu className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-slate-600">CPU Usage</p>
                <p className="text-xl font-bold">{serverStatus.Cpu}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MemoryStick className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-slate-600">Memory</p>
                <p className="text-xl font-bold">{serverStatus.Memory}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Network className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-slate-600">Connections</p>
                <p className="text-xl font-bold">{serverStatus.Connections}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Server Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="errors" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="errors">
                Error Logs ({serverStatus.Logs.Errlength})
              </TabsTrigger>
              <TabsTrigger value="access">
                Access Logs ({serverStatus.Logs.Acclength})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="errors" className="space-y-4">
              {serverStatus.Logs.Error_log.map((log, index) => (
                <Card key={index} className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="outline"
                            className={`
                              ${log.Level === "error" ? "border-red-500 text-red-700" : ""}
                              ${log.Level === "warn" ? "border-yellow-500 text-yellow-700" : ""}
                            `}
                          >
                            {log.Level.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-slate-600">{log.Module}</span>
                          <span className="text-sm text-slate-500">PID: {log.Pid}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-800 mb-1">{log.Message}</p>
                        <p className="text-xs text-slate-600">Client: {log.Client}</p>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <p>{log.Date.Month} {log.Date.Day}, {log.Date.Year}</p>
                        <p>{String(log.Date.Time.Hour).padStart(2, '0')}:{String(log.Date.Time.Min).padStart(2, '0')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="access" className="space-y-4">
              {serverStatus.Logs.Access_log.map((log, index) => (
                <Card key={index} className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="outline"
                            className={`
                              ${log.Status >= 200 && log.Status < 300 ? "border-green-500 text-green-700" : ""}
                              ${log.Status >= 400 ? "border-red-500 text-red-700" : ""}
                            `}
                          >
                            {log.Status}
                          </Badge>
                          <span className="text-sm font-medium text-slate-700">{log.Method}</span>
                          <span className="text-sm text-slate-600">{log.URL}</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-1">IP: {log.Ip} | Protocol: {log.Protocol}</p>
                        <p className="text-xs text-slate-600">Size: {log.Byte} bytes</p>
                        {log.Referer && (
                          <p className="text-xs text-slate-500 truncate">Referer: {log.Referer}</p>
                        )}
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <p>{log.Date.Month} {log.Date.Day}, {log.Date.Year}</p>
                        <p>{String(log.Date.Time.Hour).padStart(2, '0')}:{String(log.Date.Time.Min).padStart(2, '0')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}