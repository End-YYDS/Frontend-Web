import StatusCard from './MyCard';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Check, AlertTriangle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

// Function to fetch system metrics from backend
const fetchSystemMetrics = async () => {
  try {
    // Mock backend API call - replace with actual Supabase API call
    return {
      cpu: Math.floor(Math.random() * 80) + 20,
      memory: Math.floor(Math.random() * 80) + 20,
      disk: Math.floor(Math.random() * 80) + 20,
      timestamp: new Date().toLocaleTimeString('zh-TW', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    return null;
  }
};

// Mock data for computer list with status
const computers = [
  { name: 'Agent-1', cpu: '35%', memory: '38%', disk: '34%', status: 'safe' },
  { name: 'Agent-2', cpu: '23%', memory: '34%', disk: '42%', status: 'safe' },
  { name: 'Agent-3', cpu: '45%', memory: '36%', disk: '68%', status: 'warning' },
  { name: 'Agent-4', cpu: '87%', memory: '89%', disk: '92%', status: 'danger' },
  { name: 'Agent-5', cpu: '34%', memory: '35%', disk: '45%', status: 'safe' },
  { name: 'Agent-6', cpu: '56%', memory: '67%', disk: '55%', status: 'warning' },
  { name: 'Agent-7', cpu: '38%', memory: '54%', disk: '53%', status: 'warning' },
  { name: 'Agent-8', cpu: '23%', memory: '43%', disk: '48%', status: 'safe' },
  { name: 'Agent-9', cpu: '45%', memory: '36%', disk: '32%', status: 'safe' },
  { name: 'Agent-10', cpu: '34%', memory: '67%', disk: '69%', status: 'safe' },
  { name: 'Agent-11', cpu: '23%', memory: '45%', disk: '55%', status: 'safe' },
  { name: 'Agent-12', cpu: '86%', memory: '78%', disk: '91%', status: 'danger' },
  { name: 'Agent-13', cpu: '65%', memory: '42%', disk: '50%', status: 'warning' },
  { name: 'Agent-14', cpu: '45%', memory: '58%', disk: '46%', status: 'warning' },
  { name: 'Agent-15', cpu: '25%', memory: '42%', disk: '62%', status: 'safe' },
  { name: 'Agent-16', cpu: '35%', memory: '48%', disk: '68%', status: 'safe' },
  { name: 'Agent-17', cpu: '55%', memory: '65%', disk: '74%', status: 'warning' },
  { name: 'Agent-18', cpu: '75%', memory: '82%', disk: '85%', status: 'warning' },
  { name: 'Agent-19', cpu: '42%', memory: '56%', disk: '71%', status: 'warning' },
  { name: 'Agent-20', cpu: '28%', memory: '38%', disk: '52%', status: 'safe' },
  { name: 'Agent-21', cpu: '18%', memory: '32%', disk: '48%', status: 'safe' },
  { name: 'Agent-22', cpu: '62%', memory: '74%', disk: '89%', status: 'warning' },
];

const ITEMS_PER_PAGE = 5;

export function DashboardContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<'safe' | 'warning' | 'danger' | null>(null);

  // Real-time data state (store last 6 data points)
  const [cpuData, setCpuData] = useState([
    { time: '00:00', value: 25 },
    { time: '04:00', value: 35 },
    { time: '08:00', value: 45 },
    { time: '12:00', value: 55 },
    { time: '16:00', value: 40 },
    { time: '20:00', value: 30 },
  ]);

  const [memoryData, setMemoryData] = useState([
    { time: '00:00', value: 60 },
    { time: '04:00', value: 45 },
    { time: '08:00', value: 55 },
    { time: '12:00', value: 70 },
    { time: '16:00', value: 65 },
    { time: '20:00', value: 50 },
  ]);

  const [, setDiskData] = useState([
    { time: '00:00', value: 80 },
    { time: '04:00', value: 82 },
    { time: '08:00', value: 85 },
    { time: '12:00', value: 88 },
    { time: '16:00', value: 86 },
    { time: '20:00', value: 84 },
  ]);

  const statusIconMap: Record<string, { icon: React.ElementType; color: string }> = {
    safe: { icon: Check, color: 'text-green-600' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500' },
    danger: { icon: X, color: 'text-red-500' },
  };

  // Fetch data every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const metrics = await fetchSystemMetrics();
      if (metrics) {
        // Update CPU data (shift left and add new data point)
        setCpuData((prev) => {
          const newData = [...prev.slice(1), { time: metrics.timestamp, value: metrics.cpu }];
          return newData;
        });

        // Update Memory data (shift left and add new data point)
        setMemoryData((prev) => {
          const newData = [...prev.slice(1), { time: metrics.timestamp, value: metrics.memory }];
          return newData;
        });

        // Update Disk data (shift left and add new data point)
        setDiskData((prev) => {
          const newData = [...prev.slice(1), { time: metrics.timestamp, value: metrics.disk }];
          return newData;
        });
      }
    }, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter computers based on selected status
  const filteredComputers = selectedStatus
    ? computers.filter((computer) => computer.status === selectedStatus)
    : computers;

  // Calculate pagination for filtered computers
  const totalPages = Math.ceil(filteredComputers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentComputers = filteredComputers.slice(startIndex, endIndex);

  const handleStatusClick = (status: 'safe' | 'warning' | 'danger') => {
    setSelectedStatus(selectedStatus === status ? null : status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getStatusCount = (status: string) => {
    return computers.filter((computer) => computer.status === status).length;
  };

  // If a status is selected, only show the filtered computer list
  if (selectedStatus) {
    return (
      <div className='space-y-6'>
        {/* Back button and status header */}
        <div className='flex items-center justify-between'>
          <Button
            variant='outline'
            onClick={() => setSelectedStatus(null)}
            className='flex items-center gap-2'
          >
            <ChevronLeft className='w-4 h-4' />
            Back to Dashboard
          </Button>
          <h2 className='text-2xl font-bold text-slate-700 capitalize flex items-center gap-2'>
            {(() => {
              const { icon: Icon, color } = statusIconMap[selectedStatus] || {
                icon: Check,
                color: 'text-slate-400',
              };
              return <Icon className={`w-6 h-6 ${color}`} />;
            })()}
            {selectedStatus} Computers ({filteredComputers.length})
          </h2>
        </div>

        {/* Computer List */}
        <Card>
          <CardContent className='p-6 relative'>
            {/* Header */}
            <div className='relative w-full h-8 border-b border-slate-200'>
              <div className='absolute left-0 w-[40%] overflow-hidden whitespace-nowrap text-ellipsis text-xs font-medium text-slate-600'>
                Name
              </div>
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
            {/* Rows */}
            <div className='mt-2 space-y-1'>
              {currentComputers.map((computer, index) => (
                <div key={index} className='relative w-full h-8 border-b border-slate-100'>
                  {/* Name */}
                  <div className='absolute left-0 w-[40%] overflow-hidden whitespace-nowrap text-md'>
                    {computer.name}
                  </div>

                  {/* CPU */}
                  <div className='absolute left-[50%] w-[15%] text-right text-xs'>
                    <Badge
                      variant='outline'
                      className={`${
                        parseInt(computer.cpu) > 70
                          ? 'border-red-300 text-red-700'
                          : parseInt(computer.cpu) > 50
                          ? 'border-yellow-300 text-yellow-700'
                          : 'border-green-300 text-green-700'
                      }`}
                    >
                      {computer.cpu}
                    </Badge>
                  </div>

                  {/* Memory */}
                  <div className='absolute left-[65%] w-[15%] text-right text-xs'>
                    <Badge
                      variant='outline'
                      className={`${
                        parseInt(computer.memory) > 70
                          ? 'border-red-300 text-red-700'
                          : parseInt(computer.memory) > 50
                          ? 'border-yellow-300 text-yellow-700'
                          : 'border-green-300 text-green-700'
                      }`}
                    >
                      {computer.memory}
                    </Badge>
                  </div>

                  {/* Disk */}
                  <div className='absolute left-[80%] w-[15%] text-right text-xs'>
                    <Badge
                      variant='outline'
                      className={`${
                        parseInt(computer.disk) > 70
                          ? 'border-red-300 text-red-700'
                          : parseInt(computer.disk) > 50
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

  return (
    <div className='space-y-6'>
      <div className='text-center mb-8'>
        <h1
          className='text-4xl font-bold mb-2'
          style={{ color: '#E6E6E6', backgroundColor: '#A8AEBD' }}
        >
          Dashboard
        </h1>
      </div>
      {/* Status Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
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

      {/* Charts and Computer List in vertical layout */}
      <div className='space-y-6'>
        {/* CPU Chart */}
        <Card>
          <CardHeader>
            <CardTitle className='text-slate-700'>CPU</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-48'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={cpuData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                  <XAxis dataKey='time' stroke='#64748b' fontSize={12} />
                  <YAxis stroke='#64748b' fontSize={12} />
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
          <CardContent>
            <div className='h-48'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={memoryData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                  <XAxis dataKey='time' stroke='#64748b' fontSize={12} />
                  <YAxis stroke='#64748b' fontSize={12} />
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

        {/* Disk Storage */}
        <Card>
          <CardHeader>
            <CardTitle className='text-slate-700'>Disk</CardTitle>
            <p className='text-sm text-gray-500'>Used 2.1 TB (Total 3.2 TB)</p>
          </CardHeader>
          <CardContent>
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
                  {currentComputers.map((computer, index) => (
                    <TableRow key={index}>
                      <TableCell className='text-xs font-medium'>{computer.name}</TableCell>
                      <TableCell className='text-xs'>
                        <Badge
                          variant='outline'
                          className={`text-xs ${
                            parseInt(computer.cpu) > 70
                              ? 'border-red-300 text-red-700'
                              : parseInt(computer.cpu) > 50
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
                            parseInt(computer.memory) > 70
                              ? 'border-red-300 text-red-700'
                              : parseInt(computer.memory) > 50
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
                            parseInt(computer.disk) > 70
                              ? 'border-red-300 text-red-700'
                              : parseInt(computer.disk) > 50
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
                      <ChevronLeft className='w-4 h-4' />
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
                      <ChevronRight className='w-4 h-4' />
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


// temp
