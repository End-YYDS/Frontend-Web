import { useEffect, useState, useCallback, useMemo } from 'react';
import { ComputerList } from './ComputerList';
import { ComputerDetail } from './ComputerDetail';
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
import axios from 'axios';
import type { PcsUuid, GetAllPcResponse } from './types';
import { toast } from 'sonner';

interface Computer {
  id: string;
  name: string;
  uuid: string;
  status: 'online' | 'offline';
}

const ServerContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [selectedComputersForInstall, setSelectedComputersForInstall] = useState<string[]>([]);
  const [computers, setComputers] = useState<Computer[]>([]);
  const [selectedComputerId, setSelectedComputerId] = useState<string | null>(null);

  const installComputer = useMemo<PcsUuid[]>(
    () => [
      { Status: true, Hostname: 'ServerA', Ip: '192.168.0.10' },
      { Status: true, Hostname: 'ServerB', Ip: '192.168.0.11' },
      { Status: false, Hostname: 'ServerC', Ip: '192.168.0.12' },
    ],
    [],
  );

  const getOnlineComputers = useCallback(async () => {
    try {
      const { data } = await axios.post<GetAllPcResponse>('/api/chm/pc/all');

      if (!data || !data.Pcs || Object.keys(data.Pcs).length === 0) {
        setComputers(
          installComputer.map((pc, idx) => ({
            id: `mock-${idx}`,
            name: pc.Hostname,
            uuid: `uuid-${idx}`,
            status: pc.Status ? 'online' : 'offline',
          })),
        );
        return;
      }

      const pcsArray: Computer[] = Object.entries(data.Pcs).map(([uuid, pc]) => ({
        id: uuid,
        name: pc.Hostname || uuid,
        uuid,
        status: pc.Status ? 'online' : 'offline',
      }));

      setComputers(pcsArray);
    } catch {
      toast.error('Error', { description: 'Failed to fetch computer list, using test data.' });
      setComputers(
        installComputer.map((pc, idx) => ({
          id: `mock-${idx}`,
          name: pc.Hostname,
          uuid: `uuid-${idx}`,
          status: pc.Status ? 'online' : 'offline',
        })),
      );
    }
  }, [installComputer]);

  useEffect(() => {
    void getOnlineComputers();
  }, [getOnlineComputers]);

  const handleComputerToggle = (computerId: string) => {
    setSelectedComputersForInstall((prev) =>
      prev.includes(computerId) ? prev.filter((id) => id !== computerId) : [...prev, computerId],
    );
  };

  const handleComputerSelect = (computerId: string) => {
    setSelectedComputerId(computerId);
  };

  const handleBackToList = () => {
    setSelectedComputerId(null);
  };

  const handleInstallServer = async () => {
    if (selectedComputersForInstall.length === 0) {
      toast.error('Error', { description: 'Please select at least one computer to install on.' });
      return;
    }

    setIsInstalling(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Success', {
        description: `Successfully installed Bind on ${selectedComputersForInstall.length} computers.`,
      });
      setInstallDialogOpen(false);
      setSelectedComputersForInstall([]);
    } catch {
      toast.error('Error', { description: 'Installation failed, please try again later.' });
    } finally {
      setIsInstalling(false);
    }
  };

  if (selectedComputerId) {
    return <ComputerDetail computerId={selectedComputerId} onBack={handleBackToList} />;
  }

  return (
    <div>
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <div></div>
          <div className='flex items-center gap-2'>
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
                  <DialogTitle>Install Bind</DialogTitle>
                </DialogHeader>

                <div className='space-y-4'>
                  <p className='text-sm text-slate-600'>Select computers to install Bind on:</p>

                  <div className='space-y-2 max-h-60 overflow-y-auto'>
                    {computers
                      .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .filter((c) => c.status === 'online')
                      .map((c) => (
                        <div key={c.id} className='flex items-center space-x-2 p-2 border rounded'>
                          <Checkbox
                            id={c.id}
                            checked={selectedComputersForInstall.includes(c.id)}
                            onCheckedChange={() => handleComputerToggle(c.id)}
                          />
                          <label htmlFor={c.id} className='flex-1 cursor-pointer'>
                            <span className='font-medium'>{c.name}</span>
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

      <ComputerList searchTerm={searchTerm} onComputerSelect={handleComputerSelect} />
    </div>
  );
};

export default ServerContent;
