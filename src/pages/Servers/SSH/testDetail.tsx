import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Play,
  Square,
  RotateCcw,
  Monitor,
  Cpu,
  MemoryStick,
  Users,
  Loader2,
  AlertTriangle,
  LogIn,
  LogOut,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type {
  GetSshRequest,
  GetSshResponse,
  PostSshActionRequest,
  PostSshActionResponse,
} from "./types";

interface ComputerDetailProps {
  computerId: string;
  onBack: () => void;
}

export function ComputerDetail({ computerId, onBack }: ComputerDetailProps) {
  const [sshStatus, setSshStatus] = useState<GetSshResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<"" | "start" | "stop" | "restart">("");
  const { toast } = useToast();

  /** 取得 SSH 狀態 */
const fetchSshStatus = async () => {
  setLoading(true);
  try {
    const sendData: GetSshRequest = { Uuid: computerId };
    const res = await axios.post<GetSshResponse>("/api/server/ssh", sendData);
    setSshStatus(res.data);
  } catch (error) {
    console.warn("⚠️ Using mock SSH data (API not available)");

    // 🧪 模擬測試資料
    const mockData: GetSshResponse = {
      Hostname: (() => {
        switch (computerId) {
          case "11111":
            return "Server-Alpha";
          case "11112":
            return "Server-Beta";
          case "11113":
            return "Server-Gamma";
          case "11114":
            return "Server-Delta";
          default:
            return "Unknown";
        }
      })(),
      Status: Math.random() > 0.5 ? "active" : "stopped",
      Cpu: Math.floor(Math.random() * 100),
      Memory: Math.floor(Math.random() * 100),
      Connections: Math.floor(Math.random() * 10),
      LastLogin: {
        User: "admin",
        Ip: "192.168.1.10",
        Date: {
          Year: 2025,
          Month: "Oct",
          Day: 21,
          Week: "Tue",
          Time: { Hour: 14, Min: 32 },
        },
      },
      Logs: {
        AuthLength: 5,
        AuthLog: [
          {
            Action: "login",
            User: "root",
            Ip: "10.0.0.5",
            Result: "success",
            Message: "Logged in successfully",
            Date: {
              Year: 2025,
              Month: "Oct",
              Day: 21,
              Week: "Tue",
              Time: { Hour: 13, Min: 22 },
            },
          },
          {
            Action: "logout",
            User: "root",
            Ip: "10.0.0.5",
            Result: "success",
            Message: "Session ended",
            Date: {
              Year: 2025,
              Month: "Oct",
              Day: 21,
              Week: "Tue",
              Time: { Hour: 13, Min: 45 },
            },
          },
          {
            Action: "failed_login",
            User: "guest",
            Ip: "203.0.113.20",
            Result: "failure",
            Message: "Invalid password",
            Date: {
              Year: 2025,
              Month: "Oct",
              Day: 21,
              Week: "Tue",
              Time: { Hour: 14, Min: 10 },
            },
          },
          {
            Action: "login",
            User: "admin",
            Ip: "192.168.1.15",
            Result: "success",
            Message: "SSH session started",
            Date: {
              Year: 2025,
              Month: "Oct",
              Day: 21,
              Week: "Tue",
              Time: { Hour: 14, Min: 31 },
            },
          },
          {
            Action: "logout",
            User: "admin",
            Ip: "192.168.1.15",
            Result: "success",
            Message: "User logged out",
            Date: {
              Year: 2025,
              Month: "Oct",
              Day: 21,
              Week: "Tue",
              Time: { Hour: 14, Min: 42 },
            },
          },
        ],
      },
    };

    setSshStatus(mockData);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchSshStatus();
  }, [computerId]);

  /** 執行 SSH 操作 */
  const performAction = async (action: "start" | "stop" | "restart") => {
    setActionLoading(action);
    try {
      const sendData: PostSshActionRequest = { Uuid: computerId };
      const res = await axios.post<PostSshActionResponse>(
        `/api/server/ssh/action/${action}`,
        sendData
      );
      const data = res.data;

      if (data.Type === "Ok") {
        toast({ title: "Success", description: `SSH ${action} succeeded` });
        fetchSshStatus();
      } else {
        toast({ title: "Error", description: data.Message, variant: "destructive" });
      }
    } catch (error) {
      console.error(`${action} failed`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} SSH`,
        variant: "destructive",
      });
    } finally {
      setActionLoading("");
    }
  };

  // Loading 狀態
  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded"></div>
      </div>
    );
  }

  // 錯誤畫面
  if (!sshStatus) {
    return (
      <div className="p-6">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              Failed to load SSH status
            </h3>
            <Button onClick={fetchSshStatus}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { LastLogin, Logs } = sshStatus;

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
              SSH Server - {sshStatus.Hostname}
            </h1>
            <p className="text-slate-600">{computerId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => performAction("start")}
            disabled={sshStatus.Status === "active" || actionLoading !== ""}
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
            disabled={sshStatus.Status === "stopped" || actionLoading !== ""}
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
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
        <InfoCard icon={<Monitor className="text-blue-500" />} label="Status">
          <Badge className={sshStatus.Status === "active" ? "bg-green-500" : "bg-red-500"}>
            {sshStatus.Status === "active" ? "Running" : "Stopped"}
          </Badge>
        </InfoCard>
        <InfoCard icon={<Cpu className="text-purple-500" />} label="CPU">
          {sshStatus.Cpu}%
        </InfoCard>
        <InfoCard icon={<MemoryStick className="text-orange-500" />} label="Memory">
          {sshStatus.Memory}%
        </InfoCard>
        <InfoCard icon={<Users className="text-green-500" />} label="Connections">
          {sshStatus.Connections}
        </InfoCard>
        <InfoCard icon={<LogIn className="text-indigo-500" />} label="Last Login User">
          {LastLogin.User}
        </InfoCard>
        <InfoCard icon={<Monitor className="text-pink-500" />} label="IP">
          {LastLogin.Ip}
        </InfoCard>
      </div>

      {/* 登入紀錄 */}
      <Card>
        <CardHeader>
          <CardTitle>Auth Logs ({Logs.AuthLength})</CardTitle>
        </CardHeader>
        <CardContent>
          {Logs.AuthLog.length === 0 ? (
            <p className="text-sm text-slate-500">No authentication logs available</p>
          ) : (
            <div className="space-y-3">
              {Logs.AuthLog.map((log, i) => (
                <Card key={i} className="border border-slate-200">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="text-sm">
                      <p className="font-semibold text-slate-700 flex items-center gap-2">
                        {log.Action === "login" && <LogIn className="w-4 h-4 text-green-500" />}
                        {log.Action === "logout" && <LogOut className="w-4 h-4 text-blue-500" />}
                        {log.Action === "failed_login" && (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        {log.User} - {log.Action}
                      </p>
                      <p className="text-xs text-slate-600">
                        {log.Ip} | {log.Result} | {log.Message}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** 小卡片元件 */
function InfoCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-8 h-8">{icon}</div>
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="text-xl font-bold break-all">{children}</p>
        </div>
      </CardContent>
    </Card>
  );
}
