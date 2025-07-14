import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Network, Edit, Power, PowerOff } from 'lucide-react';
import { toast } from "sonner";

interface NetworkInterface {
  id: string;
  name: string;
  ipv4: string;
  netmask: string;
  mac: string;
  gateway: string;
  mtu: number;
  status: 'Up' | 'Down';
  dhcp: boolean;
  type: 'physical' | 'virtual';
}

interface Route {
  id: string;
  destinationNetwork: string;
  nextHop: string;
  dev: string;
  metric: number;
  src: string;
}

interface DNSConfig {
  hostname: string;
  dns: {
    primary: string;
    secondary: string;
  };
}

interface Computer {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline';
}

const NetworkConfigurationPage = () => {
//   const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("interfaces");
  const [selectedComputer, setSelectedComputer] = useState<string>('');
  const [computers, setComputers] = useState<Computer[]>([]);
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [dnsConfig, setDnsConfig] = useState<DNSConfig>({
    hostname: '',
    dns: { primary: '', secondary: '' }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showInterfaceDialog, setShowInterfaceDialog] = useState(false);
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [editingInterface, setEditingInterface] = useState<NetworkInterface | null>(null);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  // Mock data
  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockComputers: Computer[] = [
        { id: 'pc1', name: 'Server-001', ip: '192.168.1.100', status: 'online' },
        { id: 'pc2', name: 'Server-002', ip: '192.168.1.101', status: 'online' },
        { id: 'pc3', name: 'Workstation-001', ip: '192.168.1.102', status: 'offline' },
      ];

      const mockInterfaces: NetworkInterface[] = [
        {
          id: 'eth0',
          name: 'eth0',
          ipv4: '192.168.1.100',
          netmask: '255.255.255.0',
          mac: '00:11:22:33:44:55',
          gateway: '192.168.1.1',
          mtu: 1500,
          status: 'Up',
          dhcp: true,
          type: 'physical'
        },
        {
          id: 'eth1',
          name: 'eth1',
          ipv4: '10.0.0.100',
          netmask: '255.255.255.0',
          mac: '00:11:22:33:44:66',
          gateway: '10.0.0.1',
          mtu: 1500,
          status: 'Down',
          dhcp: false,
          type: 'physical'
        },
        {
          id: 'br0',
          name: 'br0',
          ipv4: '172.16.0.1',
          netmask: '255.255.255.0',
          mac: '00:11:22:33:44:77',
          gateway: '172.16.0.254',
          mtu: 1500,
          status: 'Up',
          dhcp: false,
          type: 'virtual'
        }
      ];

      const mockRoutes: Route[] = [
        {
          id: 'route1',
          destinationNetwork: '0.0.0.0/0',
          nextHop: '192.168.1.1',
          dev: 'eth0',
          metric: 100,
          src: '192.168.1.100'
        },
        {
          id: 'route2',
          destinationNetwork: '192.168.1.0/24',
          nextHop: '0.0.0.0',
          dev: 'eth0',
          metric: 100,
          src: '192.168.1.100'
        }
      ];

      const mockDNS: DNSConfig = {
        hostname: 'server-001',
        dns: {
          primary: '8.8.8.8',
          secondary: '8.8.4.4'
        }
      };

      setComputers(mockComputers);
      setInterfaces(mockInterfaces);
      setRoutes(mockRoutes);
      setDnsConfig(mockDNS);
      if (mockComputers.length > 0) {
        setSelectedComputer(mockComputers[0].id);
      }
    } catch (error) {
      console.error("Error fetching network data:", error);
      toast.error("獲取網路資料失敗：無法載入網路配置，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveInterface = async (interfaceData: Partial<NetworkInterface>) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));

      if (editingInterface) {
        setInterfaces(prev => prev.map(iface => 
          iface.id === editingInterface.id ? { ...iface, ...interfaceData } : iface
        ));
        toast.success(`網路介面更新成功：已更新網路介面 ${interfaceData.name}`);
      }

      setShowInterfaceDialog(false);
      setEditingInterface(null);
    } catch (error) {
      console.error("Error saving interface:", error);
      toast.error("儲存失敗：無法儲存網路介面設定");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleInterface = async (interfaceId: string) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      setInterfaces(prev => prev.map(iface => 
        iface.id === interfaceId 
          ? { ...iface, status: iface.status === 'Up' ? 'Down' : 'Up' }
          : iface
      ));

      const iface = interfaces.find(i => i.id === interfaceId);
      toast.success(`網路介面${iface?.status === 'Up' ? '關閉' : '啟動'}成功：已${iface?.status === 'Up' ? '關閉' : '啟動'}網路介面 ${iface?.name}`);
    } catch (error) {
      console.error("Error toggling interface:", error);
      toast.error("操作失敗：無法切換網路介面狀態");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInterface = async (interfaceId: string) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const iface = interfaces.find(i => i.id === interfaceId);
      setInterfaces(prev => prev.filter(i => i.id !== interfaceId));
      
      toast.success(`網路介面刪除成功：已刪除網路介面 ${iface?.name}`);
    } catch (error) {
      console.error("Error deleting interface:", error);
      toast.error("刪除失敗：無法刪除網路介面");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRoute = async (routeData: Partial<Route>) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));

      if (editingRoute) {
        setRoutes(prev => prev.map(route => 
          route.id === editingRoute.id ? { ...route, ...routeData } : route
        ));
        toast.success(`路由更新成功：已更新路由 ${routeData.destinationNetwork}`);
      } else {
        const newRoute: Route = {
          id: `route_${Date.now()}`,
          destinationNetwork: routeData.destinationNetwork || '',
          nextHop: routeData.nextHop || '',
          dev: routeData.dev || '',
          metric: routeData.metric || 100,
          src: routeData.src || ''
        };
        setRoutes(prev => [...prev, newRoute]);
        toast.success(`路由新增成功：已新增路由 ${newRoute.destinationNetwork}`);
      }

      setShowRouteDialog(false);
      setEditingRoute(null);
    } catch (error) {
      console.error("Error saving route:", error);
      toast.error("儲存失敗：無法儲存路由設定");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const route = routes.find(r => r.id === routeId);
      setRoutes(prev => prev.filter(r => r.id !== routeId));
      
      toast.success(`路由刪除成功：已刪除路由 ${route?.destinationNetwork}`);
    } catch (error) {
      console.error("Error deleting route:", error);
      toast.error("刪除失敗：無法刪除路由");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDNS = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));

      toast.success("DNS設定儲存成功：主機名稱和DNS伺服器設定已更新");
    } catch (error) {
      console.error("Error saving DNS:", error);
      toast.error("儲存失敗：無法儲存DNS設定");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedComputerData = computers.find(pc => pc.id === selectedComputer);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="bg-[#A8AEBD] py-3 mb-3">
        <h1 className="text-2xl font-extrabold text-center text-[#E6E6E6]">
          Network Configuration
        </h1>
      </div>

      {/* 電腦選擇 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>選擇電腦</CardTitle>
          <CardDescription>選擇要進行網路配置的電腦</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedComputer} onValueChange={setSelectedComputer}>
            <SelectTrigger className="w-full md:w-1/2">
              <SelectValue placeholder="請選擇電腦" />
            </SelectTrigger>
            <SelectContent>
              {computers.map((computer) => (
                <SelectItem key={computer.id} value={computer.id}>
                  <div className="flex items-center gap-2">
                    <Badge variant={computer.status === 'online' ? 'default' : 'secondary'}>
                      {computer.status === 'online' ? '線上' : '離線'}
                    </Badge>
                    {computer.name} ({computer.ip})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedComputer && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="interfaces" className="flex w-full font-bold flex-col gap-6 data-[state=active]:bg-[#A8AEBD] data-[state=active]:text-white text-gray-700">網路介面</TabsTrigger>
            <TabsTrigger value="routing" className="flex w-full font-bold flex-col gap-6 data-[state=active]:bg-[#A8AEBD] data-[state=active]:text-white text-gray-700">路由和閘道</TabsTrigger>
            <TabsTrigger value="dns" className="flex w-full font-bold flex-col gap-6 data-[state=active]:bg-[#A8AEBD] data-[state=active]:text-white text-gray-700">主機名稱和DNS</TabsTrigger>
          </TabsList>

          {/* 網路介面 */}
          <TabsContent value="interfaces" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>網路介面管理</CardTitle>
                    <CardDescription>
                      管理 {selectedComputerData?.name} 的網路介面設定
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>實體網路介面清單</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名稱</TableHead>
                      <TableHead>IP位址</TableHead>
                      <TableHead>MAC位址</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interfaces.filter(iface => iface.type === 'physical').map((iface) => (
                      <TableRow key={iface.id}>
                        <TableCell className="font-medium">{iface.name}</TableCell>
                        <TableCell>{iface.ipv4}</TableCell>
                        <TableCell>{iface.mac}</TableCell>
                        <TableCell>
                          <Badge variant={iface.status === 'Up' ? 'default' : 'secondary'}>
                            {iface.status === 'Up' ? '啟動' : '關閉'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleToggleInterface(iface.id)}
                              disabled={isLoading}
                            >
                              {iface.status === 'Up' ? 
                                <PowerOff className="h-4 w-4" /> : 
                                <Power className="h-4 w-4" />
                              }
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingInterface(iface);
                                setShowInterfaceDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 路由和閘道 */}
          <TabsContent value="routing" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>路由和閘道</CardTitle>
                    <CardDescription>管理系統路由表設定</CardDescription>
                  </div>
                  <Dialog open={showRouteDialog} onOpenChange={setShowRouteDialog}>
                    <Button onClick={() => {
                      setEditingRoute(null);
                      setShowRouteDialog(true);
                    }}>
                      新增路由
                    </Button>
                    <RouteDialog 
                      route={editingRoute}
                      interfaces={interfaces}
                      onSave={handleSaveRoute}
                      isLoading={isLoading}
                      onClose={() => setShowRouteDialog(false)}
                    />
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>系統路由表</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>目的網段</TableHead>
                      <TableHead>下一跳</TableHead>
                      <TableHead>介面</TableHead>
                      <TableHead>優先度</TableHead>
                      <TableHead>來源IP</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.map((route) => (
                      <TableRow key={route.id}>
                        <TableCell className="font-medium">{route.destinationNetwork}</TableCell>
                        <TableCell>{route.nextHop || '-'}</TableCell>
                        <TableCell>{route.dev}</TableCell>
                        <TableCell>{route.metric}</TableCell>
                        <TableCell>{route.src}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingRoute(route);
                                setShowRouteDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteRoute(route.id)}
                              disabled={isLoading}
                            >
                              刪除
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 主機名稱和DNS */}
          <TabsContent value="dns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>主機名稱和DNS用戶端</CardTitle>
                <CardDescription>設定系統主機名稱和DNS伺服器</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hostname">主機名稱</Label>
                    <Input
                      id="hostname"
                      value={dnsConfig.hostname}
                      onChange={(e) => setDnsConfig(prev => ({ ...prev, hostname: e.target.value }))}
                      placeholder="例如: server-001"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="primary-dns">主要DNS伺服器</Label>
                    <Input
                      id="primary-dns"
                      value={dnsConfig.dns.primary}
                      onChange={(e) => setDnsConfig(prev => ({ 
                        ...prev, 
                        dns: { ...prev.dns, primary: e.target.value }
                      }))}
                      placeholder="例如: 8.8.8.8"
                    />
                  </div>
                  
                  <div className="md:col-span-1">
                    <Label htmlFor="secondary-dns">次要DNS伺服器</Label>
                    <Input
                      id="secondary-dns"
                      value={dnsConfig.dns.secondary}
                      onChange={(e) => setDnsConfig(prev => ({ 
                        ...prev, 
                        dns: { ...prev.dns, secondary: e.target.value }
                      }))}
                      placeholder="例如: 8.8.4.4"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveDNS} disabled={isLoading}
                    className="flex items-center gap-2 bg-[#A8AEBD]">
                    儲存DNS設定
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Interface Dialog */}
      {showInterfaceDialog && (
        <InterfaceDialog 
          interface={editingInterface}
          onSave={handleSaveInterface}
          isLoading={isLoading}
          onClose={() => setShowInterfaceDialog(false)}
        />
      )}
    </div>
  );
};

