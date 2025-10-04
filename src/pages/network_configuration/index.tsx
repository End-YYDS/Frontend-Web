//TODO: 選擇電腦請依照後端
// 只有API 沒接上
import { useState, useEffect } from 'react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Edit, Trash2, Power, PowerOff } from 'lucide-react';
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
import type { PageMeta } from '@/types';
// networkApi.ts
import axios from 'axios';
import type {
  GetAllNetResponse,
  CreateNetRequest,
  DeleteNetRequest,
  PatchNetRequest,
  PutNetRequest,
  ActionNetRequest,
  GetAllRouteResponse,
  CreateRouteRequest,
  DeleteRouteRequest,
  PatchRouteRequest,
  PutRouteRequest,
  GetAllDnsResponse,
  PatchHostnameRequest,
  PutDnsRequest,
} from './types';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export const networkApi = {
  // ---------------------------
  // Network Interface
  // ---------------------------

  getAllNetworks: async (): Promise<ApiResponse<GetAllNetResponse>> => {
    try {
      const res = await axios.get<GetAllNetResponse>('/api/network/net', { withCredentials: true });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to fetch network interfaces' };
    }
  },

  createNetwork: async (data: CreateNetRequest): Promise<ApiResponse> => {
    try {
      const res = await axios.post('/api/network/net', data, { withCredentials: true });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to create network interface' };
    }
  },

  deleteNetwork: async (data: DeleteNetRequest): Promise<ApiResponse> => {
    try {
      const res = await axios.delete('/api/network/net', { data, withCredentials: true });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to delete network interface' };
    }
  },

  patchNetwork: async (data: PatchNetRequest): Promise<ApiResponse> => {
    try {
      const res = await axios.patch('/api/network/net', data, { withCredentials: true });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to update network interface' };
    }
  },

  putNetwork: async (data: PutNetRequest): Promise<ApiResponse> => {
    try {
      const res = await axios.put('/api/network/net', data, { withCredentials: true });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to replace network interface' };
    }
  },

  actionNetworkUp: async (data: ActionNetRequest): Promise<ApiResponse> => {
    try {
      const res = await axios.post('/api/network/net/action/up', data, { withCredentials: true });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to activate network interface' };
    }
  },

  actionNetworkDown: async (data: ActionNetRequest): Promise<ApiResponse> => {
    try {
      const res = await axios.post('/api/network/net/action/down', data, { withCredentials: true });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to deactivate network interface' };
    }
  },

  // ---------------------------
  // Routing / Gateways
  // ---------------------------

  getAllRoutes: async (): Promise<ApiResponse<GetAllRouteResponse>> => {
    try {
      const res = await axios.get<GetAllRouteResponse>('/api/network/route', { withCredentials: true });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to fetch routing table' };
    }
  },

  createRoute: async (data: CreateRouteRequest): Promise<ApiResponse> => {
    try {
      const res = await axios.post('/api/network/route', data, { withCredentials: true });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to create route' };
    }
  },

  deleteRoute: async (data: DeleteRouteRequest): Promise<ApiResponse> => {
    try {
      const res = await axios.delete('/api/network/route', { data, withCredentials: true });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to delete route' };
    }
  },

  patchRoute: async (data: PatchRouteRequest): Promise<ApiResponse> => {
    try {
      const res = await axios.patch('/api/network/route', data, { withCredentials: true });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to update route' };
    }
  },

  putRoute: async (data: PutRouteRequest): Promise<ApiResponse> => {
    try {
      const res = await axios.put('/api/network/route', data, { withCredentials: true });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to replace route' };
    }
  },

  // ---------------------------
  // Hostname / DNS
  // ---------------------------

  getAllDns: async (): Promise<ApiResponse<GetAllDnsResponse>> => {
    try {
      const res = await axios.get<GetAllDnsResponse>('/api/network/dns', { withCredentials: true });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to fetch DNS information' };
    }
  },

  patchHostname: async (data: PatchHostnameRequest): Promise<ApiResponse> => {
    try {
      const res = await axios.patch('/api/network/dns', data, { withCredentials: true });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to update hostname' };
    }
  },

  putDns: async (data: PutDnsRequest): Promise<ApiResponse> => {
    try {
      const res = await axios.put('/api/network/dns', data, { withCredentials: true });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to update DNS server' };
    }
  },
};


