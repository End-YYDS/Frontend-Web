import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Plus, Trash2, Edit, FileDown, FileUp, Power, PowerOff } from 'lucide-react';
import type { PageComponent } from '@/types';
import axios from 'axios';
import type {
  CronJobEntry,
  GetAllResponse,
  CreateCronRequest,
  DeleteCronRequest,
  PutCronRequest,
} from './types';
import { toast } from 'sonner';

interface CronJob {
  id: number;
  username: string;
  jobName: string;
  command: string;
  schedule: string;
  status: 'active' | 'inactive';
}
type NewJobState = {
  username: string;
  jobName: string;
  command: string;
  schedule: string;
  status: 'active' | 'inactive';
  scheduleType: 'quick' | 'custom';
  quickSchedule: string;
  minute: string;
  hour: string;
  date: string;
  month: string;
  week: string;
};
const CronManagement: PageComponent = () => {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<CronJob | null>(null);
  const [newJob, setNewJob] = useState<NewJobState>({
    username: '',
    jobName: '',
    command: '',
    schedule: '',
    status: 'active',
    scheduleType: 'quick',
    quickSchedule: '',
    minute: '',
    hour: '',
    date: '',
    month: '',
    week: '',
  });
  const itemsPerPage = 10;

  const fetchJobs = async () => {
    try {
      const res = await axios.get<GetAllResponse>('/api/cron/all', { withCredentials: true });
      const jobsArray: CronJob[] = Object.entries(res.data.Jobs).map(([id, job]) => ({
        id: Number(id),
        username: job.Username,
        jobName: job.Name,
        command: job.Command,
        schedule: `${job.Schedule.Minute}/${job.Schedule.Hour}/${job.Schedule.Date}/${job.Schedule.Month}/${job.Schedule.Week}`,
        status: 'active',
      }));
      setJobs(jobsArray);
    } catch (error) {
      console.error(error);
      toast.error('Fetch Failed', {
        description: 'Failed to fetch cron jobs',
      });
    }
  };

  const addJobApi = async (job: CreateCronRequest) => {
    try {
      await axios.post('/api/cron', job, { withCredentials: true });
      toast.info('Success', { description: 'Cron job added' });
      fetchJobs();
    } catch {
      toast.error('Failed', { description: 'Failed to add cron job' });
    }
  };

  const updateJobApi = async (id: number, job: CronJobEntry) => {
    try {
      const data: PutCronRequest = { [id]: job };
      await axios.put('/api/cron', data, { withCredentials: true });
      toast.info('Success', { description: 'Cron job updated' });
      fetchJobs();
    } catch {
      toast.error('Failed', { description: 'Failed to update cron job' });
    }
  };

  const deleteJobApi = async (id: number) => {
    try {
      const data: DeleteCronRequest = { id: id.toString() };
      await axios.delete('/api/cron', { data, withCredentials: true });
      toast.info('Success', { description: 'Cron job deleted' });
      fetchJobs();
    } catch {
      toast.error('Failed', { description: 'Failed to delete cron job' });
    }
  };

  const importJobsApi = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post('/api/cron/action/import', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.info('Success', { description: 'Cron jobs imported' });
      fetchJobs();
    } catch {
      toast.error('Failed', { description: 'Failed to import cron jobs' });
    }
  };

  const exportJobsApi = async () => {
    try {
      const res = await axios.post(
        '/api/cron/action/export',
        {},
        { withCredentials: true, responseType: 'blob' },
      );
      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cron-jobs-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.info('Success', { description: 'Cron jobs exported' });
    } catch {
      toast.error('Failed', { description: 'Failed to export cron jobs' });
    }
  };
  useEffect(() => {
    fetchJobs();
  }, []);
  const resetNewJob = () => {
    setNewJob({
      username: '',
      jobName: '',
      command: '',
      schedule: '',
      status: 'active',
      scheduleType: 'quick',
      quickSchedule: '',
      minute: '',
      hour: '',
      date: '',
      month: '',
      week: '',
    });
  };

  // const buildScheduleFromCustom = () => {
  //   const parts = [];
  //   if (newJob.minute && newJob.minute !== 'none') parts.push(`Every ${newJob.minute} minutes`);
  //   if (newJob.hour && newJob.hour !== 'none') parts.push(`Every ${newJob.hour} hours`);
  //   if (newJob.date && newJob.date !== 'none') parts.push(`Day ${newJob.date} of the month`);
  //   if (newJob.month && newJob.month !== 'none') parts.push(`Every ${newJob.month} months`);
  //   if (newJob.week && newJob.week !== 'none') parts.push(`Every ${newJob.week} of the week`);
  //   return parts.join(', ') || 'Custom schedule';
  // };

  // const buildScheduleString = () => {
  //   if (newJob.scheduleType === 'quick' && newJob.quickSchedule) {
  //     switch (newJob.quickSchedule) {
  //       case 'Startup': return 'Startup';
  //       case 'Hourly': return 'Hourly';
  //       case 'Daily': return 'Daily';
  //       case 'Weekly': return 'Weekly';
  //       case 'Monthly': return 'Monthly';
  //       case 'Yearly': return 'Yearly';
  //       default: return newJob.quickSchedule;
  //     }
  //   } else if (newJob.scheduleType === 'custom') {
  //     return buildScheduleFromCustom();
  //   }
  //   return '';
  // };

  const handleCloseDialog = () => {
    if (editingJob) setEditingJob(null);
    else setIsAddDialogOpen(false);
    resetNewJob();
  };

  // -------------------- CRUD Handlers --------------------
  const handleAddJob = async () => {
    const scheduleObj = {
      Minute: parseInt(newJob.minute) || 0,
      Hour: parseInt(newJob.hour) || 0,
      Date: parseInt(newJob.date) || 0,
      Month: parseInt(newJob.month) || 0,
      Week: parseInt(newJob.week) || 0,
    };
    const payload: CreateCronRequest = {
      Name: newJob.jobName,
      Command: newJob.command,
      Username: newJob.username,
      Schedule: scheduleObj,
    };
    await addJobApi(payload);
    setIsAddDialogOpen(false);
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;
    const scheduleObj = {
      Minute: parseInt(newJob.minute) || 0,
      Hour: parseInt(newJob.hour) || 0,
      Date: parseInt(newJob.date) || 0,
      Month: parseInt(newJob.month) || 0,
      Week: parseInt(newJob.week) || 0,
    };
    const payload: CronJobEntry = {
      Name: newJob.jobName,
      Command: newJob.command,
      Username: newJob.username,
      Schedule: scheduleObj,
    };
    await updateJobApi(editingJob.id, payload);
    setEditingJob(null);
  };

  const handleDeleteJob = async (id: number) => {
    await deleteJobApi(id);
  };

  const handleDeleteSelected = async () => {
    await Promise.all(selectedJobs.map((id) => deleteJobApi(id)));
    setSelectedJobs([]);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.txt,.cron';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) await importJobsApi(file);
    };
    input.click();
  };

  const handleExport = async () => {
    await exportJobsApi();
  };

  const handleSelectJob = (jobId: number) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId],
    );
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === currentJobs.length) setSelectedJobs([]);
    else setSelectedJobs(currentJobs.map((job) => job.id));
  };

  const handleToggleStatus = async () => {
    // const job = jobs.find(j => j.id === jobId);
    // if (!job) return;
    // const newStatus = job.status === 'active' ? 'inactive' : 'active';
    // await updateJobApi(jobId, { ...job, status: newStatus });
  };

  const handleBatchEnable = async () => {
    const toEnable = selectedJobs.filter((id) => {
      const job = jobs.find((j) => j.id === id);
      return job && job.status === 'inactive';
    });
    await Promise.all(
      toEnable.map((id) => {
        const job = jobs.find((j) => j.id === id);
        if (!job) return Promise.resolve();
        const payload: CronJobEntry = {
          Name: job.jobName,
          Command: job.command,
          Username: job.username,
          Schedule: {
            Minute: parseInt(newJob.minute) || 0,
            Hour: parseInt(newJob.hour) || 0,
            Date: parseInt(newJob.date) || 0,
            Month: parseInt(newJob.month) || 0,
            Week: parseInt(newJob.week) || 0,
          },
          // status: 'active'
        };
        return updateJobApi(id, payload);
      }),
    );
    toast.info('Success', { description: 'Selected jobs have been enabled' });
  };

  const handleBatchDisable = async () => {
    const toDisable = selectedJobs.filter((id) => {
      const job = jobs.find((j) => j.id === id);
      return job && job.status === 'active';
    });
    await Promise.all(
      toDisable.map((id) =>
        updateJobApi(id, {
          ...jobs.find((j) => j.id === id),
          status: 'inactive',
        } as unknown as CronJobEntry),
      ),
    );
    toast.info('Success', { description: 'Selected jobs have been disabled' });
  };

  const handleEditJob = (job: CronJob) => {
    setEditingJob(job);
    setNewJob({
      username: job.username,
      jobName: job.jobName,
      command: job.command,
      schedule: job.schedule,
      status: job.status,
      scheduleType: 'quick',
      quickSchedule: '',
      minute: '',
      hour: '',
      date: '',
      month: '',
      week: '',
    });
  };

  // -------------------- Pagination & Filter --------------------
  const filteredJobs = jobs.filter(
    (job) =>
      job.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.command.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className='container mx-auto py-6 px-4'>
      <div className='bg-[#A8AEBD] py-1.5 mb-6'>
        <h1 className='text-4xl font-extrabold text-center text-[#E6E6E6]'>Cron Management</h1>
      </div>
      <Card>
        <CardContent>
          <div className='flex flex-wrap gap-2 mb-4'>
            <Dialog
              open={isAddDialogOpen || !!editingJob}
              onOpenChange={(open) => !open && handleCloseDialog()}
            >
              <DialogTrigger asChild>
                <Button
                  style={{ backgroundColor: '#7B86AA' }}
                  className='hover:opacity-90'
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className='h-4 w-4 mr-1' />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-md mx-auto'>
                <DialogHeader>
                  <DialogTitle>{editingJob ? 'Edit Cron Job' : 'Create a new cron'}</DialogTitle>
                </DialogHeader>
                <div className='space-y-4'>
                  <div>
                    <label className='text-sm font-medium mb-1 block'>Username</label>
                    <Input
                      placeholder='enter username'
                      value={newJob.username}
                      onChange={(e) => setNewJob({ ...newJob, username: e.target.value })}
                      className='w-full'
                    />
                  </div>

                  <div>
                    <label className='text-sm font-medium mb-1 block'>Job name</label>
                    <Input
                      placeholder='enter job name'
                      value={newJob.jobName}
                      onChange={(e) => setNewJob({ ...newJob, jobName: e.target.value })}
                      className='w-full'
                    />
                  </div>

                  <div>
                    <label className='text-sm font-medium mb-1 block'>Command</label>
                    <Input
                      placeholder='enter command'
                      value={newJob.command}
                      onChange={(e) => setNewJob({ ...newJob, command: e.target.value })}
                      className='w-full'
                    />
                  </div>

                  <div>
                    <label className='text-sm font-medium mb-2 block'>Schedule Type</label>
                    <div className='flex gap-4 mb-3'>
                      <label className='flex items-center'>
                        <input
                          type='radio'
                          name='scheduleType'
                          value='quick'
                          checked={newJob.scheduleType === 'quick'}
                          onChange={() =>
                            setNewJob({
                              ...newJob,
                              scheduleType: 'quick',
                              quickSchedule: '',
                              minute: '',
                              hour: '',
                              date: '',
                              month: '',
                              week: '',
                            })
                          }
                          className='mr-2'
                        />
                        Quick Schedule
                      </label>
                      <label className='flex items-center'>
                        <input
                          type='radio'
                          name='scheduleType'
                          value='custom'
                          checked={newJob.scheduleType === 'custom'}
                          onChange={() =>
                            setNewJob({ ...newJob, scheduleType: 'custom', quickSchedule: '' })
                          }
                          className='mr-2'
                        />
                        Custom Schedule
                      </label>
                    </div>
                  </div>

                  {newJob.scheduleType === 'quick' && (
                    <div>
                      <label className='text-sm font-medium mb-2 block'>Quick Schedule</label>
                      <div className='flex flex-wrap gap-2 mb-3'>
                        {['Startup', 'Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly'].map(
                          (schedule) => (
                            <Button
                              key={schedule}
                              variant={newJob.quickSchedule === schedule ? 'default' : 'outline'}
                              size='sm'
                              onClick={() => setNewJob({ ...newJob, quickSchedule: schedule })}
                              className='text-xs'
                            >
                              {schedule}
                            </Button>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {newJob.scheduleType === 'custom' && (
                    <div className='grid grid-cols-5 gap-2'>
                      <div>
                        <label className='text-xs text-gray-600 mb-1 block'>Minute</label>
                        <Select
                          value={newJob.minute}
                          onValueChange={(value) => setNewJob({ ...newJob, minute: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='none'>None</SelectItem>
                            <SelectItem value='1'>1</SelectItem>
                            <SelectItem value='5'>5</SelectItem>
                            <SelectItem value='10'>10</SelectItem>
                            <SelectItem value='15'>15</SelectItem>
                            <SelectItem value='30'>30</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className='text-xs text-gray-600 mb-1 block'>Hour</label>
                        <Select
                          value={newJob.hour}
                          onValueChange={(value) => setNewJob({ ...newJob, hour: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='none'>None</SelectItem>
                            <SelectItem value='1'>1</SelectItem>
                            <SelectItem value='2'>2</SelectItem>
                            <SelectItem value='6'>6</SelectItem>
                            <SelectItem value='12'>12</SelectItem>
                            <SelectItem value='24'>24</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className='text-xs text-gray-600 mb-1 block'>Date</label>
                        <Select
                          value={newJob.date}
                          onValueChange={(value) => setNewJob({ ...newJob, date: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='none'>None</SelectItem>
                            <SelectItem value='1'>1</SelectItem>
                            <SelectItem value='15'>15</SelectItem>
                            <SelectItem value='28'>28</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className='text-xs text-gray-600 mb-1 block'>Month</label>
                        <Select
                          value={newJob.month}
                          onValueChange={(value) => setNewJob({ ...newJob, month: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='none'>None</SelectItem>
                            <SelectItem value='1'>1</SelectItem>
                            <SelectItem value='3'>3</SelectItem>
                            <SelectItem value='6'>6</SelectItem>
                            <SelectItem value='12'>12</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className='text-xs text-gray-600 mb-1 block'>Week</label>
                        <Select
                          value={newJob.week}
                          onValueChange={(value) => setNewJob({ ...newJob, week: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='none'>None</SelectItem>
                            <SelectItem value='1'>Monday</SelectItem>
                            <SelectItem value='2'>Tuesday</SelectItem>
                            <SelectItem value='3'>Wednesday</SelectItem>
                            <SelectItem value='4'>Thursday</SelectItem>
                            <SelectItem value='5'>Friday</SelectItem>
                            <SelectItem value='6'>Saturday</SelectItem>
                            <SelectItem value='7'>Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className='flex justify-end gap-2 pt-2'>
                    <Button variant='outline' onClick={handleCloseDialog} size='sm'>
                      Cancel
                    </Button>
                    <Button
                      onClick={editingJob ? handleUpdateJob : handleAddJob}
                      style={{ backgroundColor: '#7B86AA' }}
                      className='hover:opacity-90'
                      size='sm'
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
                  variant='destructive'
                  disabled={selectedJobs.length === 0}
                  className='bg-red-500 hover:bg-red-600'
                >
                  <Trash2 className='h-4 w-4 mr-1' />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the selected Cron jobs? This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteSelected}
                    className='bg-red-500 hover:bg-red-600'
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant='outline' onClick={handleImport}>
              <FileUp className='h-4 w-4 mr-1' />
              Import
            </Button>

            <Button variant='outline' onClick={handleExport}>
              <FileDown className='h-4 w-4 mr-1' />
              Export
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant='outline'
                  disabled={
                    selectedJobs.length === 0 ||
                    !selectedJobs.some((id) => {
                      const job = jobs.find((j) => j.id === id);
                      return job && job.status === 'inactive';
                    })
                  }
                >
                  <Power className='h-4 w-4 mr-1' />
                  Enable
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Enable</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to enable the selected Cron jobs?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBatchEnable}
                    style={{ backgroundColor: '#7B86AA' }}
                    className='hover:opacity-90'
                  >
                    Enable
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant='outline'
                  disabled={
                    selectedJobs.length === 0 ||
                    !selectedJobs.some((id) => {
                      const job = jobs.find((j) => j.id === id);
                      return job && job.status === 'active';
                    })
                  }
                >
                  <PowerOff className='h-4 w-4 mr-1' />
                  Disable
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Disable</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to disable the selected Cron jobs?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBatchDisable}
                    style={{ backgroundColor: '#7B86AA' }}
                    className='hover:opacity-90'
                  >
                    Disable
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className='mb-4'>
            <Input
              placeholder='Search...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='max-w-sm'
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-12'>
                  <input
                    type='checkbox'
                    checked={selectedJobs.length === currentJobs.length && currentJobs.length > 0}
                    onChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Job Name</TableHead>
                <TableHead>Command</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Operation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <input
                      type='checkbox'
                      checked={selectedJobs.includes(job.id)}
                      onChange={() => handleSelectJob(job.id)}
                    />
                  </TableCell>
                  <TableCell>{job.username}</TableCell>
                  <TableCell>{job.jobName}</TableCell>
                  <TableCell>{job.command}</TableCell>
                  <TableCell>{job.schedule}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        job.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {job.status === 'active' ? 'On' : 'Off'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-1'>
                      <Button variant='ghost' size='sm' onClick={() => handleEditJob(job)}>
                        <Edit className='h-3 w-3' />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            disabled={
                              job.status === 'active'
                                ? false
                                : job.status === 'inactive'
                                ? false
                                : false
                            }
                          >
                            {job.status === 'active' ? (
                              <PowerOff className='h-3 w-3' />
                            ) : (
                              <Power className='h-3 w-3' />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {job.status === 'active' ? 'Confirm Disable' : 'Confirm Enable'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to{' '}
                              {job.status === 'active' ? 'disable' : 'enable'} this Cron job?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleToggleStatus()}
                              style={{ backgroundColor: '#7B86AA' }}
                              className='hover:opacity-90'
                            >
                              {job.status === 'active' ? 'Disable' : 'Enable'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-red-500 hover:text-red-700 hover:bg-red-50'
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this Cron job? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteJob(job.id)}
                              className='bg-red-500 hover:bg-red-600'
                            >
                              Delete
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
            <div className='mt-4 flex justify-between items-center'>
              <div className='text-sm text-gray-500'>
                Showing {startIndex + 1} to{' '}
                {Math.min(startIndex + itemsPerPage, filteredJobs.length)} of {filteredJobs.length}{' '}
                entries
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={
                        currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className='cursor-pointer'
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={
                        currentPage === totalPages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
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

CronManagement.meta = {
  requiresAuth: true,
  layout: true,
};

export default CronManagement;