interface InterfaceDialogProps {
  interface: NetworkInterface | null;
  onSave: (data: Partial<NetworkInterface>) => void;
  isLoading: boolean;
  onClose: () => void;
}

// Interface Dialog Component
const InterfaceDialog = ({ interface: iface, onSave, isLoading, onClose }: InterfaceDialogProps) => {
  const [formData, setFormData] = useState({
    dhcp: iface?.dhcp ?? true,
    ipv4: iface?.ipv4 || '',
    netmask: iface?.netmask || '',
    gateway: iface?.gateway || '',
    mtu: iface?.mtu || 1500,
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>編輯網路介面 - {iface?.name}</DialogTitle>
          <DialogDescription>設定網路介面參數</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* IP設定方式選擇 */}
          <div>
            <Label className="text-base font-medium">IP位址設定方式</Label>
            <RadioGroup 
              value={formData.dhcp ? "dhcp" : "manual"} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, dhcp: value === "dhcp" }))}
              className="flex flex-row mt-3"
            >
              <div className="flex items-center space-x-2 flex-1">
                <RadioGroupItem value="dhcp" id="dhcp" />
                <Label htmlFor="dhcp" className="cursor-pointer">自動 (DHCP)</Label>
              </div>
              <div className="flex items-center space-x-2 flex-1">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="cursor-pointer">手動</Label>
              </div>
            </RadioGroup>
          </div>

          {/* 手動設定選項 */}
          {!formData.dhcp && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ipv4">IPv4位址</Label>
                  <Input
                    id="ipv4"
                    value={formData.ipv4}
                    onChange={(e) => setFormData(prev => ({ ...prev, ipv4: e.target.value }))}
                    placeholder="192.168.1.100"
                  />
                </div>
                <div>
                  <Label htmlFor="netmask">子網路遮罩</Label>
                  <Input
                    id="netmask"
                    value={formData.netmask}
                    onChange={(e) => setFormData(prev => ({ ...prev, netmask: e.target.value }))}
                    placeholder="255.255.255.0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gateway">閘道</Label>
                  <Input
                    id="gateway"
                    value={formData.gateway}
                    onChange={(e) => setFormData(prev => ({ ...prev, gateway: e.target.value }))}
                    placeholder="192.168.1.1"
                  />
                </div>
                <div>
                  <Label htmlFor="mtu">MTU大小</Label>
                  <Input
                    id="mtu"
                    type="number"
                    value={formData.mtu}
                    onChange={(e) => setFormData(prev => ({ ...prev, mtu: Number(e.target.value) }))}
                    placeholder="1500"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>取消</Button>
            <Button onClick={() => onSave(formData)} disabled={isLoading}>
              更新
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface RouteDialogProps {
  route: Route | null;
  interfaces: NetworkInterface[];
  onSave: (data: Partial<Route>) => void;
  isLoading: boolean;
  onClose: () => void;
}

// Route Dialog Component
const RouteDialog = ({ route, interfaces, onSave, isLoading, onClose }: RouteDialogProps) => {
  const [formData, setFormData] = useState({
    destinationNetwork: route?.destinationNetwork || '',
    nextHop: route?.nextHop || '',
    dev: route?.dev || '',
    metric: route?.metric || 100,
    src: route?.src || '',
  });

  const isEditing = !!route;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{route ? '編輯路由' : '新增路由'}</DialogTitle>
        <DialogDescription>設定路由參數</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="destinationNetwork">目的網段</Label>
            <Input
              id="destinationNetwork"
              value={formData.destinationNetwork}
              onChange={(e) => setFormData(prev => ({ ...prev, destinationNetwork: e.target.value }))}
              placeholder="192.168.1.0/24"
            />
          </div>
          <div>
            <Label htmlFor="nextHop">下一跳 (Next hop)</Label>
            <Input
              id="nextHop"
              value={formData.nextHop}
              onChange={(e) => setFormData(prev => ({ ...prev, nextHop: e.target.value }))}
              placeholder="192.168.1.1"
            />
          </div>
        </div>
        
        {isEditing && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dev">介面</Label>
                <Select value={formData.dev} onValueChange={(value) => setFormData(prev => ({ ...prev, dev: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇介面" />
                  </SelectTrigger>
                  <SelectContent>
                    {interfaces.map((iface: NetworkInterface) => (
                      <SelectItem key={iface.id} value={iface.name}>
                        {iface.name} ({iface.type === 'physical' ? '實體' : '虛擬'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="metric">優先度</Label>
                <Input
                  id="metric"
                  type="number"
                  value={formData.metric}
                  onChange={(e) => setFormData(prev => ({ ...prev, metric: Number(e.target.value) }))}
                  placeholder="100"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="src">來源IP</Label>
              <Input
                id="src"
                value={formData.src}
                onChange={(e) => setFormData(prev => ({ ...prev, src: e.target.value }))}
                placeholder="192.168.1.100"
              />
            </div>
          </>
        )}
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={() => onSave(formData)} disabled={isLoading}>
            {route ? '更新' : '新增'}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default NetworkConfigurationPage;