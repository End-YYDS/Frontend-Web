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
  getApacheAll,
  getInfoAll,
  postInfoGet,
  type Target,
} from '@/api/openapi-client';

const ITEMS_PER_PAGE = 3;

export function DashboardContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<'safe' | 'warning' | 'danger' | null>(null);

  // server狀態
  const [ApacheStatus, setApacheStatus] = useState<{ name: string; Apache: string }[]>([]);

  // 圖表資料
  const [cpuData, setCpuData] = useState<{ time: string; value: number }[]>([]);
  const [memoryData, setMemoryData] = useState<{ time: string; value: number }[]>([]);
  // const [diskData, setDiskData] = useState<{ time: string; value: number }[]>([]);

  // 電腦列表
  const [computers, setComputers] = useState<
    { name: string; cpu: string; memory: string; disk: string; status: string; 
      cpuStatus: string; memStatus: string; diskStatus: string }[]
  >([]);

  const isFetchingRef = useRef(false);
  const hostMapRef = useRef<Record<string, string>>({});

  const buildComputers = (
    pcs: Record<string, any>,
    hostMap: Record<string, string> = hostMapRef.current,
  ) => {
    const list = Object.entries(pcs).map(([uuid, stats]) => ({
      name: hostMap[uuid] ?? `PC-${uuid}`,
      cpu: stats?.Cpu + '%',
      memory: stats?.Memory + '%',
      disk: stats?.Disk + '%',
      status: (() => {
        const cpu = stats?.CpuStatus,
          mem = stats?.MemStatus,
          disk = stats?.DiskStatus;
        if (cpu === 'Warn' || mem === 'Warn' || disk === 'Warn') return 'warning';
        if (cpu === 'Dang' || mem === 'Dang' || disk === 'Dang') return 'danger';
        return 'safe';
      })(),
      cpuStatus: stats?.CpuStatus,
      memStatus: stats?.MemStatus,
      diskStatus: stats?.DiskStatus,
    }));
    setComputers(list);
  };

  const fetchApacheStatuses = async (pcs: Record<string, any>) => {
    const apacheStatus = await Promise.all(
      Object.entries(pcs).map(async ([uuid]) => {
        const res = await getApacheAll({ query: { Uuid: uuid } });
        const data = res.data;
        return {
          uuid,
          hostname: data?.Hostname ?? `host-${uuid}`,
          status: data?.Status ?? 'undefined',
        };
      }),
    );
    const hostMap = Object.fromEntries(apacheStatus.map((a) => [a.uuid, a.hostname]));
    setApacheStatus(
      apacheStatus.map((a) => ({
        name: a.hostname,
        Apache: a.status,
      })),
    );
    hostMapRef.current = hostMap;
    return hostMap;
  };

  const statusIconMap: Record<string, { icon: React.ElementType; color: string }> = {
    safe: { icon: Check, color: 'text-green-600' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500' },
    danger: { icon: X, color: 'text-red-500' },
  };

  const ServiceStatusIcon = ({ status }: { status: string }) => {
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
    try {
      const { data } = await getInfoAll();
      if (
        data &&
        data.Cluster &&
        data.Info &&
        typeof data.Cluster === 'object' &&
        typeof data.Info === 'object'
      ) {
        const timestamp = new Date().toLocaleTimeString('zh-TW', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        setCpuData((prev) => [
          ...prev.slice(-5),
          { time: timestamp, value: data?.Cluster?.Cpu ?? 1 },
        ]);
        setMemoryData((prev) => [
          ...prev.slice(-5),
          { time: timestamp, value: data?.Cluster?.Memory ?? 1 },
        ]);
      }

      const reqBody: InfoGetRequest = { Target: 'Safe', Uuid: null };
      const resPcs = await postInfoGet({ body: reqBody });
      const pcsData = resPcs.data;

      if (pcsData && pcsData.Pcs && typeof pcsData.Pcs === 'object') {
        const apacheStatus = await Promise.all(
          Object.entries(pcsData.Pcs).map(async ([uuid]) => {
            const res = await getApacheAll({ query: { Uuid: uuid } });
            const data = res.data;
            return {
              uuid,
              hostname: data?.Hostname ?? `host-${uuid}`,
              status: data?.Status ?? 'undefined',
            };
          }),
        );

        const hostMap = Object.fromEntries(apacheStatus.map((a) => [a.uuid, a.hostname]));
        const list = Object.entries(pcsData?.Pcs).map(([uuid, stats]) => ({
          name: hostMap[uuid] ?? `PC-${uuid}`,
          cpu: stats?.Cpu + '%',
          memory: stats?.Memory + '%',
          disk: stats?.Disk + '%',
          status: (() => {
            const cpu = stats?.CpuStatus,
              mem = stats?.MemStatus,
              disk = stats?.DiskStatus;
            if (cpu === 'Warn' || mem === 'Warn' || disk === 'Warn') return 'warning';
            if (cpu === 'Dang' || mem === 'Dang' || disk === 'Dang') return 'danger';
            return 'safe';
          })(),
        }));
        setComputers(list);
        setApacheStatus(
          apacheStatus.map((a) => ({
            name: a.hostname,
            Apache: a.status,
          })),
        );
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
      const statusPool = ['active', 'stopped', 'uninstalled'];

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

      setComputers(list);
      setApacheStatus(fakeServers.map((s) => ({ name: s.name, Apache: s.services['A'] })));
    } finally {
      isFetchingRef.current = false;
    }
  }, []);
  useEffect(() => {
    fetchAllInfo();
    const interval = setInterval(fetchAllInfo, 5000);
    return () => clearInterval(interval);
  }, [fetchAllInfo]);

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
          <CardHeader>
            <CardTitle className='text-slate-700'>Server Status</CardTitle>
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
                    const apache = ApacheStatus.find(a => a.name === computer.name)?.Apache ?? 'uninstalled';
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
          <CardContent className='p-6 w-full min-w-0'>
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
          <CardContent className='p-6 w-full min-w-0'>
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
            <p className='text-sm text-gray-500'>Used 2.1 TB (Total 3.2 TB)</p>
          </CardHeader>
          <CardContent className='p-6 w-full min-w-0'>
            <div className='space-y-4'>
              {/* Storage Bar */}
              <div className='w-full h-6 bg-gray-200 rounded-lg overflow-hidden flex'>
                <div className='bg-red-500 h-full' style={{ width: '30%' }}></div>
                <div className='bg-orange-400 h-full' style={{ width: '25%' }}></div>
                <div className='bg-yellow-400 h-full' style={{ width: '20%' }}></div>
                <div className='bg-gray-500 h-full' style={{ width: '15%' }}></div>
                <div className='bg-gray-600 h-full' style={{ width: '10%' }}></div>
              </div>

              {/* Legend */}
              <div className='flex flex-wrap gap-3 text-sm'>
                <div className='flex items-center gap-1'>
                  <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                  <span>System Files</span>
                </div>
                <div className='flex items-center gap-1'>
                  <div className='w-3 h-3 bg-orange-400 rounded-full'></div>
                  <span>Applications</span>
                </div>
                <div className='flex items-center gap-1'>
                  <div className='w-3 h-3 bg-yellow-400 rounded-full'></div>
                  <span>User Data</span>
                </div>
                <div className='flex items-center gap-1'>
                  <div className='w-3 h-3 bg-gray-500 rounded-full'></div>
                  <span>Cache</span>
                </div>
                <div className='flex items-center gap-1'>
                  <div className='w-3 h-3 bg-gray-600 rounded-full'></div>
                  <span>Others</span>
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
