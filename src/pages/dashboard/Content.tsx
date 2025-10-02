import StatusCard from './MyCard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Check, AlertTriangle, X, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";

const ITEMS_PER_PAGE = 5;

export function DashboardContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<'safe' | 'warning' | 'danger' | null>(null);

  // 系統總覽資料
  const [, setInfo] = useState({ Safe: 0, Warn: 0, Dang: 0 });
  const [, setCluster] = useState({ Cpu: 0, Memory: 0, Disk: 0 });

  // 圖表資料
  const [cpuData, setCpuData] = useState<{time: string,value: number}[]>([]);
  const [memoryData, setMemoryData] = useState<{time: string,value: number}[]>([]);
  const [diskData, setDiskData] = useState<{time: string,value: number}[]>([]);

  // 電腦列表
  const [computers, setComputers] = useState<{name: string, cpu: string, memory: string, disk: string, status: string}[]>([]);

  const statusIconMap: Record<string, { icon: React.ElementType; color: string }> = {
    safe: { icon: Check, color: "text-green-600" },
    warning: { icon: AlertTriangle, color: "text-yellow-500" },
    danger: { icon: X, color: "text-red-500" },
  };

  /* ==============================
     mock虛擬資料 fallback TODO: 刪除
     ============================== */
  const fakeData = () => {
    const timestamp = new Date().toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const fakeCluster = { Cpu: Math.floor(Math.random()*50)+30, Memory: Math.floor(Math.random()*50)+30, Disk: Math.floor(Math.random()*50)+30 };
    const fakeInfo = { Safe: 5, Warn: 3, Dang: 2 };

    // 生成虛擬電腦列表
    const list: typeof computers = [
      ...Array(fakeInfo.Safe).fill(0).map((_,i) => ({ name: `PC-Safe-${i+1}`, cpu: (Math.random()*50+10).toFixed(0)+'%', memory: (Math.random()*50+10).toFixed(0)+'%', disk: (Math.random()*50+10).toFixed(0)+'%', status:'safe'})),
      ...Array(fakeInfo.Warn).fill(0).map((_,i) => ({ name: `PC-Warn-${i+1}`, cpu: (Math.random()*30+50).toFixed(0)+'%', memory: (Math.random()*30+50).toFixed(0)+'%', disk: (Math.random()*30+50).toFixed(0)+'%', status:'warning'})),
      ...Array(fakeInfo.Dang).fill(0).map((_,i) => ({ name: `PC-Danger-${i+1}`, cpu: (Math.random()*20+80).toFixed(0)+'%', memory: (Math.random()*20+80).toFixed(0)+'%', disk: (Math.random()*20+80).toFixed(0)+'%', status:'danger'}))
    ];

    return { fakeCluster, fakeInfo, list, timestamp };
  };

  /* ==============================
     需要連接的後端 API
     ============================== */
  const fetchAllInfo = async () => {
  try {
    // ----------------------------
    // TODO: 連接後端 GET /api/info/getAll
    // ----------------------------
    // const res = await fetch('/api/info/getAll', { method: 'GET' });
    // const data = await res.json();

    // // 更新總覽資訊
    // setInfo(data.Info);
    // setCluster(data.Cluster);

    // // 使用 cluster 資料更新圖表
    // const timestamp = new Date().toLocaleTimeString('zh-TW', {
    //   hour12: false,
    //   hour: '2-digit',
    //   minute: '2-digit',
    //   second: '2-digit',
    // });
    // setCpuData(prev => [...prev.slice(-5), { time: timestamp, value: data.Cluster.Cpu }]);
    // setMemoryData(prev => [...prev.slice(-5), { time: timestamp, value: data.Cluster.Memory }]);
    // setDiskData(prev => [...prev.slice(-5), { time: timestamp, value: data.Cluster.Disk }]);

    // // ----------------------------
    // // 取得每台主機資訊（可依需求改 target）
    // // ----------------------------
    // // 若要全部主機資料，Uuid = -1
    // const resPcs = await fetch('/api/info/get', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     Zone: 'info',
    //     Target: 'safe', // 可改成 'safe','warn','dang','Cpu','Memory','Disk'
    //     Uuid: -1,
    //   }),
    // });
    // const pcsData = await resPcs.json();

    // // 將取得的電腦資料轉成前端格式
    // const list: typeof computers = Object.entries(pcsData.Pcs).map(([uuid, stats]: any) => ({
    //   name: `PC-${uuid}`,
    //   cpu: stats.Cpu + '%',
    //   memory: stats.Memory + '%',
    //   disk: stats.Disk + '%',
    //   status: (() => {
    //     const cpu = stats.Cpu, mem = stats.Memory, disk = stats.Disk;
    //     if (cpu < 50 && mem < 50 && disk < 50) return 'safe';
    //     if (cpu < 70 && mem < 70 && disk < 70) return 'warning';
    //     return 'danger';
    //   })(),
    // }));

    // setComputers(list);

      // 若 API 尚未完成，使用虛擬資料
      const { fakeCluster, fakeInfo, list, timestamp } = fakeData();
      setInfo(fakeInfo);
      setCluster(fakeCluster);
      setCpuData(prev => [...prev.slice(-5), { time: timestamp, value: fakeCluster.Cpu }]);
      setMemoryData(prev => [...prev.slice(-5), { time: timestamp, value: fakeCluster.Memory }]);
      setDiskData(prev => [...prev.slice(-5), { time: timestamp, value: fakeCluster.Disk }]);
      setComputers(list);

    } catch (error) {
      console.error('Error fetching info:', error);
    }
  };

  useEffect(() => {
    fetchAllInfo();
    const interval = setInterval(fetchAllInfo, 5000); // 每 5 秒刷新
    return () => clearInterval(interval);
  }, []);

  const filteredComputers = selectedStatus 
    ? computers.filter(c => c.status === selectedStatus) 
    : computers;

  // const totalPages = Math.ceil(filteredComputers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentComputers = filteredComputers.slice(startIndex, endIndex);

  const handleStatusClick = (status: 'safe' | 'warning' | 'danger') => {
    setSelectedStatus(selectedStatus === status ? null : status);
    setCurrentPage(1);
  };

  const getStatusCount = (status: string) => computers.filter(c => c.status === status).length;

  /* ==============================
     以下為 Dashboard 顯示
     ============================== */
  if (selectedStatus) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedStatus(null)} className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold text-slate-700 capitalize flex items-center gap-2">
            {(() => {
              const { icon: Icon, color } = statusIconMap[selectedStatus] || { icon: Check, color: "text-slate-400" };
              return <Icon className={`w-6 h-6 ${color}`} />;
            })()}
            {selectedStatus} Computers ({filteredComputers.length})
          </h2>
        </div>

        <Card>
          <CardContent className="p-6 relative">
            <div className="relative w-full h-8 border-b border-slate-200">
              <div className="absolute left-0 w-[40%] overflow-hidden whitespace-nowrap text-ellipsis text-xs font-medium text-slate-600">Name</div>
              <div className="absolute left-[48%] w-[15%] text-right text-xs font-medium text-slate-600">CPU</div>
              <div className="absolute left-[65%] w-[15%] text-right text-xs font-medium text-slate-600">Memory</div>
              <div className="absolute left-[78%] w-[15%] text-right text-xs font-medium text-slate-600">Disk</div>
            </div>
            <div className="mt-2 space-y-1">
              {currentComputers.map((computer, index) => (
                <div key={index} className="relative w-full h-8 border-b border-slate-100">
                  <div className="absolute left-0 w-[40%] overflow-hidden whitespace-nowrap text-md">{computer.name}</div>
                  <div className="absolute left-[50%] w-[15%] text-right text-xs">
                    <Badge variant="outline" className={`${
                      parseInt(computer.cpu) > 70 ? "border-red-300 text-red-700" :
                      parseInt(computer.cpu) > 50 ? "border-yellow-300 text-yellow-700" :
                      "border-green-300 text-green-700"
                    }`}>{computer.cpu}</Badge>
                  </div>
                  <div className="absolute left-[65%] w-[15%] text-right text-xs">
                    <Badge variant="outline" className={`${
                      parseInt(computer.memory) > 70 ? "border-red-300 text-red-700" :
                      parseInt(computer.memory) > 50 ? "border-yellow-300 text-yellow-700" :
                      "border-green-300 text-green-700"
                    }`}>{computer.memory}</Badge>
                  </div>
                  <div className="absolute left-[80%] w-[15%] text-right text-xs">
                    <Badge variant="outline" className={`${
                      parseInt(computer.disk) > 70 ? "border-red-300 text-red-700" :
                      parseInt(computer.disk) > 50 ? "border-yellow-300 text-yellow-700" :
                      "border-green-300 text-green-700"
                    }`}>{computer.disk}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#E6E6E6', backgroundColor: '#A8AEBD' }}>
              Dashboard
          </h1>
      </div>

      {/* 狀態卡 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Button variant="ghost" className="h-auto p-0" onClick={() => handleStatusClick('safe')}>
          <StatusCard status="safe" getStatusCount={getStatusCount} />
        </Button>
        <Button variant="ghost" className="h-auto p-0" onClick={() => handleStatusClick('warning')}>
          <StatusCard status="warning" getStatusCount={getStatusCount} />
        </Button>
        <Button variant="ghost" className="h-auto p-0" onClick={() => handleStatusClick('danger')}>
          <StatusCard status="danger" getStatusCount={getStatusCount} />
        </Button>
      </div>

      {/* CPU / Memory / Disk 圖表 */}
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-slate-700">CPU</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cpuData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-slate-700">Memory</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={memoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-slate-700">Disk</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={diskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
