//TODO: 選擇電腦請依照後端

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Validation schemas
const ipAddressRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;

const interfaceSchema = z.object({
  dhcp: z.boolean(),
  ipv4: z.string().optional().refine((val) => !val || ipAddressRegex.test(val), {
    message: "請輸入有效的IP位址格式",
  }),
  netmask: z.string().optional().refine((val) => !val || ipAddressRegex.test(val), {
    message: "請輸入有效的子網路遮罩格式",
  }),
  gateway: z.string().optional().refine((val) => !val || ipAddressRegex.test(val), {
    message: "請輸入有效的閘道位址格式",
  }),
  mtu: z.number().min(68).max(9000),
});

const routeSchema = z.object({
  destinationNetwork: z.string().refine((val) => cidrRegex.test(val) || val === "0.0.0.0/0", {
    message: "請輸入有效的目的網段格式 (如: 192.168.1.0/24)",
  }),
  nextHop: z.string().refine((val) => ipAddressRegex.test(val) || val === "0.0.0.0", {
    message: "請輸入有效的下一跳IP位址",
  }),
  dev: z.string().min(1, "請選擇介面"),
  metric: z.number().min(0).max(65535),
  src: z.string().optional().refine((val) => !val || ipAddressRegex.test(val), {
    message: "請輸入有效的來源IP位址格式",
  }),
});

const dnsSchema = z.object({
  hostname: z.string().min(1, "請輸入主機名稱"),
  primary: z.string().refine((val) => ipAddressRegex.test(val), {
    message: "請輸入有效的主要DNS伺服器IP位址",
  }),
  secondary: z.string().optional().refine((val) => !val || ipAddressRegex.test(val), {
    message: "請輸入有效的次要DNS伺服器IP位址",
  }),
});

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
  const navigate = useNavigate();
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
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Network className="h-6 w-6" />
          <h1 className="text-2xl md:text-3xl font-bold">網路配置</h1>
        </div>
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
            <TabsTrigger value="interfaces" className="flex-1">網路介面</TabsTrigger>
            <TabsTrigger value="routing" className="flex-1">路由和閘道</TabsTrigger>
            <TabsTrigger value="dns" className="flex-1">主機名稱和DNS</TabsTrigger>
          </TabsList>

          {/* 網路介面 */}
          <TabsContent value="interfaces" className="space-y-4">
            {/* 實體介面 */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>實體網路介面</CardTitle>
                    <CardDescription>
                      管理 {selectedComputerData?.name} 的實體網路介面設定
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

            {/* 虛擬介面 */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>虛擬介面卡</CardTitle>
                    <CardDescription>
                      管理虛擬網路介面設定 (Bridge、VLAN等)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>虛擬網路介面清單</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名稱</TableHead>
                      <TableHead>IP位址</TableHead>
                      <TableHead>類型</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interfaces.filter(iface => iface.type === 'virtual').map((iface) => (
                      <TableRow key={iface.id}>
                        <TableCell className="font-medium">{iface.name}</TableCell>
                        <TableCell>{iface.ipv4}</TableCell>
                        <TableCell>
                          <Badge variant="outline">虛擬</Badge>
                        </TableCell>
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
                {/* 主機名稱佔一整排 */}
                <div>
                  <Label htmlFor="hostname">主機名稱</Label>
                  <Input
                    id="hostname"
                    value={dnsConfig.hostname}
                    onChange={(e) => setDnsConfig(prev => ({ ...prev, hostname: e.target.value }))}
                    placeholder="例如: server-001"
                  />
                </div>
                
                {/* DNS伺服器分兩邊 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  <div>
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
                  <Button onClick={handleSaveDNS} disabled={isLoading}>
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

// Interface Dialog Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const InterfaceDialog = ({ interface: iface, onSave, isLoading, onClose }: any) => {
  const form = useForm<z.infer<typeof interfaceSchema>>({
    resolver: zodResolver(interfaceSchema),
    defaultValues: {
      dhcp: iface?.dhcp || true,
      ipv4: iface?.ipv4 || '',
      netmask: iface?.netmask || '',
      gateway: iface?.gateway || '',
      mtu: iface?.mtu || 1500,
    },
  });

  const onSubmit = (values: z.infer<typeof interfaceSchema>) => {
    onSave(values);
  };

  const isDhcp = form.watch('dhcp');

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>編輯網路介面 - {iface?.name}</DialogTitle>
          <DialogDescription>設定網路介面參數</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* IP設定方式選擇 */}
            <FormField
              control={form.control}
              name="dhcp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">IP位址設定方式</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      value={field.value ? "dhcp" : "manual"}
                      onValueChange={(value) => field.onChange(value === "dhcp")}
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
                  </FormControl>
                </FormItem>
              )}
            />

            {/* 手動設定選項 */}
            {!isDhcp && (
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ipv4"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IPv4位址</FormLabel>
                        <FormControl>
                          <Input placeholder="192.168.1.100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="netmask"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>子網路遮罩</FormLabel>
                        <FormControl>
                          <Input placeholder="255.255.255.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gateway"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>閘道</FormLabel>
                        <FormControl>
                          <Input placeholder="192.168.1.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mtu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MTU大小</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="1500"
                            min={68}
                            max={9000}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={onClose}>取消</Button>
              <Button type="submit" disabled={isLoading}>
                更新
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Route Dialog Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RouteDialog = ({ route, interfaces, onSave, isLoading, onClose }: any) => {
  const form = useForm<z.infer<typeof routeSchema>>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      destinationNetwork: route?.destinationNetwork || '',
      nextHop: route?.nextHop || '',
      dev: route?.dev || '',
      metric: route?.metric || 100,
      src: route?.src || '',
    },
  });

  const onSubmit = (values: z.infer<typeof routeSchema>) => {
    onSave(values);
  };

  const isEditing = !!route;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{route ? '編輯路由' : '新增路由'}</DialogTitle>
        <DialogDescription>設定路由參數</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="destinationNetwork"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>目的網段</FormLabel>
                  <FormControl>
                    <Input placeholder="192.168.1.0/24" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nextHop"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>下一跳 (Next hop)</FormLabel>
                  <FormControl>
                    <Input placeholder="192.168.1.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {isEditing && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dev"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>介面</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="選擇介面" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {interfaces.map((iface: NetworkInterface) => (
                            <SelectItem key={iface.id} value={iface.name}>
                              {iface.name} ({iface.type === 'physical' ? '實體' : '虛擬'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metric"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>優先度</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100"
                          min={0}
                          max={65535}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="src"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>來源IP （可選）</FormLabel>
                    <FormControl>
                      <Input placeholder="192.168.1.100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>取消</Button>
            <Button type="submit" disabled={isLoading}>
              {route ? '更新' : '新增'}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

export default NetworkConfigurationPage;