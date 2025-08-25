import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, RefreshCw, Download, ChevronDown, ChevronRight, X, Server, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  date: string;
  time: string;
  hostName: string;
  type: 'SYSTEM' | 'WARNING' | 'ERROR' | 'INFO';
  message: string;
  fullMessage: string;
}

const mockHosts = [
  { id: 'server-001', name: 'SERVER-001' },
  { id: 'server-002', name: 'SERVER-002' },
  { id: 'server-003', name: 'SERVER-003' }
];

const mockHostLogs: LogEntry[] = [
  {
    id: '1',
    date: 'December 24',
    time: '14:30:15',
    hostName: 'SERVER-001',
    type: 'SYSTEM',
    message: 'System startup completed successfully. All core services...',
    fullMessage: 'System startup completed successfully. All core services initialized and ready to accept connections. Boot time: 45 seconds, all health checks passed.'
  },
  {
    id: '2', 
    date: 'December 24',
    time: '14:25:30',
    hostName: 'SERVER-001',
    type: 'WARNING',
    message: 'High memory usage detected on server SERVER-001. Cur...',
    fullMessage: 'High memory usage detected on server SERVER-001. Current usage: 85% of available RAM (6.8GB/8GB). Consider scaling resources or optimizing running processes.'
  },
  {
    id: '3',
    date: 'December 23',
    time: '23:45:12',
    hostName: 'SERVER-001',
    type: 'INFO',
    message: 'Automated backup completed successfully on SERVER-0...',
    fullMessage: 'Automated backup completed successfully on SERVER-001. Total size: 2.3GB, Duration: 15 minutes, Destination: /backup/daily/2024-12-23'
  },
  {
    id: '4',
    date: 'December 23',
    time: '19:30:42',
    hostName: 'SERVER-001',
    type: 'INFO',
    message: 'Load balancer configuration updated on SERVER-001. Tra...',
    fullMessage: 'Load balancer configuration updated on SERVER-001. Traffic distribution adjusted for optimal performance across 3 backend servers.'
  }
];

