import StatusCard from './MyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Check, AlertTriangle, X, ChevronLeft, Minus } from 'lucide-react';
import { SiApache, SiNginx, SiFilezilla } from 'react-icons/si';
import { FaGlobe } from 'react-icons/fa';
import { LuIdCard } from 'react-icons/lu';
import { TbNetwork, TbBrandMysql, TbFolders } from 'react-icons/tb';
import { GiSquid } from 'react-icons/gi';
import { IoTerminal } from 'react-icons/io5';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getInstalled,
  getNoinstall,
  getInfoAll,
  postInfoGet,
  type InfoGetRequest,
  type PcMetrics,
  type Target,
} from '@/api/openapi-client';

const ITEMS_PER_PAGE = 3;
type ServiceName = 'Apache';
type ServiceStatusValue = 'active' | 'stopped' | 'uninstalled';
type ServiceStatusEntry = { Hostname: string; Status: ServiceStatusValue };
type ServicesStatusState = Record<ServiceName, ServiceStatusEntry[]>;
const SERVICE_QUERY_MAP: Record<ServiceName, string> = { Apache: 'apache' };
const SERVICE_NAMES: ServiceName[] = ['Apache'];
const normalizeServiceStatus = (status?: string | null): ServiceStatusValue => {
  const normalized = typeof status === 'string' ? status.toLowerCase() : '';
  if (normalized === 'active') return 'active';
  if (normalized === 'stopped') return 'stopped';
  return 'uninstalled';
};

