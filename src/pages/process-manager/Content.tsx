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

// 模擬資料
const mockData: ProcessData = {
  pcs: {
    'PC-001': {
      uuid: 'PC-001',
      hostname: 'Workstation-01',
      length: 5,
      processes: {
        'chrome.exe': { status: true, boot: true },
        'explorer.exe': { status: true, boot: true },
        'notepad.exe': { status: false, boot: false },
        'discord.exe': { status: true, boot: true },
        'vscode.exe': { status: false, boot: true },
      }
    },
    'PC-002': {
      uuid: 'PC-002',
      hostname: 'Workstation-02',
      length: 4,
      processes: {
        'chrome.exe': { status: true, boot: true },
        'explorer.exe': { status: false, boot: true },
        'notepad.exe': { status: false, boot: false },
        'zoom.exe': { status: true, boot: true },
      }
    },
  },
  length: 2
};

export const ProcessManager = () => {
  const [processData, setProcessData] = useState<ProcessData | null>(mockData);
  const [selectedComputer, setSelectedComputer] = useState<Computer | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pinnedProcesses, setPinnedProcesses] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // 取得所有電腦 Process
  const fetchAllProcesses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/process/all');
      if (!res.ok) throw new Error('API fetch failed');
      const data = await res.json();

      const pcs: Record<string, Computer> = {};
      Object.entries(data.Pcs).forEach(([uuid, pc]: any) => {
        pcs[uuid] = {
          uuid,
          hostname: pc.Hostname,
          processes: Object.fromEntries(
            Object.entries(pc.Process).map(([name, p]: any) => [
              name,
              { status: p.Status, boot: p.Boot }
            ])
          ),
          length: pc.Length
        };
      });

      setProcessData({ pcs, length: data.Length });
    } catch (err) {
      console.warn('Using mock data due to API error:', err);
      toast({ title: "Notice", description: "Using mock data", variant: "default" });
      setProcessData(mockData); // 使用模擬資料
    } finally {
      setLoading(false);
    }
  };

  // 取得單一電腦的 Process
  const fetchOneComputerProcesses = async (uuid: string) => {
    try {
      const res = await fetch('/api/process/one', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Uuid: uuid })
      });
      if (!res.ok) throw new Error('API fetch failed');
      const data = await res.json();
      if (processData) {
        const newProcessData = { ...processData };
        newProcessData.pcs[uuid].processes = Object.fromEntries(
          Object.entries(data.Process).map(([name, p]: any) => [name, { status: p.Status, boot: p.Boot }])
        );
        setProcessData(newProcessData);

        if (selectedComputer && selectedComputer.uuid === uuid) {
          setSelectedComputer(newProcessData.pcs[uuid]);
        }
      }
    } catch (err) {
      console.warn('Using existing data/mock data due to API error:', err);
      toast({ title: "Notice", description: "Failed to fetch computer processes, using mock/existing data", variant: "default" });
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

        if (action === 'start') process.status = true;
        else if (action === 'stop') process.status = false;
        else if (action === 'start_enable') process.boot = true;
        else if (action === 'stop_disable') process.boot = false;

        setProcessData(newProcessData);
        if (selectedComputer && selectedComputer.uuid === uuid) {
          setSelectedComputer(newProcessData.pcs[uuid]);
        }
      }

      // 實際呼叫 API
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Uuid: uuid, Process: processName })
      });
      if (!res.ok) throw new Error('API action failed');
      const result = await res.json();

      if (result.Type === 'OK') {
        toast({ title: "Action Completed", description: `${action} sent to ${processName}` });
      } else {
        toast({ title: "Error", description: result.Message, variant: "destructive" });
      }
    } catch (error) {
      console.warn('API failed, local state may be inconsistent', error);
      toast({ title: "Notice", description: "Action simulated with mock data", variant: "default" });
    }
  };

  useEffect(() => {
    fetchAllProcesses();
  }, []);

  const filteredComputers = processData ? Object.entries(processData.pcs).filter(([, computer]) =>
    computer.hostname.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const getComputerStats = (computer: Computer) => {
    const total = Object.keys(computer.processes).length;
    const running = Object.values(computer.processes).filter(p => p.status).length;
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
                      {Object.values(selectedComputer.processes).filter(p => p.status).length}
                    </div>
                    <div className="text-sm text-gray-500">Running</div>
                  </Card>
                  <Card className="p-4 text-center bg-red-50">
                    <div className="text-2xl font-bold text-red-600">
                      {Object.values(selectedComputer.processes).filter(p => !p.status).length}
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
                            <Badge variant={process.status ? "default" : "secondary"}>
                              {process.status ? "Running" : "Stopped"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {process.boot ? (
                              <Badge variant="outline" className="text-green-600">Enabled</Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-500">Disabled</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              {!process.status ? (
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
                              {!process.boot ? (
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
