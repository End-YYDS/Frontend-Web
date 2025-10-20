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
  Network,
  Database,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type {
  GetMysqlRequest,
  GetMysqlResponse,
  PostMysqlActionRequest,
  PostMysqlActionResponse,
} from "./types";

interface ComputerDetailProps {
  computerId: string;
  onBack: () => void;
}

export function ComputerDetail({ computerId, onBack }: ComputerDetailProps) {
  const [serverStatus, setServerStatus] = useState<GetMysqlResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<"" | "start" | "stop" | "restart">("");
  const { toast } = useToast();

  /** 取得 MySQL 狀態 */
  const fetchServerStatus = async () => {
    setLoading(true);
    try {
      const sendData: GetMysqlRequest = { Uuid: computerId };
      const res = await axios.post<GetMysqlResponse>("/api/server/mysql", sendData);
      setServerStatus(res.data);
    } catch (error) {
      console.error("Fetch MySQL status failed:", error);
      toast({
        title: "Error",
        description: "Failed to fetch MySQL server status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerStatus();
  }, [computerId]);

  /** 執行 MySQL 操作 (Start / Stop / Restart) */
  const performAction = async (action: "start" | "stop" | "restart") => {
    setActionLoading(action);
    try {
      const sendData: PostMysqlActionRequest = { Uuid: computerId };
      const res = await axios.post<PostMysqlActionResponse>(
        `/api/server/mysql/action/${action}`,
        sendData
      );
      const data = res.data;

      if (data.Type === "Ok") {
        toast({ title: "Success", description: `MySQL ${action} succeeded` });
        fetchServerStatus();
      } else {
        toast({ title: "Error", description: data.Message, variant: "destructive" });
      }
    } catch (error) {
      console.error(`${action} failed`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} MySQL server`,
        variant: "destructive",
      });
    } finally {
      setActionLoading("");
    }
  };

  /** Loading 畫面 */
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

  /** 取得失敗 */
  if (!serverStatus) {
    return (
      <div className="p-6">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              Failed to load MySQL server status
            </h3>
            <Button onClick={fetchServerStatus}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /** 顯示狀態 */
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
              MySQL Server - {serverStatus.Hostname}
            </h1>
            <p className="text-slate-600">{computerId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => performAction("start")}
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
            onClick={() => performAction("stop")}
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

      {/* Info Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
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

      {/* More Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-slate-600">Databases</p>
              <p className="text-xl font-bold">{serverStatus.Databases}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-500" />
            <div>
              <p className="text-sm font-medium text-slate-600">Queries / sec</p>
              <p className="text-xl font-bold">{serverStatus.QueriesPerSec}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>MySQL Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="errors" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="errors">
                Error Logs ({serverStatus.Logs.ErrLength})
              </TabsTrigger>
              <TabsTrigger value="queries">
                Query Logs ({serverStatus.Logs.LeaseLength})
              </TabsTrigger>
            </TabsList>

            {/* Error Logs */}
            <TabsContent value="errors" className="space-y-4">
              {serverStatus.Logs.ErrorLog.map((log, i) => (
                <Card key={i} className="bg-red-50 border-red-200">
                  <CardContent className="p-4 flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="border-red-500 text-red-700">
                          {log.Level.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-slate-600">{log.Module}</span>
                        <span className="text-sm text-slate-500">PID: {log.Pid}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 mb-1">{log.Message}</p>
                      <p className="text-xs text-slate-600">Client: {log.Client}</p>
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

            {/* Query Logs */}
            <TabsContent value="queries" className="space-y-4">
              {serverStatus.Logs.LeaseLog.map((log, i) => (
                <Card key={i} className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className={
                            log.Status === "Success"
                              ? "border-green-500 text-green-700"
                              : log.Status === "Error"
                              ? "border-red-500 text-red-700"
                              : "border-yellow-500 text-yellow-700"
                          }
                        >
                          {log.Status}
                        </Badge>
                        <span className="text-sm font-medium text-slate-700">
                          {log.QueryType}
                        </span>
                        <span className="text-sm text-slate-600">{log.Query}</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-1">
                        User: {log.User} | DB: {log.Database}
                      </p>
                      <p className="text-xs text-slate-600">
                        Duration: {log.DurationMs} ms | Affected: {log.AffectedRows}
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
