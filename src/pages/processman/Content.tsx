import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Square, 
  RotateCcw, 
  PlayCircle, 
  Monitor,
  Activity,
  Search,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Process {
  status: boolean;
  boot: boolean;
}

interface Computer {
  uuid: string;
  hostname: string;
  processes: Record<string, Process>;
  length: number;
}

interface ProcessData {
  pcs: Record<string, Computer>;
  length: number;
}

export const ProcessManager = () => {
  const [processData, setProcessData] = useState<ProcessData | null>(null);
  const [selectedComputer, setSelectedComputer] = useState<Computer | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    const mockData: ProcessData = {
      pcs: {
        "uuid-001": {
          uuid: "uuid-001",
          hostname: "DESKTOP-001",
          processes: {
            "nginx": { status: true, boot: true },
            "mysql": { status: true, boot: false },
            "apache": { status: false, boot: true },
            "redis": { status: true, boot: true },
            "docker": { status: true, boot: true },
            "nodejs": { status: false, boot: false }
          },
          length: 6
        },
        "uuid-002": {
          uuid: "uuid-002",
          hostname: "SERVER-002",
          processes: {
            "nginx": { status: true, boot: true },
            "postgresql": { status: false, boot: false },
            "docker": { status: true, boot: true },
            "elasticsearch": { status: true, boot: true },
            "kibana": { status: false, boot: true }
          },
          length: 5
        },
        "uuid-003": {
          uuid: "uuid-003",
          hostname: "WORKSTATION-003",
          processes: {
            "nodejs": { status: true, boot: false },
            "mongodb": { status: false, boot: true },
            "elasticsearch": { status: true, boot: true },
            "redis": { status: false, boot: false },
            "apache": { status: true, boot: true }
          },
          length: 5
        }
      },
      length: 3
    };
    
    setTimeout(() => {
      setProcessData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleProcessAction = async (action: string, uuid: string, processName: string) => {
    try {
      console.log(`Action: ${action}, UUID: ${uuid}, Process: ${processName}`);
      
      // Update local state immediately for better UX
      if (processData) {
        const newProcessData = { ...processData };
        if (action === 'start') {
          newProcessData.pcs[uuid].processes[processName].status = true;
        } else if (action === 'stop') {
          newProcessData.pcs[uuid].processes[processName].status = false;
        } else if (action === 'restart') {
          // For restart, we'll just keep the current status
        } else if (action === 'start_enable') {
          newProcessData.pcs[uuid].processes[processName].status = true;
          newProcessData.pcs[uuid].processes[processName].boot = true;
        } else if (action === 'stop_disable') {
          newProcessData.pcs[uuid].processes[processName].status = false;
          newProcessData.pcs[uuid].processes[processName].boot = false;
        }
        setProcessData(newProcessData);
        
        // Update selected computer if it's currently shown
        if (selectedComputer && selectedComputer.uuid === uuid) {
          setSelectedComputer(newProcessData.pcs[uuid]);
        }
      }
      
      // Mock API call
      const response = await fetch(`/api/process/action/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Uuid: uuid, Process: processName })
      });

      toast({
        title: "操作完成",
        description: `${action} 操作已發送至 ${processName} (${uuid})`,
      });
    } catch (error) {
      toast({
        title: "錯誤",
        description: "操作執行失敗",
        variant: "destructive",
      });
    }
  };

  const filteredComputers = processData ? Object.entries(processData.pcs).filter(([uuid, computer]) =>
    computer.hostname.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const getComputerStats = (computer: Computer) => {
    const total = Object.keys(computer.processes).length;
    const running = Object.values(computer.processes).filter(p => p.status).length;
    const stopped = total - running;
    return { total, running, stopped };
  };

  const filteredProcesses = selectedComputer ? 
    Object.entries(selectedComputer.processes).filter(([processName]) =>
      processName.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 animate-spin" />
          <span>載入程序資料中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder={selectedComputer ? "搜尋程序..." : "搜尋電腦..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              {selectedComputer ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedComputer(null)}
                    className="flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>返回</span>
                  </Button>
                  <Monitor className="w-5 h-5" />
                  <span>{selectedComputer.hostname}</span>
                  <Badge variant="secondary">{selectedComputer.uuid}</Badge>
                </>
              ) : (
                <>
                  <Monitor className="w-5 h-5" />
                  <span>電腦列表</span>
                  <Badge variant="secondary">{processData?.length || 0} 台電腦</Badge>
                </>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {!selectedComputer ? (
              // Computer List View
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredComputers.map(([uuid, computer]) => {
                  const stats = getComputerStats(computer);
                  return (
                    <Card key={uuid} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Monitor className="w-5 h-5" />
                            <div>
                              <div className="font-semibold text-sm">{computer.hostname}</div>
                              <div className="text-xs text-gray-500">{uuid}</div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </CardHeader>
                      <CardContent 
                        className="pt-0 cursor-pointer"
                        onClick={() => setSelectedComputer(computer)}
                      >
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 bg-gray-50 rounded">
                            <div className="text-lg font-bold">{stats.total}</div>
                            <div className="text-xs text-gray-500">總程序</div>
                          </div>
                          <div className="p-2 bg-green-50 rounded">
                            <div className="text-lg font-bold text-green-600">{stats.running}</div>
                            <div className="text-xs text-gray-500">運行中</div>
                          </div>
                          <div className="p-2 bg-red-50 rounded">
                            <div className="text-lg font-bold text-red-600">{stats.stopped}</div>
                            <div className="text-xs text-gray-500">已停止</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              // Process List View for Selected Computer
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold">{Object.keys(selectedComputer.processes).length}</div>
                    <div className="text-sm text-gray-500">總程序數</div>
                  </Card>
                  <Card className="p-4 text-center bg-green-50">
                    <div className="text-2xl font-bold text-green-600">
                      {Object.values(selectedComputer.processes).filter(p => p.status).length}
                    </div>
                    <div className="text-sm text-gray-500">運行中</div>
                  </Card>
                  <Card className="p-4 text-center bg-red-50">
                    <div className="text-2xl font-bold text-red-600">
                      {Object.values(selectedComputer.processes).filter(p => !p.status).length}
                    </div>
                    <div className="text-sm text-gray-500">已停止</div>
                  </Card>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>程序名稱</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead>開機時自動啟動</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProcesses.map(([processName, process]) => (
                      <TableRow key={processName}>
                        <TableCell className="font-medium">{processName}</TableCell>
                        <TableCell>
                          <Badge variant={process.status ? "default" : "secondary"}>
                            {process.status ? "運行中" : "已停止"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {process.boot ? (
                            <Badge variant="outline" className="text-green-600">已啟用</Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">未啟用</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            {!process.status ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleProcessAction('start', selectedComputer.uuid, processName)}
                                  className="h-8 px-3"
                                >
                                  <Play className="w-3 h-3 mr-1" />
                                  啟動
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleProcessAction('start_enable', selectedComputer.uuid, processName)}
                                  className="h-8 px-3"
                                >
                                  <PlayCircle className="w-3 h-3 mr-1" />
                                  啟動並開機啟動
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleProcessAction('stop', selectedComputer.uuid, processName)}
                                className="h-8 px-3"
                              >
                                <Square className="w-3 h-3 mr-1" />
                                停止
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleProcessAction('restart', selectedComputer.uuid, processName)}
                              className="h-8 px-3"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              重啟
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};