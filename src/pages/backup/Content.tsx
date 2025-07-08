
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function BackupContent() {
  const [backupHistory, setBackupHistory] = useState([
    { id: 1, filename: 'Backup_0512', date: '2025/5/12', time: '11:40' },
    { id: 2, filename: 'Backup_0428', date: '2025/4/28', time: '22:22' },
    { id: 3, filename: 'Backup_0422', date: '2025/4/22', time: '06:30' },
    { id: 4, filename: 'Backup_0410', date: '2025/4/10', time: '06:30' },
    { id: 5, filename: 'Backup_0330', date: '2025/3/30', time: '03:00' },
  ]);
  
  const [filename, setFilename] = useState('');
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);

  const handleBackupNow = () => {
    if (!filename.trim()) {
      toast.error('請輸入檔案名稱');
      return;
    }

    const now = new Date();
    const newBackup = {
      id: Math.max(...backupHistory.map(b => b.id)) + 1,
      filename: filename.trim(),
      date: `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`,
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    };

    setBackupHistory(prev => [newBackup, ...prev]);
    setFilename('');
    setIsBackupDialogOpen(false);
    
    toast.success(`備份檔案 "${filename}" 已成功建立`);

    console.log('Creating new backup...');
  };

  const handleRestore = (backup: any) => {
    toast.success(`已從 "${backup.filename}" 還原`);
    console.log('Restoring backup:', backup.filename);
  };

  const handleDelete = (backupId: number) => {
    const backup = backupHistory.find(b => b.id === backupId);
    setBackupHistory(prev => prev.filter(backup => backup.id !== backupId));
    toast.success(`已刪除備份 "${backup?.filename}"`);
    console.log('Deleted backup with ID:', backupId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br">   

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-2" 
            style={{ color: '#E6E6E6', backgroundColor: '#A8AEBD' }}
          >
            Role
          </h1>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Backup Now Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-600 mb-4">Backup Now</h2>
            <div className="flex items-center gap-4">
              <Dialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    style={{ backgroundColor: '#7B86AA' }}
                    className="hover:opacity-80 text-white px-6 py-2"
                  >
                    Backup now
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>建立新備份</DialogTitle>
                    <DialogDescription>
                      請輸入備份檔案名稱
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Input
                      placeholder="輸入檔案名稱"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBackupDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleBackupNow}>
                      確認
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <span className="text-gray-500">Back up all current settings immediately</span>
            </div>
          </div>

          {/* Backup History Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-600 mb-4">Backup History</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="w-40"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backupHistory.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell>{backup.id}.</TableCell>
                    <TableCell>{backup.filename}</TableCell>
                    <TableCell>{backup.date}</TableCell>
                    <TableCell>{backup.time}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              style={{ backgroundColor: '#7B86AA', borderColor: '#7B86AA' }}
                              className="text-white hover:opacity-80"
                            >
                              Restore
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Restore</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to restore from "{backup.filename}"? This will replace all current settings.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRestore(backup)}>
                                Restore
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              style={{ backgroundColor: '#7B86AA', borderColor: '#7B86AA' }}
                              className="text-white hover:bg-red-500 hover:border-red-500 transition-all duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Backup</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{backup.filename}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(backup.id)}
                                className="bg-red-500 hover:bg-red-600"
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
    </div>
  );
}