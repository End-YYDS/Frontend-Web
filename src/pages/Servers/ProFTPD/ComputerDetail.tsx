import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Play,
  Square,
  RotateCcw,
  Monitor,
  Cpu,
  MemoryStick,
  Users,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type {
  GetProftpdRequest,
  GetProftpdResponse,
  PostProftpdActionRequest,
  PostProftpdActionResponse,
} from "./types";

interface ComputerDetailProps {
  computerId: string;
  onBack: () => void;
}

export function ComputerDetail({ computerId, onBack }: ComputerDetailProps) {
  const [ftpStatus, setFtpStatus] = useState<GetProftpdResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<"" | "start" | "stop" | "restart">("");
  const { toast } = useToast();

  /** 取得 ProFTPD 狀態 */
  const fetchFtpStatus = async () => {
    setLoading(true);
    try {
      const sendData: GetProftpdRequest = { Uuid: computerId };
      const res = await axios.post<GetProftpdResponse>("/api/server/proftpd", sendData);
      setFtpStatus(res.data);
    } catch (error) {
      console.error("Fetch ProFTPD status failed:", error);
      toast({
        title: "Error",
        description: "Failed to fetch ProFTPD status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFtpStatus();
  }, [computerId]);

  /** 執行 FTP 操作 (Start / Stop / Restart) */
  const performAction = async (action: "start" | "stop" | "restart") => {
    setActionLoading(action);
    try {
      const sendData: PostProftpdActionRequest = { Uuid: computerId };
      const res = await axios.post<PostProftpdActionResponse>(
        `/api/server/proftpd/action/${action}`,
        sendData
      );
      const data = res.data;

      if (data.Type === "Ok") {
        toast({ title: "Success", description: `ProFTPD ${action} succeeded` });
        fetchFtpStatus();
      } else {
        toast({ title: "Error", description: data.Message, variant: "destructive" });
      }
    } catch (error) {
      console.error(`${action} failed`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} ProFTPD`,
        variant: "destructive",
      });
    } finally {
      setActionLoading("");
    }
  };

  // Loading 狀態畫面
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

  // 取得失敗畫面
  if (!ftpStatus) {
    return (
      <div className="p-6">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              Failed to load ProFTPD status
            </h3>
            <Button onClick={fetchFtpStatus}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 顯示 ProFTPD 狀態與 Logs
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              ProFTPD Server - {ftpStatus.Hostname}
            </h1>
            <p className="text-slate-600">{computerId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => performAction("start")}
            disabled={ftpStatus.Status === "active" || actionLoading !== ""}
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
            onClick={() => performAction("stop")}
            disabled={ftpStatus.Status === "stopped" || actionLoading !== ""}
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
            onClick={() => performAction("restart")}
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

      {/* 系統資訊 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Monitor className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-slate-600">Status</p>
              <Badge
                className={
                  ftpStatus.Status === "active" ? "bg-green-500" : "bg-red-500"
                }
              >
                {ftpStatus.Status === "active" ? "Running" : "Stopped"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Cpu className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-slate-600">CPU Usage</p>
              <p className="text-xl font-bold">{ftpStatus.Cpu}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <MemoryStick className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-slate-600">Memory</p>
              <p className="text-xl font-bold">{ftpStatus.Memory}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm font-medium text-slate-600">Active Sessions</p>
              <p className="text-xl font-bold">{ftpStatus.Connections}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {ftpStatus.Sessions.length === 0 ? (
            <p className="text-sm text-slate-500">No active sessions</p>
          ) : (
            ftpStatus.Sessions.map((s, i) => (
              <div
                key={i}
                className="border-b border-slate-200 py-2 flex justify-between text-sm"
              >
                <div>
                  <p className="font-medium">{s.Username}</p>
                  <p className="text-slate-500">
                    {s.Ip} — {s.Status}
                  </p>
                </div>
                <div className="text-right text-slate-600">
                  <p>
                    {s.LoginTime.Month} {s.LoginTime.Day}, {s.LoginTime.Year}
                  </p>
                  <p>
                    {s.LoginTime.Hour}:{s.LoginTime.Min.toString().padStart(2, "0")}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>FTP Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="errors" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="errors">
                Error Logs ({ftpStatus.Logs.ErrLength})
              </TabsTrigger>
              <TabsTrigger value="access">
                Access Logs ({ftpStatus.Logs.AccLength})
              </TabsTrigger>
            </TabsList>

            {/* Error Logs */}
            <TabsContent value="errors" className="space-y-4">
              {ftpStatus.Logs.ErrorLog.map((log, i) => (
                <Card key={i} className="bg-red-50 border-red-200">
                  <CardContent className="p-4 flex justify-between">
                    <div className="flex-1">
                      <Badge
                        variant="outline"
                        className={`border ${
                          log.Level === "error"
                            ? "border-red-500 text-red-700"
                            : "border-yellow-500 text-yellow-700"
                        }`}
                      >
                        {log.Level.toUpperCase()}
                      </Badge>
                      <p className="text-sm mt-1">{log.Message}</p>
                      <p className="text-xs text-slate-600 mt-1">Client: {log.Client}</p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>
                        {log.Date.Month} {log.Date.Day}, {log.Date.Year}
                      </p>
                      <p>
                        {String(log.Date.Time.Hour).padStart(2, "0")}:
                        {String(log.Date.Time.Min).padStart(2, "0")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Access Logs */}
            <TabsContent value="access" className="space-y-4">
              {ftpStatus.Logs.AccessLog.map((log, i) => (
                <Card key={i} className="bg-green-50 border-green-200">
                  <CardContent className="p-4 flex justify-between">
                    <div>
                      <p className="text-sm font-medium">{log.Username}</p>
                      <p className="text-xs text-slate-600">
                        {log.Action} - {log.File} ({log.Size} bytes)
                      </p>
                      <p className="text-xs text-slate-500">
                        IP: {log.Ip} | Status: {log.Status}
                      </p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>
                        {log.Date.Month} {log.Date.Day}, {log.Date.Year}
                      </p>
                      <p>
                        {String(log.Date.Time.Hour).padStart(2, "0")}:
                        {String(log.Date.Time.Min).padStart(2, "0")}
                      </p>
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
