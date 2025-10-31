import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import type {
  BackupLocation,
  GetBackupsResponse,
  InnerGetBackupResponse,
  PostBackupReductionRequest,
  PostBackupRequest,
  PostBackupResponse,
} from './types';

// ---------- Types ----------
interface Backup {
  id: string;
  filename: string;
  date: string;
  time: string;
  downloadUrl?: string;
}

// ---------- BackupContent Component ----------
export function BackupContent() {
  const [backupHistory, setBackupHistory] = useState<Backup[]>([]);
  const [filename, setFilename] = useState('');
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);

  // ---------- API Functions (use axios) ----------
  const fetchBackupHistoryApi = async () => {
    try {
      const res = await axios.get<GetBackupsResponse>('/api/chm/backup', { params: { limit: 5 } });
      const data = res.data;
      const backups = data?.Backups.map((b: InnerGetBackupResponse, idx: number) => ({
        id: `${idx}`,
        filename: b.Name,
        date: `${b.Year}/${String(b.Month).padStart(2, '0')}/${String(b.Day).padStart(2, '0')}`,
        time: `${String(b.Time.Hour).padStart(2, '0')}:${String(b.Time.Min).padStart(2, '0')}`,
      }));
      setBackupHistory(backups);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to fetch backup history');
    }
  };

  const backupNowApi = async (name: string, location: BackupLocation): Promise<Backup> => {
    let sendData: PostBackupRequest = {
      Type: location,
      Name: name,
    };
    const res = await axios.post<PostBackupResponse>('/api/chm/backup', sendData);
    const data = res.data;
    if (data.Type !== 'Ok') throw new Error(data.Message);

    let returnData: Backup = {
      id: data?.Id,
      filename: name,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      downloadUrl: data.DownloadUrl,
    };
    return returnData;
  };

  const restoreBackupApi = async (backup: Backup, location: BackupLocation) => {
    let sendData: PostBackupReductionRequest =
      location === 'Local'
        ? { Type: 'Local', Name: backup.filename }
        : { Type: 'Remote', File: backup.filename }; // TODO: 要轉成二進制 Blob
    const res = await axios.post('/api/chm/backup/reduction', sendData);
    const data = res.data;
    if (data.Type !== 'OK') throw new Error(data.Message);
  };

  // ---------- Handlers ----------
  const handleBackupNow = async () => {
    if (!filename.trim()) {
      toast.error('Please enter a file name');
      return;
    }

    try {
      const newBackup: Backup = await backupNowApi(filename, 'Local');
      setBackupHistory((prev) => [newBackup, ...prev].slice(0, 5));
      setFilename('');
      setIsBackupDialogOpen(false);
      toast.success(`Backup file "${newBackup.filename}" has been created`);
    } catch (err: any) {
      toast.error(err.message || 'Backup failed');
    }
  };

  const handleRestore = async (backup: Backup) => {
    try {
      await restoreBackupApi(backup, 'Local');
      toast.success(`Restored from "${backup.filename}"`);
    } catch (err: any) {
      toast.error(err.message || 'Restore failed');
    }
  };

  const handleDelete = (backupId: string) => {
    const backup = backupHistory.find((b) => b.id === backupId);
    setBackupHistory((prev) => prev.filter((b) => b.id !== backupId));
    toast.success(`Deleted backup "${backup?.filename}"`);
  };

  useEffect(() => {
    fetchBackupHistoryApi();
  }, []);

  // ---------- Render ----------
  return (
    <div className='container mx-auto py-6 px-4'>
      <div className='bg-[#A8AEBD] py-1.5 mb-6'>
        <h1 className='text-4xl font-extrabold text-center text-[#E6E6E6]'>Backup</h1>
      </div>

      <div className='bg-white rounded-lg shadow-sm p-6'>
        {/* Backup Now Section */}
        <div className='mb-8'>
          <h2 className='text-xl font-semibold text-gray-600 mb-4'>Backup Now</h2>
          <div className='flex items-center gap-4'>
            <Dialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  style={{ backgroundColor: '#7B86AA' }}
                  className='hover:opacity-90 text-white px-6 py-2'
                >
                  Backup now
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Backup</DialogTitle>
                  <DialogDescription>Please enter backup file name</DialogDescription>
                </DialogHeader>
                <div className='py-4'>
                  <Input
                    placeholder='Enter file name'
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant='outline' onClick={() => setIsBackupDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    style={{ backgroundColor: '#7B86AA' }}
                    className='hover:opacity-90 text-white'
                    onClick={handleBackupNow}
                  >
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <span className='text-gray-500'>Back up all current settings immediately</span>
          </div>
        </div>

        {/* Backup History Section */}
        <div>
          <h2 className='text-xl font-semibold text-gray-600 mb-4'>Backup History</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className='w-40'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backupHistory.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell>{backup.filename}</TableCell>
                  <TableCell>{backup.date}</TableCell>
                  <TableCell>{backup.time}</TableCell>
                  <TableCell>
                    <div className='flex gap-2'>
                      {/* Restore Dialog */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size='sm'
                            style={{ backgroundColor: '#7B86AA' }}
                            className='text-white hover:opacity-90'
                          >
                            Restore
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Restore</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to restore from "{backup.filename}"? This will
                              replace all current settings.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              style={{ backgroundColor: '#7B86AA' }}
                              className='hover:opacity-90 text-white'
                              onClick={() => handleRestore(backup)}
                            >
                              Restore
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {/* Delete Dialog */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-red-500 hover:text-red-700 hover:bg-red-50'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Backup</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{backup.filename}"? This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(backup.id)}
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
        </div>
      </div>
    </div>
  );
}