export function DashboardContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<'safe' | 'warning' | 'danger' | null>(null);

  // const [servicestatus, setServiceStatus] = useState<string[][]>([]);
  // {
  //   Apache: [
  //     {
  //       Hostname: 'host-11111';
  //       Status: 'active' | 'stopped' | 'uninstalled';
  //     },...
  //   ],
  //   Nginx: [
  //     {
  //       Hostname: 'host-11111';
  //       Status: 'active' | 'stopped' | 'uninstalled';
  //     },...
  //   ]
  // };
  // server狀態
  const [servicesStatus, setServicesStatus] = useState<ServicesStatusState>({
    Apache: [],
  });

  // 圖表資料
  const [cpuData, setCpuData] = useState<{ time: string; value: number }[]>([]);
  const [memoryData, setMemoryData] = useState<{ time: string; value: number }[]>([]);
  const [diskData, setDiskData] = useState(0);

  // 電腦列表
  const [computers, setComputers] = useState<
    {
      name: string;
      cpu: string;
      memory: string;
      disk: string;
      status: string;
      cpuStatus: string;
      memStatus: string;
      diskStatus: string;
    }[]
  >([]);

  const isFetchingRef = useRef(false);
  const hostMapRef = useRef<Record<string, string>>({});

  const buildComputers = useCallback(
    (pcs: Record<string, PcMetrics>, hostMap: Record<string, string> = hostMapRef.current) => {
      const list = Object.entries(pcs).map(([uuid, stats]) => ({
        name: hostMap[uuid] ?? hostMapRef.current[uuid] ?? `host-${uuid}`,
        cpu: (stats?.Cpu ?? 0) + '%',
        memory: (stats?.Memory ?? 0) + '%',
        disk: (stats?.Disk ?? 0) + '%',
        status: (() => {
          const cpu = stats?.CpuStatus,
            mem = stats?.MemStatus,
            disk = stats?.DiskStatus;
          if (cpu === 'Dang' || mem === 'Dang' || disk === 'Dang') return 'danger';
          if (cpu === 'Warn' || mem === 'Warn' || disk === 'Warn') return 'warning';
          return 'safe';
        })(),
        cpuStatus: stats?.CpuStatus,
        memStatus: stats?.MemStatus,
        diskStatus: stats?.DiskStatus,
      }));
      setComputers(list);
    },
    [],
  );

  const fetchServiceStatus = useCallback(async (service: ServiceName) => {
    const [{ data: installedData }, { data: noInstalledData }] = await Promise.all([
      getInstalled({ query: { Server: SERVICE_QUERY_MAP[service] } }),
      getNoinstall({ query: { Server: SERVICE_QUERY_MAP[service] } }),
    ]);
    const pcsSources = [installedData?.Pcs, noInstalledData?.Pcs];
    const entries: ServiceStatusEntry[] = [];
    const hostMap: Record<string, string> = {};
    
    pcsSources.forEach((pcsData) => {
      if (pcsData && typeof pcsData === 'object') {
        if ('Installed' in pcsData) {
          Object.entries(pcsData.Installed ?? {}).forEach(([uuid, info]) => {
            const Hostname = hostMapRef.current[uuid] ?? info?.Hostname ?? `host-${uuid}`;
            hostMap[uuid] = Hostname;
            entries.push({ Hostname, Status: normalizeServiceStatus(info?.Status) });
          });
        }
        if ('NotInstalled' in pcsData) {
          Object.entries(pcsData.NotInstalled ?? {}).forEach(([uuid, infoOrName]) => {
            const parsedHostname =
              typeof infoOrName === 'string'
                ? infoOrName
                : infoOrName && typeof infoOrName === 'object' && 'Hostname' in infoOrName
                ? (infoOrName as { Hostname?: string }).Hostname
                : undefined;
            const Hostname = parsedHostname ?? hostMapRef.current[uuid] ?? `host-${uuid}`;
            hostMap[uuid] = Hostname;
            entries.push({ Hostname, Status: 'uninstalled' });
          });
        }
      }
    });

    return { entries, hostMap };
  }, []);

  const fetchServicesStatuses = useCallback(async () => {
    const results = await Promise.all(
      SERVICE_NAMES.map(async (service) => {
        try {
          const { entries, hostMap } = await fetchServiceStatus(service);
          return { service, entries, hostMap };
        } catch (err) {
          console.error(`fetch${service}Statuses error`, err);
          return { service, entries: [], hostMap: {} };
        }
      }),
    );
    const nextStatus: ServicesStatusState = { Apache: [] };
    const mergedHostMap: Record<string, string> = { ...hostMapRef.current };
    results.forEach(({ service, entries, hostMap }) => {
      nextStatus[service] = entries;
      Object.assign(mergedHostMap, hostMap);
    });
    hostMapRef.current = mergedHostMap;
    setServicesStatus(nextStatus);
    return mergedHostMap;
  }, [fetchServiceStatus]);

  const statusIconMap: Record<string, { icon: React.ElementType; color: string }> = {
    safe: { icon: Check, color: 'text-green-600' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500' },
    danger: { icon: X, color: 'text-red-500' },
  };

  const ServiceStatusIcon = ({ status }: { status: ServiceStatusValue }) => {
    if (status === 'active') {
      return <Check className='w-4 h-4 text-green-500' />;
    }
    if (status === 'stopped') {
      return <X className='w-4 h-4 text-red-500' />;
    }
    return <Minus className='w-4 h-4 text-gray-400' />;
  };

  //TODO: info要記得加上
  const fetchAllInfo = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      // 併行抓 Cluster/Info 與主機列表
      const [infoRes, pcsRes] = await Promise.all([
        getInfoAll(),
        postInfoGet({
          body: { Target: null as Target | null, Uuid: null } satisfies InfoGetRequest,
        }),
      ]);

      const infoData = infoRes.data;
      if (
        infoData &&
        infoData.Cluster &&
        infoData.Info &&
        typeof infoData.Cluster === 'object' &&
        typeof infoData.Info === 'object'
      ) {
        const timestamp = new Date().toLocaleTimeString('zh-TW', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        const diskValue =
          typeof infoData?.Cluster?.Disk === 'number' ? infoData.Cluster.Disk : 0;
        const clampedDiskValue = Math.min(100, Math.max(0, diskValue));

        setCpuData((prev) => [
          ...prev.slice(-5),
          { time: timestamp, value: infoData?.Cluster?.Cpu ?? 1 },
        ]);
        setMemoryData((prev) => [
          ...prev.slice(-5),
          { time: timestamp, value: infoData?.Cluster?.Memory ?? 1 },
        ]);
        setDiskData(clampedDiskValue);
      }

      const mergedPcs = (pcsRes.data?.Pcs ?? {}) as Record<string, PcMetrics>;

      if (mergedPcs && typeof mergedPcs === 'object') {
        const hasHostMap = Object.keys(hostMapRef.current).length > 0;

        if (!hasHostMap) {
          // 首次載入等服務狀態完成，避免閃 PC-uuid
          try {
            const hostMap = await fetchServicesStatuses();
            buildComputers(mergedPcs, hostMap);
          } catch (serviceErr) {
            console.error('fetchServicesStatuses error', serviceErr);
            buildComputers(mergedPcs);
          }
        } else {
          // 後續輪詢先用快取的 hostname 再背景更新
          buildComputers(mergedPcs, hostMapRef.current);
          fetchServicesStatuses()
            .then((hostMap) => buildComputers(mergedPcs, hostMap))
            .catch((serviceErr) => console.error('fetchServicesStatuses error', serviceErr));
        }
      }
    } catch {
      toast.error('後端連線失敗，使用模擬資料');

      const timestamp = new Date().toLocaleTimeString('zh-TW', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const fakeCluster = {
        Cpu: Math.floor(Math.random() * 50) + 30,
        Memory: Math.floor(Math.random() * 50) + 30,
        Disk: Math.floor(Math.random() * 50) + 30,
      };

      const fakeInfo = { Safe: 5, Warn: 3, Dang: 2 };

      const list = [
        ...Array(fakeInfo.Safe)
          .fill(0)
          .map((_, i) => ({
            name: `PC-Safe-${i + 1}`,
            cpu: (Math.random() * 50 + 10).toFixed(0) + '%',
            memory: (Math.random() * 50 + 10).toFixed(0) + '%',
            disk: (Math.random() * 50 + 10).toFixed(0) + '%',
            status: 'safe',
            cpuStatus: 'safe',
            memStatus: 'safe',
            diskStatus: 'safe',
          })),
        ...Array(fakeInfo.Warn)
          .fill(0)
          .map((_, i) => ({
            name: `PC-Warn-${i + 1}`,
            cpu: (Math.random() * 30 + 50).toFixed(0) + '%',
            memory: (Math.random() * 30 + 50).toFixed(0) + '%',
            disk: (Math.random() * 30 + 50).toFixed(0) + '%',
            status: 'warning',
            cpuStatus: 'Warn',
            memStatus: 'Warn',
            diskStatus: 'Warn',
          })),
        ...Array(fakeInfo.Dang)
          .fill(0)
          .map((_, i) => ({
            name: `PC-Danger-${i + 1}`,
            cpu: (Math.random() * 20 + 80).toFixed(0) + '%',
            memory: (Math.random() * 20 + 80).toFixed(0) + '%',
            disk: (Math.random() * 20 + 80).toFixed(0) + '%',
            status: 'danger',
            cpuStatus: 'Dang',
            memStatus: 'Dang',
            diskStatus: 'Dang',
          })),
      ];

      const serviceKeys = ['A', 'N', 'B', 'D', 'L', 'M', 'ProFTPD', 'Samba', 'Proxy', 'SSH'];
      const statusPool = ['active', 'stopped', 'uninstalled'] as const;

      const fakeServers = list.map((pc) => ({
        name: pc.name.replace('PC', 'host'),
        services: Object.fromEntries(
          serviceKeys.map((key) => [
            key,
            statusPool[Math.floor(Math.random() * statusPool.length)],
          ]),
        ),
      }));

      setCpuData((prev) => [...prev.slice(-5), { time: timestamp, value: fakeCluster.Cpu }]);
      setMemoryData((prev) => [...prev.slice(-5), { time: timestamp, value: fakeCluster.Memory }]);
      setDiskData(fakeCluster.Disk);

      setComputers(list);
      setServicesStatus({
        Apache: fakeServers.map((s) => ({
          Hostname: s.name,
          Status: s.services['A'] as ServiceStatusValue,
        })),
      });
      hostMapRef.current = {};
    } finally {
      isFetchingRef.current = false;
    }
  }, [buildComputers, fetchServicesStatuses]);
  useEffect(() => {
    fetchAllInfo();
    const interval = setInterval(fetchAllInfo, 5000);
    return () => clearInterval(interval);
  }, [fetchAllInfo]);

  const diskUsedPercent = Math.min(100, Math.max(0, diskData));
  const diskFreePercent = Math.max(0, 100 - diskUsedPercent);
  const diskUsedDisplay = Math.round(diskUsedPercent * 10) / 10;

  const filteredComputers = selectedStatus
    ? computers.filter((c) => c.status === selectedStatus)
    : computers;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentComputers = filteredComputers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredComputers.length / ITEMS_PER_PAGE);

  const handleStatusClick = (status: 'safe' | 'warning' | 'danger') => {
    setSelectedStatus(selectedStatus === status ? null : status);
    setCurrentPage(1);
  };

  const getStatusCount = (status: string) => computers.filter((c) => c.status === status).length;

  /* ==============================
     以下為 Dashboard 顯示
     ============================== */
  if (selectedStatus) {
    const { icon: Icon, color } = statusIconMap[selectedStatus];
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <Button
            variant='outline'
            onClick={() => setSelectedStatus(null)}
            className='flex items-center gap-2'
          >
            <ChevronLeft className='w-4 h-4' /> Back to Dashboard
          </Button>
          <h2 className='text-2xl font-bold text-slate-700 capitalize flex items-center gap-2'>
            <Icon className={`w-6 h-6 ${color}`} />
            {selectedStatus} Computers ({filteredComputers.length})
          </h2>
        </div>

        <Card>
          <CardContent className='p-6 relative'>
            <div className='relative w-full h-8 border-b border-slate-200'>
              <div className='absolute left-0 w-[40%] text-xs font-medium text-slate-600'>Name</div>
              <div className='absolute left-[48%] w-[15%] text-right text-xs font-medium text-slate-600'>
                CPU
              </div>
              <div className='absolute left-[65%] w-[15%] text-right text-xs font-medium text-slate-600'>
                Memory
              </div>
              <div className='absolute left-[78%] w-[15%] text-right text-xs font-medium text-slate-600'>
                Disk
              </div>
            </div>
            <div className='mt-2 space-y-1'>
              {currentComputers.map((computer, index) => (
                <div key={index} className='relative w-full h-8 border-b border-slate-100'>
                  <div className='absolute left-0 w-[40%] overflow-hidden whitespace-nowrap text-md'>
                    {computer.name}
                  </div>
                  <div className='absolute left-[50%] w-[15%] text-right text-xs'>
                    <Badge
                      variant='outline'
                      className={`${
                        computer.cpuStatus === 'Dang'
                          ? 'border-red-300 text-red-700'
                          : computer.cpuStatus === 'Warn'
                          ? 'border-yellow-300 text-yellow-700'
                          : 'border-green-300 text-green-700'
                      }`}
                    >
                      {computer.cpu}
                    </Badge>
                  </div>
                  <div className='absolute left-[65%] w-[15%] text-right text-xs'>
                    <Badge
                      variant='outline'
                      className={`${
                        computer.memStatus === 'Dang'
                          ? 'border-red-300 text-red-700'
                          : computer.memStatus === 'Warn'
                          ? 'border-yellow-300 text-yellow-700'
                          : 'border-green-300 text-green-700'
                      }`}
                    >
                      {computer.memory}
                    </Badge>
                  </div>
                  <div className='absolute left-[80%] w-[15%] text-right text-xs'>
                    <Badge
                      variant='outline'
                      className={`${
                        computer.diskStatus === 'Dang'
                          ? 'border-red-300 text-red-700'
                          : computer.diskStatus === 'Warn'
                          ? 'border-yellow-300 text-yellow-700'
                          : 'border-green-300 text-green-700'
                      }`}
                    >
                      {computer.disk}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ==============================
     主畫面 Dashboard
     ============================== */
  return (
    <div className='container mx-auto py-6 px-4'>
      <div className='bg-[#A8AEBD] py-1.5 mb-6'>
        <h1 className='text-4xl font-extrabold text-center text-[#E6E6E6]'>Dashboard</h1>
      </div>
      <div className='space-y-6 min-w-0 mb-6'>
        <Card>
          <CardHeader className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <CardTitle className='text-slate-700'>Server Status</CardTitle>
            <div className='flex flex-wrap items-center gap-3 text-xs text-slate-600'>
              <div className='flex items-center gap-1'>
                <Check className='w-4 h-4 text-green-500' />
                <span>Active</span>
              </div>
              <div className='flex items-center gap-1'>
                <X className='w-4 h-4 text-red-500' />
                <span>Stopped</span>
              </div>
              <div className='flex items-center gap-1'>
                <Minus className='w-4 h-4 text-gray-400' />
                <span>Uninstalled</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <Table className='table-fixed w-full'>
                <TableHeader>
                  <TableRow>
                    <TableHead className='text-xs w-1/5'>Name</TableHead>
                    <TableHead className='text-xl'>
                      <div title='Apache'>
                        <SiApache />
                      </div>
                    </TableHead>
                    <TableHead className='text-base'>
                      <div title='Nginx'>
                        <SiNginx />
                      </div>
                    </TableHead>
                    <TableHead className='text-base'>
                      <div title='BIND DNS'>
                        <FaGlobe />
                      </div>
                    </TableHead>
                    <TableHead className='text-lg'>
                      <div title='DHCP'>
                        <TbNetwork />
                      </div>
                    </TableHead>
                    <TableHead className='text-lg'>
                      <div title='LDAP'>
                        <LuIdCard />
                      </div>
                    </TableHead>
                    <TableHead className='text-lg'>
                      <div title='MySQL Database'>
                        <TbBrandMysql />
                      </div>
                    </TableHead>
                    <TableHead className='text-base'>
                      <div title='ProFTPD'>
                        <SiFilezilla />
                      </div>
                    </TableHead>
                    <TableHead className='text-lg'>
                      <div title='Samba'>
                        <TbFolders />
                      </div>
                    </TableHead>
                    <TableHead className='text-base'>
                      <div title='Squid Proxy'>
                        <GiSquid />
                      </div>
                    </TableHead>
                    <TableHead className='text-base'>
                      <div title='SSH'>
                        <IoTerminal />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentComputers.map((computer) => {
                    const apache =
                      servicesStatus.Apache.find((a) => a.Hostname === computer.name)?.Status ??
                      'uninstalled';
                    // console.log('computers', computers.map(c => ({name: c.name, status: c.status})));
                    return (
                      <TableRow key={computer.name}>
                        <TableCell className='text-xs truncate' title={computer.name}>
                          {computer.name}
                        </TableCell>
                        <TableCell className='h-10'>
                          <ServiceStatusIcon status={apache} />
                        </TableCell>
                        <TableCell className='h-10'>
                          <ServiceStatusIcon status='uninstalled' />
                        </TableCell>
                        <TableCell className='h-10'>
                          <ServiceStatusIcon status='uninstalled' />
                        </TableCell>
                        <TableCell className='h-10'>
                          <ServiceStatusIcon status='uninstalled' />
                        </TableCell>
                        <TableCell className='h-10'>
                          <ServiceStatusIcon status='uninstalled' />
                        </TableCell>
                        <TableCell className='h-10'>
                          <ServiceStatusIcon status='uninstalled' />
                        </TableCell>
                        <TableCell className='h-10'>
                          <ServiceStatusIcon status='uninstalled' />
                        </TableCell>
                        <TableCell className='h-10'>
                          <ServiceStatusIcon status='uninstalled' />
                        </TableCell>
                        <TableCell className='h-10'>
                          <ServiceStatusIcon status='uninstalled' />
                        </TableCell>
                        <TableCell className='h-10'>
                          <ServiceStatusIcon status='uninstalled' />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className='flex items-center justify-between'>
                  <div className='text-xs text-slate-500'>
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredComputers.length)} of{' '}
                    {filteredComputers.length} computers
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </Button>
                    <span className='text-xs text-slate-600'>
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Status Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        <Button variant='ghost' className='h-auto p-0' onClick={() => handleStatusClick('safe')}>
          <StatusCard status='safe' getStatusCount={getStatusCount} />
        </Button>

        <Button variant='ghost' className='h-auto p-0' onClick={() => handleStatusClick('warning')}>
          <StatusCard status='warning' getStatusCount={getStatusCount} />
        </Button>

        <Button variant='ghost' className='h-auto p-0' onClick={() => handleStatusClick('danger')}>
          <StatusCard status='danger' getStatusCount={getStatusCount} />
        </Button>
      </div>
      {/* Charts */}
      <div className='space-y-6 min-w-0'>
        {/* CPU Chart */}
        <Card>
          <CardHeader>
            <CardTitle className='text-slate-700'>CPU</CardTitle>
          </CardHeader>
          <CardContent className='w-full min-w-0'>
            <div className='w-full min-w-0 h-48'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={cpuData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                  <XAxis dataKey='time' stroke='#64748b' fontSize={12} />
                  <YAxis stroke='#64748b' fontSize={12} domain={[0, 100]} />
                  <Line
                    type='monotone'
                    dataKey='value'
                    stroke='#3b82f6'
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Memory Chart */}
        <Card>
          <CardHeader>
            <CardTitle className='text-slate-700'>Memory</CardTitle>
          </CardHeader>
          <CardContent className='w-full min-w-0'>
            <div className='w-full min-w-0 h-48'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={memoryData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                  <XAxis dataKey='time' stroke='#64748b' fontSize={12} domain={[0, 100]} />
                  <YAxis stroke='#64748b' fontSize={12} domain={[0, 100]} />
                  <Line
                    type='monotone'
                    dataKey='value'
                    stroke='#10b981'
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Disk */}
        <Card>
          <CardHeader>
            <CardTitle className='text-slate-700'>Disk</CardTitle>
            <p className='text-sm text-gray-500'>
              Used {diskUsedDisplay}%
            </p>
          </CardHeader>
          <CardContent className='w-full min-w-0'>
            <div className='space-y-4'>
              {/* Storage Bar */}
              <div className='w-full h-6 bg-gray-100 rounded-lg overflow-hidden flex'>
                <div
                  className='bg-yellow-400 h-full transition-[width] duration-500 ease-in-out'
                  style={{ width: `${diskUsedPercent}%` }}
                ></div>
                <div
                  className='bg-gray-300 h-full transition-[width] duration-500 ease-in-out'
                  style={{ width: `${diskFreePercent}%` }}
                ></div>
              </div>

              {/* Legend */}
              <div className='flex flex-wrap gap-3 text-sm'>
                <div className='flex items-center gap-1'>
                  <div className='w-3 h-3 bg-yellow-400 rounded-full'></div>
                  <span>Used</span>
                </div>
                <div className='flex items-center gap-1'>
                  <div className='w-3 h-3 bg-gray-300 rounded-full'></div>
                  <span>Available</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Computer List */}
        <Card>
          <CardHeader>
            <CardTitle className='text-slate-700'>Computer List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='text-xs'>Name</TableHead>
                    <TableHead className='text-xs'>CPU</TableHead>
                    <TableHead className='text-xs'>Memory</TableHead>
                    <TableHead className='text-xs'>Disk</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {currentComputers.map((computer) => (
                    <TableRow key={computer.name}>
                      <TableCell className='text-xs font-medium'>{computer.name}</TableCell>

                      <TableCell className='text-xs'>
                        <Badge
                          variant='outline'
                          className={`text-xs ${
                            computer.cpuStatus === 'Dang'
                              ? 'border-red-300 text-red-700'
                              : computer.cpuStatus === 'Warn'
                              ? 'border-yellow-300 text-yellow-700'
                              : 'border-green-300 text-green-700'
                          }`}
                        >
                          {computer.cpu}
                        </Badge>
                      </TableCell>

                      <TableCell className='text-xs'>
                        <Badge
                          variant='outline'
                          className={`text-xs ${
                            computer.memStatus === 'Dang'
                              ? 'border-red-300 text-red-700'
                              : computer.memStatus === 'Warn'
                              ? 'border-yellow-300 text-yellow-700'
                              : 'border-green-300 text-green-700'
                          }`}
                        >
                          {computer.memory}
                        </Badge>
                      </TableCell>

                      <TableCell className='text-xs'>
                        <Badge
                          variant='outline'
                          className={`text-xs ${
                            computer.diskStatus === 'Dang'
                              ? 'border-red-300 text-red-700'
                              : computer.diskStatus === 'Warn'
                              ? 'border-yellow-300 text-yellow-700'
                              : 'border-green-300 text-green-700'
                          }`}
                        >
                          {computer.disk}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='flex items-center justify-between'>
                  <div className='text-xs text-slate-500'>
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredComputers.length)} of{' '}
                    {filteredComputers.length} computers
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </Button>

                    <span className='text-xs text-slate-600'>
                      Page {currentPage} of {totalPages}
                    </span>

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
