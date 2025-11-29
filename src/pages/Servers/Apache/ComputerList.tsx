import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Cpu, MemoryStick } from 'lucide-react';
import { toast } from 'sonner';
import { apacheApi } from '@/api/apacheApi';

interface ComputerListProps {
  searchTerm: string;
  onComputerSelect: (computerId: string) => void;
}

interface Computer {
  uuid: string;
  Ip: string;
  Hostname: string;
  Status: 'active' | 'stopped';
  Cpu: number;
  Memory: number;
}

export function ComputerList({ searchTerm, onComputerSelect }: ComputerListProps) {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComputers = async () => {
    setLoading(true);
    try {
      // 取得 Online PC list
      const pcRes = await apacheApi.getOnlinePCs();
      const pcs = pcRes.data.Pcs;

      // 過濾 online = true 的主機
      const onlineList = Object.entries(pcs)
        .filter(([_, pc]) => pc.Status === true)
        .map(([uuid, pc]) => ({
          uuid,
          Ip: pc.Ip,
          Hostname: pc.Hostname,
        }));

      const results: Computer[] = [];

      // 逐台 PC 呼叫 /server/apache 取得 CPU、Memory 等資訊
      for (const pc of onlineList) {
        try {
          const { data } = await apacheApi.getApache(pc.uuid);

          results.push({
            uuid: pc.uuid,
            Ip: data.Ip,
            Hostname: data.Hostname,
            Status: data.Status ?? 'stopped',
            Cpu: data.Cpu ?? 0,
            Memory: data.Memory ?? 0,
          });
        } catch (err) {
          console.warn(`PC ${pc.uuid} 無法取得 Apache 資料`);
        }
      }

      setComputers(results);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch computers', {
        description: 'Please check server or network.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComputers();
  }, []);

  const filteredComputers = computers.filter((computer) => {
    const search = searchTerm.toLowerCase();
    return (
      computer.Hostname.toLowerCase().includes(search) ||
      computer.uuid.toLowerCase().includes(search) ||
      computer.Ip.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/6"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredComputers.map((computer) => (
        <Card
          key={computer.uuid}
          onClick={() => onComputerSelect(computer.uuid)}
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-3 rounded-lg">
                  <Monitor className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">
                    {computer.Hostname}
                  </h3>
                  <p className="text-slate-600">{computer.Ip}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Cpu className="w-4 h-4" />
                      <span>{computer.Cpu}%</span>
                    </div>
                    <p className="text-xs text-slate-500">CPU</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <MemoryStick className="w-4 h-4" />
                      <span>{computer.Memory}%</span>
                    </div>
                    <p className="text-xs text-slate-500">Memory</p>
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
          <CardContent className="p-12 text-center">
            <Monitor className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              No computers found
            </h3>
            <p className="text-slate-500">
              {searchTerm ? 'Try adjusting your search terms' : 'No online computers available'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
