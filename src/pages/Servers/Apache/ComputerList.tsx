import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Cpu, MemoryStick } from 'lucide-react';
import { toast } from 'sonner';
import { getInstalled, type CommonInfo, type Status } from '@/api/openapi-client';
interface ComputerListProps {
  searchTerm: string;
  onComputerSelect: (computerId: string) => void;
}

interface Computer {
  uuid: string;
  Hostname: string;
  Status: Status;
  Ip: string;
  Cpu: number;
  Memory: number;
}

const FALLBACK_COMPUTERS: Computer[] = [
  { uuid: '11111', Hostname: 'name', Status: 'Active', Cpu: 12, Memory: 13, Ip: '127.0.0.1' },
  { uuid: '11112', Hostname: 'name2', Status: 'Active', Cpu: 12, Memory: 13, Ip: '127.0.0.1' },
  { uuid: '11113', Hostname: 'name3', Status: 'Active', Cpu: 12, Memory: 13, Ip: '127.0.0.1' },
  { uuid: '11114', Hostname: 'name4', Status: 'Active', Cpu: 12, Memory: 13, Ip: '127.0.0.1' },
];

export function ComputerList({ searchTerm, onComputerSelect }: ComputerListProps) {
  const [computers, setComputers] = useState<Computer[]>(FALLBACK_COMPUTERS);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchComputers();
  }, []);
  const fetchComputers = async () => {
    setLoading(true);
    try {
      const { data } = await getInstalled({ query: { Server: 'apache' } });
      if (!data || typeof data !== 'object') {
        throw Error('fail');
      }
      let installed: Record<string, CommonInfo> = {};
      if ('Installed' in data.Pcs) {
        installed = data.Pcs.Installed;
      } else if ('NotInstalled' in data.Pcs) {
        installed = {};
      }
      const formattedData: Computer[] = Object.entries(installed).map(([uuid, info]) => ({
        uuid,
        Hostname: info.Hostname,
        Status: info.Status,
        Cpu: info.Cpu,
        Memory: info.Memory,
        Ip: info.Ip ?? '',
      }));

      setComputers(formattedData);
    } catch (error) {
      console.error('Failed to fetch computers:', error);
      toast.error('Failed to fetch computers', {
        description: 'Please check the server or your network connection.',
        duration: 4000,
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setComputers(FALLBACK_COMPUTERS);
    } finally {
      setLoading(false);
    }
  };

  const filteredComputers = computers.filter((computer) => {
    const search = searchTerm.toLowerCase();
    return (
      computer.Hostname.toLowerCase().includes(search) ||
      computer.uuid.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3].map((i) => (
          <Card key={i} className='animate-pulse'>
            <CardContent className='p-6'>
              <div className='h-4 bg-slate-200 rounded w-1/4 mb-2'></div>
              <div className='h-3 bg-slate-200 rounded w-1/6'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {filteredComputers.map((computer) => (
        <Card
          key={computer.uuid}
          className='cursor-pointer hover:shadow-md transition-shadow'
          onClick={() => onComputerSelect(computer.uuid)}
        >
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='bg-slate-100 p-3 rounded-lg'>
                  <Monitor className='w-6 h-6 text-slate-600' />
                </div>
                <div>
                  <h3 className='font-semibold text-lg text-slate-800'>{computer.Hostname}</h3>
                  <p className='text-sm text-slate-500'>{computer.Ip}</p>
                </div>
              </div>
              <div className='flex items-center gap-6'>
                <div className='flex items-center gap-4'>
                  <div className='text-center'>
                    <div className='flex items-center gap-1 text-sm text-slate-600'>
                      <Cpu className='w-4 h-4' />
                      <span>{computer.Cpu}%</span>
                    </div>
                    <p className='text-xs text-slate-500'>CPU</p>
                  </div>
                  <div className='text-center'>
                    <div className='flex items-center gap-1 text-sm text-slate-600'>
                      <MemoryStick className='w-4 h-4' />
                      <span>{computer.Memory}%</span>
                    </div>
                    <p className='text-xs text-slate-500'>Memory</p>
                  </div>
                </div>
                <Badge
                  variant={computer.Status === 'Active' ? 'default' : 'secondary'}
                  className={
                    computer.Status === 'Active' ? 'bg-green-500' : 'bg-slate-500 text-white'
                  }
                >
                  {computer.Status === 'Active' ? 'Running' : 'Stopped'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {filteredComputers.length === 0 && (
        <Card>
          <CardContent className='p-12 text-center'>
            <Monitor className='w-12 h-12 text-slate-400 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-slate-600 mb-2'>No computers found</h3>
            <p className='text-slate-500'>
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'No computers have this server installed'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
