import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, Square, RotateCcw, Monitor, Cpu, MemoryStick, Network, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ComputerDetailProps {
  computerId: string;
  onBack: () => void;
}

type ServerStatusType = "active" | "stopped";

interface ServerLogDate {
  Year: number;
  Month: "Jan"|"Feb"|"Mar"|"Apr"|"May"|"Jun"|"Jul"|"Aug"|"Sep"|"Oct"|"Nov"|"Dec";
  Week?: "Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat"|"Sun";
  Day: number;
  Time: { Hour: number; Min: number };
}

interface ErrorLog {
  Date: ServerLogDate;
  Module: string;
  Level: "debug"|"info"|"notice"|"warn"|"error"|"crit"|"alert"|"emerg";
  Pid: number;
  Client: string;
  Message: string;
}

interface AccessLog {
  Ip: string;
  Date: ServerLogDate;
  Method: string;
  URL: string;
  Protocol: string;
  Status: number;
  Byte: number;
  Referer: string;
  User_Agent: string;
}

interface ServerLogs {
  Error_log: ErrorLog[];
  Errlength: number;
  Access_log: AccessLog[];
  Acclength: number;
}

interface ServerStatus {
  Hostname: string;
  Status: ServerStatusType;
  Cpu: number;
  Memory: number;
  Connections: number;
  Logs: ServerLogs;
}

interface ActionResponse {
  Type: "OK" | "ERR";
  Message: string;
}

export function ComputerDetail({ computerId, onBack }: ComputerDetailProps) {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<""|"start"|"stop"|"restart">("");
  const { toast } = useToast();

  // 取得伺服器狀態
  const fetchServerStatus = async () => {
    setLoading(true);
    try {
      const res = await axios.get<ServerStatus>("/api/server/apache", { params: { Uuid: computerId } });
      setServerStatus(res.data);
    } catch (e) {
      console.error("Fetch server status failed:", e);
      toast({ title: "Error", description: "Failed to fetch server status", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerStatus();
  }, [computerId]);

  // 執行伺服器操作
  const performAction = async (action: "start"|"stop"|"restart") => {
    setActionLoading(action);
    try {
      const res = await axios.post<ActionResponse>(`/api/server/apache/action/${action}`, { Uuid: computerId });
      if (res.data.Type === "OK") {
        toast({ title: "Success", description: `Server ${action} succeeded` });
        fetchServerStatus();
      } else {
        toast({ title: "Error", description: res.data.Message, variant: "destructive" });
      }
    } catch (e) {
      console.error(`${action} failed`, e);
      toast({ title: "Error", description: `Failed to ${action} server`, variant: "destructive" });
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-200 rounded"></div>)}
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
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Apache Webserver - {serverStatus.Hostname}</h1>
            <p className="text-slate-600">{computerId}</p>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => performAction("start")}
            disabled={serverStatus.Status === "active" || actionLoading !== ""}
            className="bg-green-600 hover:bg-green-700"
          >
            {actionLoading === "start" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Start
          </Button>
          <Button
            onClick={() => performAction("stop")}
            disabled={serverStatus.Status === "stopped" || actionLoading !== ""}
            variant="destructive"
          >
            {actionLoading === "stop" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Square className="w-4 h-4 mr-2" />}
            Stop
          </Button>
          <Button
            onClick={() => performAction("restart")}
            disabled={actionLoading !== ""}
            variant="outline"
          >
            {actionLoading === "restart" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
            Restart
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Monitor className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-slate-600">Status</p>
              <Badge variant={serverStatus.Status === "active" ? "default" : "secondary"} className={serverStatus.Status === "active" ? "bg-green-500" : "bg-red-500"}>
                {serverStatus.Status === "active" ? "Running" : "Stopped"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Cpu className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-slate-600">CPU Usage</p>
              <p className="text-xl font-bold">{serverStatus.Cpu}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <MemoryStick className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-slate-600">Memory</p>
              <p className="text-xl font-bold">{serverStatus.Memory}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Network className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm font-medium text-slate-600">Connections</p>
              <p className="text-xl font-bold">{serverStatus.Connections}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Server Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="errors" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="errors">Error Logs ({serverStatus.Logs.Errlength})</TabsTrigger>
              <TabsTrigger value="access">Access Logs ({serverStatus.Logs.Acclength})</TabsTrigger>
            </TabsList>
            <TabsContent value="errors" className="space-y-4">
              {serverStatus.Logs.Error_log.map((log, i) => (
                <Card key={i} className="bg-red-50 border-red-200">
                  <CardContent className="p-4 flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={log.Level==="error"?"border-red-500 text-red-700":log.Level==="warn"?"border-yellow-500 text-yellow-700":""}>
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
                      <p>{String(log.Date.Time.Hour).padStart(2,"0")}:{String(log.Date.Time.Min).padStart(2,"0")}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="access" className="space-y-4">
              {serverStatus.Logs.Access_log.map((log, i) => (
                <Card key={i} className="bg-green-50 border-green-200">
                  <CardContent className="p-4 flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={log.Status>=200 && log.Status<300?"border-green-500 text-green-700":log.Status>=400?"border-red-500 text-red-700":""}>
                          {log.Status}
                        </Badge>
                        <span className="text-sm font-medium text-slate-700">{log.Method}</span>
                        <span className="text-sm text-slate-600">{log.URL}</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-1">IP: {log.Ip} | Protocol: {log.Protocol}</p>
                      <p className="text-xs text-slate-600">Size: {log.Byte} bytes</p>
                      {log.Referer && <p className="text-xs text-slate-500 truncate">Referer: {log.Referer}</p>}
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>{log.Date.Month} {log.Date.Day}, {log.Date.Year}</p>
                      <p>{String(log.Date.Time.Hour).padStart(2,"0")}:{String(log.Date.Time.Min).padStart(2,"0")}</p>
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
