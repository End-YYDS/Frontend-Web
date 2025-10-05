import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Cpu, MemoryStick } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Computer {
  uuid: string;
  Hostname: string;
  Status: "active" | "stopped";
  Cpu: number;
  Memory: number;
}

interface ComputerListProps {
  serverId: string;
  searchTerm: string;
  onComputerSelect: (computerId: string) => void;
}

export function ComputerList({ serverId, searchTerm, onComputerSelect }: ComputerListProps) {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchComputers();
  }, [serverId]);

  const fetchComputers = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Computer[]>("/api/server/computers", { params: { serverId } });
      setComputers(res.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch computers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredComputers = computers.filter(computer =>
    computer.Hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    computer.uuid.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onComputerSelect(computer.uuid)}
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
                  <p className="text-sm text-slate-500">{computer.uuid}</p>
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
                  variant={computer.Status === "active" ? "default" : "secondary"}
                  className={computer.Status === "active" ? "bg-green-500" : "bg-slate-500"}
                >
                  {computer.Status === "active" ? "Running" : "Stopped"}
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
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No computers found</h3>
            <p className="text-slate-500">
              {searchTerm ? "Try adjusting your search terms" : "No computers have this server installed"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}