export const HostLogsManager = () => {
  const [selectedHost, setSelectedHost] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [filterValues, setFilterValues] = useState({
    month: '',
    date: '',
    timeRange: '',
    type: ''
  });

  const getMonthName = (monthNumber: string) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[parseInt(monthNumber) - 1];
  };

  const checkTimeRange = (time: string, range: string) => {
    const hour = parseInt(time.split(':')[0]);
    switch (range) {
      case 'morning': return hour >= 6 && hour < 12;
      case 'afternoon': return hour >= 12 && hour < 18;
      case 'evening': return hour >= 18 && hour < 24;
      case 'night': return hour >= 0 && hour < 6;
      default: return true;
    }
  };

  const filteredLogs = selectedHost 
    ? mockHostLogs.filter(log => {
        // Host filter
        const hostMatch = log.hostName === selectedHost;

        // Search term filter
        const searchMatch = !searchTerm || 
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.fullMessage.toLowerCase().includes(searchTerm.toLowerCase());

        // Month filter
        const monthMatch = !filterValues.month || 
          log.date.includes(getMonthName(filterValues.month));

        // Date filter
        const dateMatch = !selectedDate || 
          log.date.includes(selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }));

        // Time range filter
        const timeMatch = !filterValues.timeRange || 
          checkTimeRange(log.time, filterValues.timeRange);

        // Type filter
        const typeMatch = !filterValues.type || log.type === filterValues.type;

        return hostMatch && searchMatch && monthMatch && dateMatch && timeMatch && typeMatch;
      })
    : [];

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs(prev =>
      prev.includes(logId)
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  const toggleLogSelection = (logId: string) => {
    setSelectedLogs(prev =>
      prev.includes(logId)
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  const selectAllLogs = () => {
    if (selectedLogs.length === filteredLogs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(filteredLogs.map(log => log.id));
    }
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'SYSTEM': return 'default';
      case 'WARNING': return 'destructive';
      case 'ERROR': return 'destructive';
      case 'INFO': return 'secondary';
      default: return 'default';
    }
  };

  const applyFilter = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    if (value && !appliedFilters.includes(`${key}: ${value}`)) {
      setAppliedFilters(prev => [...prev, `${key}: ${value}`]);
    }
  };

  const clearAllFilters = () => {
    setAppliedFilters([]);
    setFilterValues({
      month: '',
      date: '',
      timeRange: '',
      type: ''
    });
    setFilterEnabled({
      month: false,
      date: false,
      timeRange: false,
      type: false
    });
    // setSelectedLogs([]); // 若有勾選項也清除
  };

  const [filterEnabled, setFilterEnabled] = useState({
      month: false,
      date: false,
      timeRange: false,
      type: false,
    });

  if (!selectedHost) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Server className="h-16 w-16 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium">請先選擇要查詢的主機</h3>
          <p className="text-sm text-muted-foreground">從上方的主機選單中選擇要查看日誌的主機</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">選擇主機:</label>
          <Select value={selectedHost} onValueChange={setSelectedHost}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="請選擇要查詢的主機" />
            </SelectTrigger>
            <SelectContent>
              {mockHosts.map((host) => (
                <SelectItem key={host.id} value={host.name}>
                  {host.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Host Selection */}
      <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
        <Server className="h-5 w-5" />
        <span className="text-sm font-medium">選擇主機:</span>
        <Select value={selectedHost} onValueChange={setSelectedHost}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="請選擇要查詢的主機" />
          </SelectTrigger>
          <SelectContent>
            {mockHosts.map((host) => (
              <SelectItem key={host.id} value={host.name}>
                {host.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search and Controls */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="搜尋 host logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>篩選條件</span>
        </Button>
        <Button variant="outline" className="flex items-center space-x-2">
          <Search className="h-4 w-4" />
          <span>查詢</span>
        </Button>
        <Button variant="outline" className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4" />
          <span>重新整理</span>
        </Button>
        {selectedLogs.length > 0 ? (
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>匯出 ({selectedLogs.length})</span>
          </Button>
        ) : (
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>匯出 (全部)</span>
          </Button>
        )}
      </div>

      {/* Results count and applied filters */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          已選擇: {selectedLogs.length} 筆
        </span>
        <div className="flex items-center space-x-2">
          {appliedFilters.length > 0 && (
            <>
              <span className="text-sm text-muted-foreground">已套用篩選條件</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                清除全部
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Collapsible Filter Section */}
      <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <CollapsibleContent className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium text-sm">進階篩選</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      
                  {/* 月份 */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={filterEnabled.month}
                        onCheckedChange={(checked) => {
                          setFilterEnabled(prev => ({ ...prev, month: checked === true }));
                          if (checked !== true) applyFilter('month', '');
                        }}
                      />
                      <label className="text-sm">月份</label>
                    </div>
                    <Select
                      value={filterValues.month}
                      onValueChange={(value) => {
                        applyFilter('month', value);
                        setFilterEnabled(prev => ({ ...prev, month: true }));
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="先勾選啟用" /></SelectTrigger>
                      <SelectContent>
                        {[...Array(12)].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}月</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
      
                  {/* 日期 */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={filterEnabled.date}
                        onCheckedChange={(checked) => {
                          setFilterEnabled(prev => ({ ...prev, date: checked === true }));
                          if (checked !== true) {
                            setSelectedDate(undefined); // 取消勾選後清空欄位
                            applyFilter('date', '');
                          }
                        }}
                      />
                      <label className="text-sm">日期</label>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-auto justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                          onClick={() => setFilterEnabled(prev => ({ ...prev, date: true }))}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>先勾選啟用</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            setFilterEnabled(prev => ({ ...prev, date: true }));
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        /> 
                        {/*TODO: 有bug 只選日期不會顯示清除全部 且清除全部日期不會被清除*/}
                      </PopoverContent>
                    </Popover>
                  </div>
      
                  {/* 時間範圍 */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={filterEnabled.timeRange}
                        onCheckedChange={(checked) => {
                          setFilterEnabled(prev => ({ ...prev, timeRange: checked === true }));
                          if (checked !== true) applyFilter('timeRange', '');
                        }}
                      />
                      <label className="text-sm">時間範圍</label>
                    </div>
                    <Select
                      value={filterValues.timeRange}
                      onValueChange={(value) => {
                        applyFilter('timeRange', value);
                        setFilterEnabled(prev => ({ ...prev, timeRange: true }));
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="先勾選啟用" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (06:00-12:00)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12:00-18:00)</SelectItem>
                        <SelectItem value="evening">Evening (18:00-24:00)</SelectItem>
                        <SelectItem value="night">Night (00:00-06:00)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>                  
                </div>
      
                {/* 類型 */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={filterEnabled.type}
                      onCheckedChange={(checked) => {
                        setFilterEnabled(prev => ({ ...prev, type: checked === true }));
                        if (checked !== true) applyFilter('type', '');
                      }}
                    />
                    <label className="text-sm">類型</label>
                  </div>
                  <Select
                    value={filterValues.type}
                    onValueChange={(value) => {
                      applyFilter('type', value);
                      setFilterEnabled(prev => ({ ...prev, type: true }));
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="先勾選啟用" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SYSTEM">SYSTEM</SelectItem>
                      <SelectItem value="WARNING">WARNING</SelectItem>
                      <SelectItem value="ERROR">ERROR</SelectItem>
                      <SelectItem value="INFO">INFO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CollapsibleContent>
            </Collapsible>

      {/* Logs Table */}
      <div className="border rounded-lg">
        <div className="p-4 border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Host Logs ({filteredLogs.length})</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedLogs.length === filteredLogs.length && filteredLogs.length > 0}
                onCheckedChange={selectAllLogs}
              />
              <span className="text-sm">全選</span>
              <span className="text-sm text-muted-foreground">總共: {filteredLogs.length} 筆</span>
            </div>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">選擇</TableHead>
              <TableHead className="w-12"></TableHead>
              <TableHead>日期</TableHead>
              <TableHead>時間</TableHead>
              <TableHead>主機名稱</TableHead>
              <TableHead>類型</TableHead>
              <TableHead>訊息</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <React.Fragment key={log.id}>
                <TableRow className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedLogs.includes(log.id)}
                      onCheckedChange={() => toggleLogSelection(log.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLogExpansion(log.id)}
                      className="h-8 w-8 p-0"
                    >
                      {expandedLogs.includes(log.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>{log.date}</TableCell>
                  <TableCell>{log.time}</TableCell>
                  <TableCell>{log.hostName}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeVariant(log.type)}>{log.type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate">{log.message}</TableCell>
                </TableRow>
                {expandedLogs.includes(log.id) && (
                  <TableRow>
                    <TableCell colSpan={7} className="bg-muted/30 p-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">完整訊息:</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {log.fullMessage}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};