// Validation schemas
const ipAddressRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;

const interfaceSchema = z.object({
  dhcp: z.boolean(),
  ipv4: z.string().optional().refine((val) => !val || ipAddressRegex.test(val), {
    message: "Please enter a valid IP address",
  }),
  netmask: z.string().optional().refine((val) => !val || ipAddressRegex.test(val), {
    message: "Please enter a valid subnet mask",
  }),
  gateway: z.string().optional().refine((val) => !val || ipAddressRegex.test(val), {
    message: "Please enter a valid gateway address",
  }),
  mtu: z.number().min(68).max(9000),
});

const routeSchema = z.object({
  destinationNetwork: z.string().refine((val) => cidrRegex.test(val) || val === "0.0.0.0/0", {
    message: "Please enter a valid destination network (e.g., 192.168.1.0/24)",
  }),
  nextHop: z.string().refine((val) => ipAddressRegex.test(val) || val === "0.0.0.0", {
    message: "Please enter a valid next hop IP address",
  }),
  dev: z.string().min(1, "Please select an interface"),
  metric: z.number().min(0).max(65535),
  src: z.string().optional().refine((val) => !val || ipAddressRegex.test(val), {
    message: "Please enter a valid source IP address",
  }),
});
//TODO: 檢查DNS
// const dnsSchema = z.object({
//   hostname: z.string().min(1, "請輸入主機名稱"),
//   primary: z.string().refine((val) => ipAddressRegex.test(val), {
//     message: "請輸入有效的主要DNS伺服器IP位址",
//   }),
//   secondary: z.string().optional().refine((val) => !val || ipAddressRegex.test(val), {
//     message: "請輸入有效的次要DNS伺服器IP位址",
//   }),
// });

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
  const [showDeleteRouteDialog, setShowDeleteRouteDialog] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<{ id: string; destination: string } | null>(null);

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
      toast.error("Failed to fetch network data. Please try again later.");
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
        toast.success(`Interface updated successfully: ${interfaceData.name}`);
      }

      setShowInterfaceDialog(false);
      setEditingInterface(null);
    } catch (error) {
      console.error("Error saving interface:", error);
      toast.error("Failed to save interface settings");
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
      toast.success(`Network interface ${iface?.status === 'Up' ? 'stopped' : 'started'} successfully: ${iface?.status === 'Up' ? 'Stopped' : 'Started'} interface ${iface?.name}`);
    } catch (error) {
      console.error("Error toggling interface:", error);
      toast.error("Operation failed: Unable to toggle network interface status");
    } finally {
      setIsLoading(false);
    }
  };
