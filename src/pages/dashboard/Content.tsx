import StatusCard from './MyCard';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer 
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

// Mock data for charts
const cpuData = [
  { time: '00:00', value: 25 },
  { time: '04:00', value: 35 },
  { time: '08:00', value: 45 },
  { time: '12:00', value: 55 },
  { time: '16:00', value: 40 },
  { time: '20:00', value: 30 },
];

const memoryData = [
  { time: '00:00', value: 60 },
  { time: '04:00', value: 45 },
  { time: '08:00', value: 55 },
  { time: '12:00', value: 70 },
  { time: '16:00', value: 65 },
  { time: '20:00', value: 50 },
];

// Mock data for computer list with status
const computers = [
  { name: 'PC-Client-1', cpu: '35%', memory: '64%', disk: '78%', status: 'safe' },
  { name: 'PC-Server-1', cpu: '23%', memory: '54%', disk: '82%', status: 'safe' },
  { name: 'PC-Server-2', cpu: '45%', memory: '76%', disk: '88%', status: 'warning' },
  { name: 'PC-Server-3', cpu: '87%', memory: '89%', disk: '92%', status: 'danger' },
  { name: 'PC-Server-4', cpu: '34%', memory: '45%', disk: '65%', status: 'safe' },
  { name: 'PC-Server-5', cpu: '56%', memory: '67%', disk: '75%', status: 'warning' },
  { name: 'PC-Server-6', cpu: '78%', memory: '54%', disk: '83%', status: 'warning' },
  { name: 'PC-Server-7', cpu: '23%', memory: '43%', disk: '58%', status: 'safe' },
  { name: 'PC-Project-Dev2', cpu: '45%', memory: '56%', disk: '72%', status: 'safe' },
  { name: 'PC-Project-Dev3', cpu: '34%', memory: '67%', disk: '69%', status: 'safe' },
  { name: 'PC-Project-Test', cpu: '23%', memory: '45%', disk: '55%', status: 'safe' },
  { name: 'PC-Project-Test2', cpu: '86%', memory: '78%', disk: '91%', status: 'danger' },
  { name: 'PC-Web-1', cpu: '65%', memory: '72%', disk: '80%', status: 'warning' },
  { name: 'PC-Web-2', cpu: '45%', memory: '58%', disk: '76%', status: 'warning' },
  { name: 'PC-DB-1', cpu: '25%', memory: '42%', disk: '62%', status: 'safe' },
  { name: 'PC-DB-2', cpu: '35%', memory: '48%', disk: '68%', status: 'safe' },
  { name: 'PC-Cache-1', cpu: '55%', memory: '65%', disk: '74%', status: 'warning' },
  { name: 'PC-Cache-2', cpu: '75%', memory: '82%', disk: '85%', status: 'warning' },
  { name: 'PC-API-1', cpu: '42%', memory: '56%', disk: '71%', status: 'warning' },
  { name: 'PC-API-2', cpu: '28%', memory: '38%', disk: '52%', status: 'safe' },
  { name: 'PC-Monitor-1', cpu: '18%', memory: '32%', disk: '48%', status: 'safe' },
  { name: 'PC-Backup-1', cpu: '62%', memory: '74%', disk: '89%', status: 'warning' },
];

const ITEMS_PER_PAGE = 5;

export function DashboardContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<'safe' | 'warning' | 'danger' | null>(null);

  // Filter computers based on selected status
  const filteredComputers = selectedStatus 
    ? computers.filter(computer => computer.status === selectedStatus)
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
    return computers.filter(computer => computer.status === status).length;
  };

  // If a status is selected, only show the filtered computer list
  if (selectedStatus) {
    return (
      <div className="space-y-6">
        {/* Back button and status header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setSelectedStatus(null)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold text-slate-700 capitalize">
            {selectedStatus} Computers ({filteredComputers.length})
          </h2>
        </div>

        {/* Computer List */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">CPU</TableHead>
                    <TableHead className="text-xs">Memory</TableHead>
                    <TableHead className="text-xs">Disk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentComputers.map((computer, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-xs font-medium">
                        {computer.name}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge 
                          variant="outline" 
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
                      <TableCell className="text-xs">
                        <Badge 
                          variant="outline" 
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
                      <TableCell className="text-xs">
                        <Badge 
                          variant="outline" 
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
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredComputers.length)} of {filteredComputers.length} computers
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-slate-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Button
          variant="ghost"
          className="h-auto p-0"
          onClick={() => handleStatusClick('safe')}
        >
        <StatusCard status="safe" getStatusCount={getStatusCount} />
        </Button>
        <Button
          variant="ghost"
          className="h-auto p-0"
          onClick={() => handleStatusClick('warning')}
        >
        <StatusCard status="warning" getStatusCount={getStatusCount} />
        </Button>

        <Button
          variant="ghost"
          className="h-auto p-0"
          onClick={() => handleStatusClick('danger')}
        >
        <StatusCard status="danger" getStatusCount={getStatusCount} />
        </Button>
      </div>

      {/* Charts and Computer List in vertical layout */}
      <div className="space-y-6">
        {/* CPU Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-700">CPU</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cpuData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Memory Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-700">Memory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={memoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Disk Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-700">Disk</CardTitle>
            <p className="text-sm text-gray-500">已使用 2.1 TB（共 3.2 TB）</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Storage Bar */}
              <div className="w-full h-6 bg-gray-200 rounded-lg overflow-hidden flex">
                <div className="bg-red-500 h-full" style={{ width: '30%' }}></div>
                <div className="bg-orange-400 h-full" style={{ width: '25%' }}></div>
                <div className="bg-yellow-400 h-full" style={{ width: '20%' }}></div>
                <div className="bg-gray-500 h-full" style={{ width: '15%' }}></div>
                <div className="bg-gray-600 h-full" style={{ width: '10%' }}></div>
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>系統文件</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <span>應用程式</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span>用戶資料</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span>快取</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                  <span>其他</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Computer List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-700">Computer List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">CPU</TableHead>
                    <TableHead className="text-xs">Memory</TableHead>
                    <TableHead className="text-xs">Disk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentComputers.map((computer, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-xs font-medium">
                        {computer.name}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge 
                          variant="outline" 
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
                      <TableCell className="text-xs">
                        <Badge 
                          variant="outline" 
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
                      <TableCell className="text-xs">
                        <Badge 
                          variant="outline" 
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
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredComputers.length)} of {filteredComputers.length} computers
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-slate-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
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