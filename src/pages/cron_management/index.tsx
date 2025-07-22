import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Plus, Trash2, Edit, FileDown, FileUp, Power, PowerOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CronJob {
  id: number;
  username: string;
  jobName: string;
  command: string;
  schedule: string;
  status: 'active' | 'inactive';
}

const CronManagement = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<CronJob[]>([
    {
      id: 1,
      username: 'user1',
      jobName: 'cache cleaner',
      command: 'rm -rf /var/cache',
      schedule: '@Startup',
      status: 'active'
    },
    {
      id: 2,
      username: 'user2',
      jobName: 'keep alive',
      command: 'ping google.com',
      schedule: 'Daily',
      status: 'inactive'
    },
    {
      id: 3,
      username: 'user1',
      jobName: 'logger',
      command: '/usr/bin/find',
      schedule: '30minute/1hour',
      status: 'inactive'
    }
  ]);

  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<CronJob | null>(null);
  const [newJob, setNewJob] = useState({
    username: '',
    jobName: '',
    command: '',
    schedule: '',
    status: 'active' as 'active' | 'inactive',
    quickSchedule: '',
    minute: '*',
    hour: '*',
    date: '*',
    month: '*',
    week: '*'
  });

  const itemsPerPage = 10;

  const filteredJobs = jobs.filter(job =>
    job.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.command.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectJob = (jobId: number) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === currentJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(currentJobs.map(job => job.id));
    }
  };

  const resetNewJob = () => {
    setNewJob({
      username: '',
      jobName: '',
      command: '',
      schedule: '',
      status: 'active',
      quickSchedule: '',
      minute: '*',
      hour: '*',
      date: '*',
      month: '*',
      week: '*'
    });
  };

  const buildScheduleFromQuick = (quickSchedule: string) => {
    switch (quickSchedule) {
      case 'Startup':
        return '@startup';
      case 'Hourly':
        return '@hourly';
      case 'Daily':
        return '@daily';
      case 'Weekly':
        return '@weekly';
      case 'Monthly':
        return '@monthly';
      case 'Yearly':
        return '@yearly';
      default:
        return `${newJob.minute} ${newJob.hour} ${newJob.date} ${newJob.month} ${newJob.week}`;
    }
  };

  const handleAddJob = () => {
    const schedule = newJob.quickSchedule ? buildScheduleFromQuick(newJob.quickSchedule) : buildScheduleFromQuick('');
    
    const job: CronJob = {
      id: Date.now(),
      username: newJob.username,
      jobName: newJob.jobName,
      command: newJob.command,
      schedule: schedule,
      status: newJob.status
    };
    setJobs(prev => [...prev, job]);
    resetNewJob();
    setIsAddDialogOpen(false);
    toast({
      title: "成功",
      description: "Cron 任務已新增"
    });
  };

  const handleEditJob = (job: CronJob) => {
    setEditingJob(job);
    setNewJob({
      username: job.username,
      jobName: job.jobName,
      command: job.command,
      schedule: job.schedule,
      status: job.status,
      quickSchedule: '',
      minute: '*',
      hour: '*',
      date: '*',
      month: '*',
      week: '*'
    });
  };

  const handleUpdateJob = () => {
    if (editingJob) {
      const schedule = newJob.quickSchedule ? buildScheduleFromQuick(newJob.quickSchedule) : buildScheduleFromQuick('');
      
      setJobs(prev => prev.map(job => 
        job.id === editingJob.id 
          ? { ...job, username: newJob.username, jobName: newJob.jobName, command: newJob.command, schedule: schedule, status: newJob.status }
          : job
      ));
      setEditingJob(null);
      resetNewJob();
      toast({
        title: "成功",
        description: "Cron 任務已更新"
      });
    }
  };

  const handleDeleteSelected = () => {
    setJobs(prev => prev.filter(job => !selectedJobs.includes(job.id)));
    setSelectedJobs([]);
    toast({
      title: "成功",
      description: "選中的 Cron 任務已刪除"
    });
  };

  const handleToggleStatus = (jobId: number) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: job.status === 'active' ? 'inactive' : 'active' }
        : job
    ));
  };

  const handleBatchEnable = () => {
    selectedJobs.forEach(jobId => {
      const job = jobs.find(j => j.id === jobId);
      if (job && job.status === 'inactive') {
        handleToggleStatus(jobId);
      }
    });
    toast({
      title: "成功",
      description: "選中的任務已啟用"
    });
  };

  const handleBatchDisable = () => {
    selectedJobs.forEach(jobId => {
      const job = jobs.find(j => j.id === jobId);
      if (job && job.status === 'active') {
        handleToggleStatus(jobId);
      }
    });
    toast({
      title: "成功",
      description: "選中的任務已停用"
    });
  };

  const handleExport = () => {
    toast({
      title: "匯出",
      description: "Cron 任務匯出功能"
    });
  };

  const handleImport = () => {
    toast({
      title: "匯入",
      description: "Cron 任務匯入功能"
    });
  };

  const handleDeleteJob = (jobId: number) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
    toast({
      title: "成功",
      description: "Cron 任務已刪除"
    });
  };

  const handleCloseDialog = () => {
    if (editingJob) {
      setEditingJob(null);
    } else {
      setIsAddDialogOpen(false);
    }
    resetNewJob();
  };

  return (
    <div className="container mx-auto py-6 px-4">
        <div className="bg-[#A8AEBD] py-3 mb-3">
        <h1 className="text-2xl font-extrabold text-center text-[#E6E6E6]">
            Cron Management
        </h1>
        </div>
      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Dialog open={isAddDialogOpen || !!editingJob} onOpenChange={(open) => !open && handleCloseDialog()}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-[#7B86AA] hover:bg-[#7B86AA]"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle>{editingJob ? '編輯 Cron 任務' : 'Create a new cron'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Username</label>
                    <Input
                      placeholder="enter username"
                      value={newJob.username}
                      onChange={(e) => setNewJob({...newJob, username: e.target.value})}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Job</label>
                    <Input
                      placeholder="enter job"
                      value={newJob.jobName}
                      onChange={(e) => setNewJob({...newJob, jobName: e.target.value})}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Command</label>
                    <Input
                      placeholder="enter command"
                      value={newJob.command}
                      onChange={(e) => setNewJob({...newJob, command: e.target.value})}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Quick Schedule</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['Startup', 'Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly'].map((schedule) => (
                        <Button
                          key={schedule}
                          variant={newJob.quickSchedule === schedule ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNewJob({...newJob, quickSchedule: schedule})}
                          className="text-xs"
                        >
                          {schedule}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Minute</label>
                      <Select value={newJob.minute} onValueChange={(value) => setNewJob({...newJob, minute: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="*">*</SelectItem>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="30">30</SelectItem>
                          <SelectItem value="45">45</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Hour</label>
                      <Select value={newJob.hour} onValueChange={(value) => setNewJob({...newJob, hour: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="*">*</SelectItem>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="6">6</SelectItem>
                          <SelectItem value="12">12</SelectItem>
                          <SelectItem value="18">18</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Date</label>
                      <Select value={newJob.date} onValueChange={(value) => setNewJob({...newJob, date: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="*">*</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="28">28</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Month</label>
                      <Select value={newJob.month} onValueChange={(value) => setNewJob({...newJob, month: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="*">*</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="6">6</SelectItem>
                          <SelectItem value="12">12</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Week</label>
                      <Select value={newJob.week} onValueChange={(value) => setNewJob({...newJob, week: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="*">*</SelectItem>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="6">6</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={handleCloseDialog}
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={editingJob ? handleUpdateJob : handleAddJob}
                      className="bg-[#7B86AA] hover:bg-[#7B86AA]"
                      size="sm"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  disabled={selectedJobs.length === 0}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>確認刪除</AlertDialogTitle>
                  <AlertDialogDescription>
                    您確定要刪除選中的 Cron 任務嗎？此操作無法撤銷。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteSelected}>
                    刪除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="outline" onClick={handleImport}>
              <FileUp className="h-4 w-4 mr-1" />
              Import
            </Button>

            <Button variant="outline" onClick={handleExport}>
              <FileDown className="h-4 w-4 mr-1" />
              Export
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  disabled={selectedJobs.length === 0 || !selectedJobs.some(id => {
                    const job = jobs.find(j => j.id === id);
                    return job && job.status === 'inactive';
                  })}
                >
                  <Power className="h-4 w-4 mr-1" />
                  Enable
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>確認啟用</AlertDialogTitle>
                  <AlertDialogDescription>
                    您確定要啟用選中的 Cron 任務嗎？
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBatchEnable}>
                    啟用
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  disabled={selectedJobs.length === 0 || !selectedJobs.some(id => {
                    const job = jobs.find(j => j.id === id);
                    return job && job.status === 'active';
                  })}
                >
                  <PowerOff className="h-4 w-4 mr-1" />
                  Disable
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>確認停用</AlertDialogTitle>
                  <AlertDialogDescription>
                    您確定要停用選中的 Cron 任務嗎？
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBatchDisable}>
                    停用
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="mb-4">
            <Input
              placeholder="搜尋..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedJobs.length === currentJobs.length && currentJobs.length > 0}
                    onChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>使用者名稱</TableHead>
                <TableHead>排程名稱</TableHead>
                <TableHead>指令</TableHead>
                <TableHead>時間</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentJobs.map(job => (
                <TableRow key={job.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job.id)}
                      onChange={() => handleSelectJob(job.id)}
                    />
                  </TableCell>
                  <TableCell>{job.username}</TableCell>
                  <TableCell>{job.jobName}</TableCell>
                  <TableCell>{job.command}</TableCell>
                  <TableCell>{job.schedule}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      job.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {job.status === 'active' ? 'On' : 'Off'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditJob(job)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={job.status === 'active' ? false : job.status === 'inactive' ? false : false}
                          >
                            {job.status === 'active' ? (
                              <PowerOff className="h-3 w-3" />
                            ) : (
                              <Power className="h-3 w-3" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {job.status === 'active' ? '確認停用' : '確認啟用'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              您確定要{job.status === 'active' ? '停用' : '啟用'}此 Cron 任務嗎？
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleToggleStatus(job.id)}>
                              {job.status === 'active' ? '停用' : '啟用'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>確認刪除</AlertDialogTitle>
                            <AlertDialogDescription>
                              您確定要刪除此 Cron 任務嗎？此操作無法撤銷。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteJob(job.id)}>
                              刪除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                顯示 {startIndex + 1} 到 {Math.min(startIndex + itemsPerPage, filteredJobs.length)} 共 {filteredJobs.length} 筆
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CronManagement;