import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Search, Filter, Download, ChevronDown, ChevronRight, Server } from 'lucide-react';
import axios from 'axios';
import type { GetAllPcLogsResponse, GetPcLogsResponse, PcLogs } from './types';

// interface LogEntry {
//   id: string;
//   Month: string;
//   Day: number;
//   Time: string;
//   Hostname: string;
//   Type: 'SYSTEM' | 'WARNING' | 'ERROR' | 'INFO';
//   Messages: string;
// }

interface PcEntry {
  uuid: string;
}

// -------------------- Component --------------------
export const HostLogsManager = () => {
  const [pcs, setPcs] = useState<PcEntry[]>([]);
  const [selectedPc, setSelectedPc] = useState('');
  const [logs, setLogs] = useState<PcLogs>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // const [filterValues, ] = useState({ month: '', timeRange: '', type: '' });
  // const [filterEnabled, ] = useState({ month: false, date: false, timeRange: false, type: false });
  // const [selectedDate, ] = useState<Date>();

  // -------------------- Helper --------------------
  // const getMonthName = (monthNumber: string) => {
  //   const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  //   return months[parseInt(monthNumber)-1];
  // };

  // const checkTimeRange = (time: string, range: string) => {
  //   const hour = parseInt(time.split(':')[0]);
  //   switch(range){
  //     case 'morning': return hour >=6 && hour<12;
  //     case 'afternoon': return hour>=12 && hour<18;
  //     case 'evening': return hour>=18 && hour<24;
  //     case 'night': return hour>=0 && hour<6;
  //     default: return true;
  //   }
  // };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'SYSTEM':
        return 'default';
      case 'WARNING':
        return 'destructive';
      case 'ERROR':
        return 'destructive';
      case 'INFO':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // const applyFilter = (key: string, value: string) => {
  //   setFilterValues(prev => ({ ...prev, [key]: value }));
  // };

  // const clearFilters = () => {
  //   setFilterValues({ month: '', timeRange: '', type: '' });
  //   setFilterEnabled({ month: false, date: false, timeRange: false, type: false });
  //   setSelectedDate(undefined);
  // };

  // -------------------- API --------------------
  const fetchPcs = async () => {
    try {
      const { data } = await axios.get<GetAllPcLogsResponse>('/api/logs/pc/all');

      if (data && data.Uuid) {
        const pcsData: PcEntry[] = Object.entries(data).map(([uuid]) => ({ uuid }));
        setPcs(pcsData);
      }
    } catch (err) {
      console.error('Failed to fetch PCs:', err);
      setPcs([]);
    }
  };

  //TODO:reduce GPT
  const fetchLogs = async (uuid: string) => {
    if (!uuid) return;
    try {
      const { data } = await axios.get<GetPcLogsResponse>(`/api/logs/pc?Uuid=${uuid}`);

      if (data && data.Logs && typeof data.Logs === 'object') {
        const logsData: PcLogs = Object.keys(data.Logs).reduce((acc, id) => {
          const log = data.Logs[id];
          acc[id] = {
            Month: log.Month,
            Day: log.Day,
            Time: log.Time,
            Hostname: log.Hostname,
            Type: log.Type,
            Messages: log.Messages,
          };
          return acc;
        }, {} as PcLogs);

        setLogs(logsData);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setLogs({});
    }
  };

  useEffect(() => {
    fetchPcs();
  }, []);
  useEffect(() => {
    fetchLogs(selectedPc);
  }, [selectedPc]);

  // -------------------- 操作邏輯 --------------------
  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs((prev) =>
      prev.includes(logId) ? prev.filter((id) => id !== logId) : [...prev, logId],
    );
  };

  const toggleLogSelection = (logId: string) => {
    setSelectedLogs((prev) =>
      prev.includes(logId) ? prev.filter((id) => id !== logId) : [...prev, logId],
    );
  };

  const selectAllLogs = () => {
    const logIds = Object.keys(logs); // 取得所有 log 的 id
    if (selectedLogs.length === logIds.length) {
      setSelectedLogs([]); // 若已全選，則清空
    } else {
      setSelectedLogs(logIds); // 否則全選
    }
  };

  // -------------------- JSX --------------------
  return (
    <div className='space-y-4 p-4'>
      {/* PC 選擇 */}
      <div className='flex items-center space-x-4 p-4 bg-muted/50 rounded-lg'>
        <Server className='h-5 w-5' />
        <span className='text-sm font-medium'>Select PC:</span>
        <Select value={selectedPc} onValueChange={setSelectedPc}>
          <SelectTrigger className='w-48 border rounded-md px-3 py-2 bg-white text-gray-700'>
            <SelectValue placeholder='Please select a PC' />
          </SelectTrigger>
          <SelectContent>
            {pcs.map((pc) => (
              <SelectItem key={pc.uuid} value={pc.uuid}>
                {pc.uuid}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPc && (
        <>
          {/* 搜尋 / Filter / Export */}
          <div className='flex space-x-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
              <Input
                placeholder='Search logs...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            <Button
              variant='outline'
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className='flex items-center space-x-2'
            >
              <Filter className='h-4 w-4' />
              <span>Filter</span>
            </Button>
            <Button style={{ backgroundColor: '#7B86AA' }} className='hover:opacity-90 text-white'>
              <Download className='h-4 w-4' />
              <span>
                {selectedLogs.length > 0 ? `Export (${selectedLogs.length})` : 'Export (All)'}
              </span>
            </Button>
          </div>

          {/* Collapsible Advanced Filter */}
          <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <CollapsibleContent className='space-y-4 p-4 border rounded-lg bg-muted/50'>
              <h3 className='font-medium text-sm'>Advanced Filters</h3>
              {/* Month / Time / Type 可擴充區 */}
            </CollapsibleContent>
          </Collapsible>

          {/* Logs Table */}
          <div className='border rounded-lg text-xs'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>
                    <Checkbox
                      checked={selectedLogs.length === Object.keys(logs).length}
                      onCheckedChange={selectAllLogs}
                    />
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell>Month</TableCell>
                  <TableCell>Day</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Hostname</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Messages</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(logs)
                  .filter(([_, log]) =>
                    log.Messages.toLowerCase().includes(searchTerm.toLowerCase()),
                  )
                  .map(([id, log]) => (
                    <React.Fragment key={id}>
                      <TableRow className='hover:bg-muted/50'>
                        <TableCell>
                          <Checkbox
                            checked={selectedLogs.includes(id)}
                            onCheckedChange={() => toggleLogSelection(id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => toggleLogExpansion(id)}
                            className='h-8 w-8 p-0'
                          >
                            {expandedLogs.includes(id) ? (
                              <ChevronDown className='h-4 w-4' />
                            ) : (
                              <ChevronRight className='h-4 w-4' />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>{log.Month}</TableCell>
                        <TableCell>{log.Day}</TableCell>
                        <TableCell>{String(log.Time)}</TableCell>
                        <TableCell>{log.Hostname}</TableCell>
                        <TableCell>
                          <Badge variant={getTypeVariant(log.Type)}>{log.Type}</Badge>
                        </TableCell>
                        <TableCell className='max-w-md truncate'>{log.Messages}</TableCell>
                      </TableRow>

                      {expandedLogs.includes(id) && (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className='bg-muted/30 p-4 text-xs break-words max-h-[200px] overflow-y-auto'
                          >
                            {log.Messages}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};