//TODO: 
  // const handleDeleteInterface = async (interfaceId: string) => {
  //   try {
  //     setIsLoading(true);
  //     await new Promise(resolve => setTimeout(resolve, 500));

  //     const iface = interfaces.find(i => i.id === interfaceId);
  //     setInterfaces(prev => prev.filter(i => i.id !== interfaceId));
      
  //     toast.success(`網路介面刪除成功：已刪除網路介面 ${iface?.name}`);
  //   } catch (error) {
  //     console.error("Error deleting interface:", error);
  //     toast.error("刪除失敗：無法刪除網路介面");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSaveRoute = async (routeData: Partial<Route>) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));

      if (editingRoute) {
        setRoutes(prev => prev.map(route => 
          route.id === editingRoute.id ? { ...route, ...routeData } : route
        ));
        toast.success(`Route updated successfully:  ${routeData.destinationNetwork}`);
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
        toast.success(`Route added successfully:${newRoute.destinationNetwork}`);
      }

      setShowRouteDialog(false);
      setEditingRoute(null);
    } catch (error) {
      console.error("Error saving route:", error);
      toast.error("Failed to save route settings");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleDeleteRoute = async (routeId: string) => {
  //   try {
  //     setIsLoading(true);
  //     await new Promise(resolve => setTimeout(resolve, 500));

  //     const route = routes.find(r => r.id === routeId);
  //     setRoutes(prev => prev.filter(r => r.id !== routeId));
      
  //     toast.success(`Route deleted successfully: ${route?.destinationNetwork}`);
  //   } catch (error) {
  //     console.error("Error deleting route:", error);
  //     toast.error("Failed to delete route");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const confirmDeleteRoute = (routeId: string, destination: string) => {
    setRouteToDelete({ id: routeId, destination });
    setShowDeleteRouteDialog(true);
  };

  const handleDeleteRoute = async () => {
    if (!routeToDelete) return;
    
    try {
      setIsLoading(true);
      setShowDeleteRouteDialog(false);
      await new Promise(resolve => setTimeout(resolve, 500));

      setRoutes(prev => prev.filter(r => r.id !== routeToDelete.id));
      
      toast.success(`Route deleted successfully: ${routeToDelete.destination}`);
      setRouteToDelete(null);
    } catch (error) {
      console.error("Error deleting route:", error);
      toast.error("Deletion failed: Unable to delete route");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDNS = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));

      toast.success("DNS settings saved successfully");
    } catch (error) {
      console.error("Error saving DNS:", error);
      toast.error("Failed to save DNS settings");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedComputerData = computers.find(pc => pc.id === selectedComputer);

  return (
      <div className="container mx-auto py-6 px-4">
        <div className="bg-[#A8AEBD] py-1.5 mb-6">
          <h1 className="text-4xl font-extrabold text-center text-[#E6E6E6]">
                Network Configuration
          </h1>
        </div>
      

      {/* 電腦選擇 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select PC</CardTitle>
          <CardDescription>Select a PC to configure network settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedComputer} onValueChange={setSelectedComputer}>
            <SelectTrigger className="w-full md:w-1/2">
              <SelectValue placeholder="Select a PC" />
            </SelectTrigger>
            <SelectContent>
              {computers.map((computer) => (
                <SelectItem key={computer.id} value={computer.id}>
                  <div className="flex items-center gap-2">
                    <Badge variant={computer.status === 'online' ? 'default' : 'secondary'}>
                      {computer.status === 'online' ? 'Online' : 'Offline'}
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
            <TabsTrigger value="interfaces" className="flex-1">Network Interfaces</TabsTrigger>
            <TabsTrigger value="routing" className="flex-1">Routing & Gateways</TabsTrigger>
            <TabsTrigger value="dns" className="flex-1">Hostname & DNS</TabsTrigger>
          </TabsList>

          {/* 網路介面 */}
          <TabsContent value="interfaces" className="space-y-4">
            {/* 實體介面 */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Physical Network Interfaces</CardTitle>
                    <CardDescription>
                      Manage {selectedComputerData?.name}'s physical network interface settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>List of physical network interfaces</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>MAC Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Operation</TableHead>
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
                            {iface.status === 'Up' ? 'Up' : 'Down'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
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
                              variant="ghost" 
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
                    <CardTitle>Virtual Interfaces</CardTitle>
                    <CardDescription>
                      Manage virtual network interface settings (Bridge, VLAN, etc.)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>List of virtual network interfaces</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Operation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interfaces.filter(iface => iface.type === 'virtual').map((iface) => (
                      <TableRow key={iface.id}>
                        <TableCell className="font-medium">{iface.name}</TableCell>
                        <TableCell>{iface.ipv4}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Virtual</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={iface.status === 'Up' ? 'default' : 'secondary'}>
                            {iface.status === 'Up' ? 'Up' : 'Down'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
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
                              variant="ghost" 
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
                    <CardTitle>Routing & Gateways</CardTitle>
                    <CardDescription>Manage system routing table</CardDescription>
                  </div>
                  <Dialog open={showRouteDialog} onOpenChange={setShowRouteDialog}>
                    <Button onClick={() => {
                      setEditingRoute(null);
                      setShowRouteDialog(true);
                      }}
                      style={{ backgroundColor: '#7B86AA' }}
                      className="hover:opacity-90"
                    >
                      Add Route
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
                  <TableCaption>System Routing Table</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Destination</TableHead>
                      <TableHead>Next Hop</TableHead>
                      <TableHead>Interface</TableHead>
                      <TableHead>Metric</TableHead>
                      <TableHead>Source IP</TableHead>
                      <TableHead className="text-right">Operation</TableHead>
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
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setEditingRoute(route);
                                setShowRouteDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => confirmDeleteRoute(route.id, route.destinationNetwork)}
                              disabled={isLoading}
                            >
                              <Trash2 className="w-4 h-4" />
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
                <CardTitle>Hostname & DNS Client</CardTitle>
                <CardDescription>Configure system hostname and DNS servers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 主機名稱佔一整排 */}
                <div>
                  <Label htmlFor="hostname">Hostname</Label>
                  <Input
                    id="hostname"
                    value={dnsConfig.hostname}
                    onChange={(e) => setDnsConfig(prev => ({ ...prev, hostname: e.target.value }))}
                    placeholder="e.g., server-001"
                  />
                </div>
                
                {/* DNS伺服器分兩邊 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary-dns">Primary DNS</Label>
                    <Input
                      id="primary-dns"
                      value={dnsConfig.dns.primary}
                      onChange={(e) => setDnsConfig(prev => ({ 
                        ...prev, 
                        dns: { ...prev.dns, primary: e.target.value }
                      }))}
                      placeholder="e.g., 8.8.8.8"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="secondary-dns">Secondary DNS</Label>
                    <Input
                      id="secondary-dns"
                      value={dnsConfig.dns.secondary}
                      onChange={(e) => setDnsConfig(prev => ({ 
                        ...prev, 
                        dns: { ...prev.dns, secondary: e.target.value }
                      }))}
                      placeholder="e.g., 8.8.4.4"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveDNS} disabled={isLoading}
                    style={{ backgroundColor: '#7B86AA' }}
                    className="hover:opacity-90"
                  >
                    Save DNS Settings
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

      {/* 刪除路由確認對話框 */}
      <AlertDialog open={showDeleteRouteDialog} onOpenChange={setShowDeleteRouteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this route?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete the route with destination  <strong>{routeToDelete?.destination}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() =>handleDeleteRoute} disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
          <DialogTitle>Edit Network Interface - {iface?.name}</DialogTitle>
          <DialogDescription>Configure network interface parameters</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* IP設定方式選擇 */}
            <FormField
              control={form.control}
              name="dhcp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">IP Address Configuration</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      value={field.value ? "dhcp" : "manual"}
                      onValueChange={(value) => field.onChange(value === "dhcp")}
                      className="flex flex-row mt-3"
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <RadioGroupItem value="dhcp" id="dhcp" />
                        <Label htmlFor="dhcp" className="cursor-pointer">Automatic (DHCP)</Label>
                      </div>
                      <div className="flex items-center space-x-2 flex-1">
                        <RadioGroupItem value="manual" id="manual" />
                        <Label htmlFor="manual" className="cursor-pointer">Manual</Label>
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
                        <FormLabel>IPv4 Address</FormLabel>
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
                        <FormLabel>Subnet Mask</FormLabel>
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
                        <FormLabel>Gateway</FormLabel>
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
                        <FormLabel>MTU Size</FormLabel>
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
              <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
              <Button 
                type="submit" disabled={isLoading}
                style={{ backgroundColor: '#7B86AA' }}
                className="hover:opacity-90"  
              >
                Update
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
        <DialogTitle>{route ? 'Edit route' : 'Add route'}</DialogTitle>
        <DialogDescription>Configure network interface parameters</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="destinationNetwork"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Network</FormLabel>
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
                  <FormLabel>Next hop</FormLabel>
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
                      <FormLabel>Interface</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Interface" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {interfaces.map((iface: NetworkInterface) => (
                            <SelectItem key={iface.id} value={iface.name}>
                              {iface.name} ({iface.type === 'physical' ? 'Physical' : 'Virtual'})
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
                      <FormLabel>Metric</FormLabel>
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
                    <FormLabel>Source IP (Optional)</FormLabel>
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
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button 
              type="submit" disabled={isLoading}
              style={{ backgroundColor: '#7B86AA' }}
              className="hover:opacity-90"
            >
              {route ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

(NetworkConfigurationPage as any).meta = {
  requiresAuth: false, //驗證
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;

export default NetworkConfigurationPage;