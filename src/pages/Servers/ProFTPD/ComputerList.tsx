import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Cpu, MemoryStick } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { GetProftpdResponse } from './types';

// interface ComputerListProps {
//   serverId: string;
//   searchTerm: string;
//   onComputerSelect: (computerId: string) => void;
// }

interface ComputerListProps {
  searchTerm: string;
  onComputerSelect: (computerId: string) => void;
}

interface Computer {
  uuid: string;
  Hostname: string;
  Status: 'active' | 'stopped';
  Cpu: number;
  Memory: number;
}

// export function ComputerList({ serverId, searchTerm, onComputerSelect }: ComputerListProps) {
export function ComputerList({ searchTerm, onComputerSelect }: ComputerListProps) {
  //TODO: Content.tsx SeachTerm 拿 searchTerm
  // const searchTerm = '';

  const [computers, setComputers] = useState<Computer[]>([
    { uuid: '11111', Hostname: 'name', Status: 'active', Cpu: 12, Memory: 13 },
    { uuid: '11112', Hostname: 'name2', Status: 'active', Cpu: 12, Memory: 13 },
    { uuid: '11113', Hostname: 'name3', Status: 'active', Cpu: 12, Memory: 13 },
    { uuid: '11114', Hostname: 'name4', Status: 'active', Cpu: 12, Memory: 13 },
  ]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // 載入伺服器清單
  useEffect(() => {
    fetchComputers();
  }, []);

  //TODO: 修改串接API
  const fetchComputers = async () => {
    setLoading(false);
    try {
      // 呼叫實際 API
      const { data } = await axios.get<GetProftpdResponse>('/api/server/apache');

      // 將回傳的物件轉換成陣列格式
      if (!data || typeof data !== 'object') {
        throw Error('fail');
      }
      const formattedData: Computer[] = Object.keys(data).map((uuid) => ({
        uuid,
        Hostname: data.Hostname ?? 'Unknown',
        Status: data.Status ?? 'stopped',
        Cpu: data.Cpu ?? 0,
        Memory: data.Memory ?? 0,
      }));

      setComputers(formattedData);
      // setLoading(false);
    } catch (error) {
      console.error('Failed to fetch computers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch computers',
        variant: 'destructive',
      });
      setComputers([
        { uuid: '11111', Hostname: 'name', Status: 'active', Cpu: 12, Memory: 13 },
        { uuid: '11112', Hostname: 'name2', Status: 'active', Cpu: 12, Memory: 13 },
        { uuid: '11113', Hostname: 'name3', Status: 'active', Cpu: 12, Memory: 13 },
        { uuid: '11114', Hostname: 'name4', Status: 'active', Cpu: 12, Memory: 13 },
      ]);
    }
  };

  // 避免 undefined 錯誤的安全搜尋
  // const filteredComputers = computers.filter((computer) => {
  //   const hostname = computer.Hostname?.toLowerCase() || '';
  //   const uuid = computer.uuid?.toLowerCase() || '';
  //   const search = searchTerm?.toLowerCase() || '';
  //   return hostname.includes(search) || uuid.includes(search);
  // });

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
          // onClick={(e) => console.log(e)}
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
                  {/* <p className='text-sm text-slate-500'>{computer.uuid}</p> */}
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
                  variant={computer.Status === 'active' ? 'default' : 'secondary'}
                  className={computer.Status === 'active' ? 'bg-green-500' : 'bg-slate-500'}
                >
                  {computer.Status === 'active' ? 'Running' : 'Stopped'}
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
