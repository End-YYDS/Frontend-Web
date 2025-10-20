import { useEffect, useState } from 'react';
import { ComputerList } from './ComputerList';
import { ComputerDetail } from "./ComputerDetail";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import type { PcsUuid, GetAllPcResponse } from './types';

interface Computer {
  id: string;
  name: string;
  uuid: string;
  status: 'online' | 'offline';
  Cpu: number;
  Memory: number;
}

const ServerContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [selectedComputersForInstall, setSelectedComputersForInstall] = useState<string[]>([]);
  const [computers, setComputers] = useState<Computer[]>([]);
  const { toast } = useToast();

  const [installComputer, setInstallComputer] = useState<PcsUuid[]>([
    { Status: true, Hostname: 'name', Ip: 'string' },
    { Status: true, Hostname: 'name2', Ip: 'string2' },
    { Status: true, Hostname: 'name3', Ip: 'string3' },
  ]);

  // 取得線上電腦資料
  const getOnlineComputers = async () => {
    try {
      const { data } = await axios.post<GetAllPcResponse>('/api/chm/pc/all');

      if (!data || !data.Pcs || Object.keys(data.Pcs).length === 0) {
        toast({
          title: 'No Online Computers',
          description: 'There are currently no online computers available.',
          variant: 'destructive',
        });
        setComputers([]);
        return;
      }

      // 將 Record<string, Cluster> 轉為陣列格式
      const pcsArray = Object.keys(data.Pcs);

      // const pcsArray: Computer[] = Object.entries(data.Pcs).map(([id, cluster]) => ({
      //   id,
      //   name: id,
      //   uuid: id,
      //   status: 'online',
      //   cluster,
      // }));

      // setComputers(pcsArray);
      console.log('Online PCs:', pcsArray);
    } catch (error) {
      console.error('Error fetching online computers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch online computers.',
        variant: 'destructive',
      });
      setInstallComputer([
        { Status: true, Hostname: 'name', Ip: 'string' },
        { Status: true, Hostname: 'name2', Ip: 'string2' },
        { Status: true, Hostname: 'name3', Ip: 'string3' },
      ]);
    }
  };

  useEffect(() => {
    getOnlineComputers();
  }, []);

  const handleComputerToggle = (computerId: string) => {
    setSelectedComputersForInstall((prev) =>
      prev.includes(computerId) ? prev.filter((id) => id !== computerId) : [...prev, computerId],
    );
  };

  const handleInstallServer = async () => {
    if (selectedComputersForInstall.length === 0) {
      toast({
        title: 'Select Computers',
        description: 'Please select at least one computer to install.',
        variant: 'destructive',
      });
      return;
    }

    setIsInstalling(true);

    setTimeout(() => {
      setIsInstalling(false);
      setInstallDialogOpen(false);
      setSelectedComputersForInstall([]);
      toast({
        title: 'Installation Successful',
        description: `Server has been installed on the selected computers.`,
      });
    }, 2000);
  };

  // 點進去詳細資料
  // if (selectedComputer) {
  //     return (
  //       <ComputerDetail 
  //         serverId={selectedServer || ""}
  //         computerId={selectedComputer}
  //         onBack={() => onComputerSelect(null)}
  //       />
  //     );
  //   }

  return (
    <div>
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <div></div>
          <div className='flex items-center gap-2'>
            {/* 安裝按鈕 + 對話框 */}
            <Dialog open={installDialogOpen} onOpenChange={setInstallDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  style={{ backgroundColor: '#7B86AA' }}
                  className='hover:opacity-80 text-white'
                >
                  <Download className='w-4 h-4 mr-2' />
                  Install
                </Button>
              </DialogTrigger>

              <DialogContent className='max-w-md'>
                <DialogHeader>
                  <DialogTitle>Install Apache</DialogTitle>
                </DialogHeader>

                <div className='space-y-4'>
                  <p className='text-sm text-slate-600'>Select computers to install Apache on:</p>

                  <div className='space-y-2 max-h-60 overflow-y-auto'>
                    {computers
                      .filter((computer) =>
                        computer.name.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .filter((computer) => computer.status === 'online')
                      .map((computer) => (
                        <div
                          key={computer.id}
                          className='flex items-center space-x-2 p-2 border rounded'
                        >
                          <Checkbox
                            id={computer.id}
                            checked={selectedComputersForInstall.includes(computer.id)}
                            onCheckedChange={() => handleComputerToggle(computer.id)}
                          />
                          <label htmlFor={computer.id} className='flex-1 cursor-pointer'>
                            <div className='flex items-center justify-between'>
                              <span className='font-medium'>{computer.name}</span>
                            </div>
                            <p className='text-xs text-slate-500'>
                              {computer.uuid} | CPU: {computer.Cpu}% MEM: {computer.Memory}%
                            </p>
                          </label>
                        </div>
                      ))}
                  </div>

                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='outline'
                      onClick={() => setInstallDialogOpen(false)}
                      disabled={isInstalling}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleInstallServer}
                      disabled={isInstalling || selectedComputersForInstall.length === 0}
                      style={{ backgroundColor: '#7B86AA' }}
                      className='hover:opacity-80 text-white'
                    >
                      {isInstalling ? (
                        <>
                          <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                          Installing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className='w-4 h-4 mr-2' />
                          Confirm Install
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* 搜尋欄 */}
            <div className='relative'>
              <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
              <Input
                placeholder='Search computers...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 w-64'
              />
            </div>
          </div>
        </div>
      </div>

      {/* 電腦列表顯示 */}
      <ComputerList />
    </div>
  );
};

export default ServerContent;
