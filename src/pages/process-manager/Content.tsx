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
  StopCircle,
  Monitor,
  Activity,
  Search,
  ArrowLeft,
  ChevronRight,
  Pin
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
import axios from 'axios';
// 從 types.ts 引入型別
import type { GetAllProcessResponse, PostActionRequest, PostActionResponse, PostOneProcessRequest, PostOneProcessResponse } from './types';

interface Process {
  Status: boolean;
  Boot: boolean;
}

interface Computer {
  uuid: string;
  hostname: string;
  processes: Record<string, Process>;
  length: number;
}

// interface ProcessData {
//   pcs: Record<string, Computer>;
//   length: number;
// }

// 模擬資料（保留作為 fallback）
// const mockData: { pcs: Record<string, Computer>; length: number } = {
//   pcs: {
//     'PC-001': {
//       uuid: 'PC-001',
//       hostname: 'Workstation-01',
//       length: 5,
//       processes: {
//         'chrome.exe': { Status: true, Boot: true },
//         'explorer.exe': { Status: true, Boot: true },
//         'notepad.exe': { Status: false, Boot: false },
//         'discord.exe': { Status: true, Boot: true },
//         'vscode.exe': { Status: false, Boot: true },
//       }
//     },
//     'PC-002': {
//       uuid: 'PC-002',
//       hostname: 'Workstation-02',
//       length: 4,
//       processes: {
//         'chrome.exe': { Status: true, Boot: true },
//         'explorer.exe': { Status: false, Boot: true },
//         'notepad.exe': { Status: false, Boot: false },
//         'zoom.exe': { Status: true, Boot: true },
//       }
//     },
//   },
//   length: 2
// };

export const ProcessManager = () => {
  const [processData, setProcessData] = useState<{ pcs: Record<string, Computer>; length: number } | null>(null);
  const [selectedComputer, setSelectedComputer] = useState<Computer | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pinnedProcesses, setPinnedProcesses] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // 取得所有電腦 Process
  const fetchAllProcesses = async () => {
    setLoading(true);
    try {
      const res = await axios.get<GetAllProcessResponse>('/api/process/all');
      const data = res.data;

      const pcs: Record<string, Computer> = {};
      pcs[data.Hostname] = {
        uuid: data.Hostname, // 假設 hostname 當 uuid
        hostname: data.Hostname,
        processes: {
          [data.Hostname]: {
            Status: data.Status,
            Boot: data.Boot
          }
        },
        length: data.Length
      };

      setProcessData({ pcs, length: data.Length });
    } catch (err) {
      console.error('Failed to fetch process data:', err);
      toast({ title: "Error", description: "Failed to fetch process data", variant: "destructive" });
      setProcessData(null);
    } finally {
      setLoading(false);
    }
  };

  // 取得單一電腦的 Process
  const fetchOneComputerProcesses = async (uuid: string) => {
    try {
      const reqData: PostOneProcessRequest  = { Uuid: uuid };
      const res = await axios.post<PostOneProcessResponse>('/api/process/one', reqData);
      const data = res.data;

      if (processData) {
        const newProcessData = { ...processData };
        if (newProcessData.pcs[uuid]) {
          newProcessData.pcs[uuid].processes[uuid] = {
            Status: data.Status,
            Boot: data.Boot
          };
          setProcessData(newProcessData);

          if (selectedComputer && selectedComputer.uuid === uuid) {
            setSelectedComputer(newProcessData.pcs[uuid]);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch single computer processes:", err);
      toast({
        title: "Error",
        description: "Failed to fetch computer processes",
        variant: "destructive"
      });
    }
  };

  // 處理 Process 行為
  const handleProcessAction = async (action: string, uuid: string, processName: string) => {
    try {
      const apiMap: Record<string, string> = {
        start: '/api/process/action/start',
        stop: '/api/process/action/stop',
        restart: '/api/process/action/restart',
        start_enable: '/api/process/action/start_enable',
        stop_disable: '/api/process/action/stop_disable',
        enable: '/api/process/action/enable',
        disable: '/api/process/action/disable'
      };
      const url = apiMap[action];
      if (!url) throw new Error(`Unknown action: ${action}`);

      // **先更新本地狀態，假設 API 成功**
      if (processData) {
        const newProcessData = { ...processData };
        const process = newProcessData.pcs[uuid].processes[processName];

        if (action === 'start') process.Status = true;
        else if (action === 'stop') process.Status = false;
        else if (action === 'start_enable') process.Boot = true;
        else if (action === 'stop_disable') process.Boot = false;

        setProcessData(newProcessData);
        if (selectedComputer && selectedComputer.uuid === uuid) {
          setSelectedComputer(newProcessData.pcs[uuid]);
        }
      }

      // 實際呼叫 API
      const reqData: PostActionRequest = { Uuid: uuid, Process: processName };
      const res = await axios.post<PostActionResponse>(url, reqData);

      if (res.data.Type === 'Ok') {
        toast({ title: "Action Completed", description: `${action} sent to ${processName}` });
      } else {
        toast({ title: "Error", description: res.data.Message, variant: "destructive" });
      }
    } catch (error) {
      console.error('API action failed', error);
      toast({ title: "Error", description: "Failed to perform action", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchAllProcesses();
  }, []);

  const filteredComputers = processData ? Object.entries(processData.pcs).filter(([, computer]) =>
    computer.hostname?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const getComputerStats = (computer: Computer) => {
    const total = Object.keys(computer.processes).length;
    const running = Object.values(computer.processes).filter(p => p.Status).length;
    const stopped = total - running;
    return { total, running, stopped };
  };

  const handleTogglePin = (processName: string) => {
    const newPinnedProcesses = new Set(pinnedProcesses);
    if (newPinnedProcesses.has(processName)) newPinnedProcesses.delete(processName);
    else newPinnedProcesses.add(processName);
    setPinnedProcesses(newPinnedProcesses);
  };

  const filteredProcesses = selectedComputer ? 
    Object.entries(selectedComputer.processes).filter(([processName]) => {
      const matchesSearch = searchTerm.trim() ? 
        processName.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      return matchesSearch;
    }).sort(([a], [b]) => {
      const aPinned = pinnedProcesses.has(a);
      const bPinned = pinnedProcesses.has(b);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return a.localeCompare(b);
    }) : [];

  const displayProcesses = selectedComputer ? filteredProcesses : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 animate-spin" />
          <span>Loading process data...</span>
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
              placeholder={selectedComputer ? "Search processes..." : "Search computers..."}
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
                    onClick={() => {
                      setSelectedComputer(null);
                      setSearchTerm('');
                    }}
                    className="flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </Button>
                  <Monitor className="w-5 h-5" />
                  <span>{selectedComputer.hostname}</span>
                  <Badge variant="secondary">{selectedComputer.uuid}</Badge>
                </>
              ) : (
                <>
                  <Monitor className="w-5 h-5" />
                  <span>Computer List</span>
                  <Badge variant="secondary">{processData?.length || 0} computers</Badge>
                </>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {!selectedComputer ? (
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
                        onClick={() => {
                          setSelectedComputer(computer);
                          fetchOneComputerProcesses(computer.uuid);
                        }}
                      >
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 bg-gray-50 rounded">
                            <div className="text-lg font-bold">{stats.total}</div>
                            <div className="text-xs text-gray-500">Total</div>
                          </div>
                          <div className="p-2 bg-green-50 rounded">
                            <div className="text-lg font-bold text-green-600">{stats.running}</div>
                            <div className="text-xs text-gray-500">Running</div>
                          </div>
                          <div className="p-2 bg-red-50 rounded">
                            <div className="text-lg font-bold text-red-600">{stats.stopped}</div>
                            <div className="text-xs text-gray-500">Stopped</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold">{Object.keys(selectedComputer.processes).length}</div>
                    <div className="text-sm text-gray-500">Total Processes</div>
                  </Card>
                  <Card className="p-4 text-center bg-green-50">
                    <div className="text-2xl font-bold text-green-600">
                      {Object.values(selectedComputer.processes).filter(p => p.Status).length}
                    </div>
                    <div className="text-sm text-gray-500">Running</div>
                  </Card>
                  <Card className="p-4 text-center bg-red-50">
                    <div className="text-2xl font-bold text-red-600">
                      {Object.values(selectedComputer.processes).filter(p => !p.Status).length}
                    </div>
                    <div className="text-sm text-gray-500">Stopped</div>
                  </Card>
                </div>

                {displayProcesses.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Filter</TableHead>
                        <TableHead className='w-3xl'>Process Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Boot</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayProcesses.map(([processName, process]) => (
                        <TableRow key={processName}>
                          <TableCell>
                            <Button
                              size="sm"
                              variant={pinnedProcesses.has(processName) ? "default" : "outline"}
                              onClick={() => handleTogglePin(processName)}
                              className="h-8 w-8 p-0"
                            >
                              <Pin className={`w-3 h-3 ${pinnedProcesses.has(processName) ? 'fill-current' : ''}`} />
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <span>{processName}</span>
                              {pinnedProcesses.has(processName) && (
                                <Badge variant="outline" className="text-xs">Pinned</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={process.Status ? "default" : "secondary"}>
                              {process.Status ? "Running" : "Stopped"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {process.Boot ? (
                              <Badge variant="outline" className="text-green-600">Enabled</Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-500">Disabled</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              {!process.Status ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleProcessAction('start', selectedComputer.uuid, processName)}
                                  className="h-8 px-3"
                                >
                                  <Play className="w-3 h-3 mr-1" />
                                  Start
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleProcessAction('stop', selectedComputer.uuid, processName)}
                                  className="h-8 px-3"
                                >
                                  <Square className="w-3 h-3 mr-1" />
                                  Stop
                                </Button>
                              )}
                              {!process.Boot ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleProcessAction('start_enable', selectedComputer.uuid, processName)}
                                  className="h-8 px-3"
                                >
                                  <PlayCircle className="w-3 h-3 mr-1" />
                                  Enable Boot
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleProcessAction('stop_disable', selectedComputer.uuid, processName)}
                                  className="h-8 px-3"
                                >
                                  <StopCircle className="w-3 h-3 mr-1" />
                                  Disable Boot
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleProcessAction('restart', selectedComputer.uuid, processName)}
                                className="h-8 px-3"
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Restart
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {!searchTerm.trim() ? (
                      <div>
                        <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">Enter process name to search</p>
                        <p className="text-sm">Processes are displayed only when searching</p>
                      </div>
                    ) : (
                      <div>
                        <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium">No matching processes found</p>
                        <p className="text-sm">No process contains "{searchTerm}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
