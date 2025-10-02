import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel,  
} from "@/components/ui/form";
import {
  Table,
  TableBody,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ipAccessSchema, type IpAccessSettings, type IpEntry } from "./settings";

const IpAccessTab = () => {
  const { toast } = useToast();
  const [ipEntries, setIpEntries] = useState<{
    whitelist: IpEntry[];
    blacklist: IpEntry[];
  }>({
    whitelist: [
      { id: "1", name: "辦公室網路", ip: "192.168.1.0/24" },
      { id: "2", name: "管理員IP", ip: "10.0.0.1" }
    ],
    blacklist: [
      { id: "3", name: "惡意IP", ip: "192.168.100.1" }
    ]
  });

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEntryName, setNewEntryName] = useState("");
  const [newEntryIp, setNewEntryIp] = useState("");
  const [nameError, setNameError] = useState("");
  const [ipError, setIpError] = useState("");

  const form = useForm<IpAccessSettings>({
    resolver: zodResolver(ipAccessSchema),
    defaultValues: {
      enableIpRestriction: true,
      listType: "blacklist",
      allowedIps: "",
      whitelist: [],
      blacklist: []
    },
  });

  const currentListType = form.watch("listType");
  const isRestrictionEnabled = form.watch("enableIpRestriction");

  const handleSubmit = (values: IpAccessSettings) => {
    console.log("IP Access Control Settings:", values);
    toast({
      title: "IP Access Control Saved",
      description: "Your IP access control settings have been successfully updated",
    });
  };

  const handleAddIp = () => {
    console.log("handleAddIp called with:", { name: newEntryName, ip: newEntryIp });
    
    // 清除之前的錯誤
    setNameError("");
    setIpError("");
    
    if (!newEntryName.trim()) {
      console.log("Empty name field detected");
      setNameError("Please enter a description name for the IP");
      return;
    }

    if (!newEntryIp.trim()) {
      console.log("Empty IP field detected");
      setIpError("Please enter an IP address");
      return;
    }

    // 驗證IP格式 - 更嚴格的驗證
    const trimmedIp = newEntryIp.trim();
    console.log("Validating IP:", trimmedIp);
    
    // IPv4 地址格式驗證 (包含CIDR支援)
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:[0-9]|[1-2][0-9]|3[0-2]))?$/;
    
    if (!ipRegex.test(trimmedIp)) {
      console.log("IP validation failed for:", trimmedIp);
      setIpError("Please enter a valid IPv4 address, e.g., 192.168.1.1 or 192.168.1.0/24");
      return;
    }
    
    console.log("IP validation passed");

    const newEntry: IpEntry = {
      id: Date.now().toString(),
      name: newEntryName.trim(),
      ip: newEntryIp.trim()
    };

    setIpEntries(prev => ({
      ...prev,
      [currentListType]: [...prev[currentListType], newEntry]
    }));

    setNewEntryName("");
    setNewEntryIp("");
    setNameError("");
    setIpError("");
    setShowAddDialog(false);

    toast({
      title: "IP Added",
      description: `Successfully added IP to${currentListType === 'whitelist' ? 'Whitelist' : 'Blacklist'}`,
    });
  };

  const handleDeleteIp = (id: string) => {
    setIpEntries(prev => ({
      ...prev,
      [currentListType]: prev[currentListType].filter(entry => entry.id !== id)
    }));

    toast({
      title: "IP Deleted",
      description: `The IP has been removed from the${currentListType === 'whitelist' ? 'whitelist' : 'Blacklist'}`,
    });
  };

  const getCurrentEntries = () => {
    return ipEntries[currentListType];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            IP Access Control Settings
            {isRestrictionEnabled && (
              <Badge variant={currentListType === 'whitelist' ? 'default' : 'destructive'}>
                {currentListType === 'whitelist' ? 'Whitelist Mode' : 'Blacklist Mode'}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Manage system IP access permissions by setting whitelist or blacklist mode
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* 啟用IP限制開關 */}
              <FormField
                control={form.control}
                name="enableIpRestriction"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable IP Access Restriction
                      </FormLabel>
                      <FormDescription>
                        When enabled, IP access will be controlled based on the configured list
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* 只有在啟用IP限制時才顯示以下內容 */}
              {isRestrictionEnabled && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="listType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>List Type</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select list type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="blacklist">Blacklist (deny IPs in the list) (default)</SelectItem>
                            <SelectItem value="whitelist">Whitelist (only allow IPs in the list)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose whether to use whitelist or blacklist mode
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  {/* 新增IP按鈕 */}
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">
                      {currentListType === 'whitelist' ? 'whitelist' : 'Blacklist'}IP List
                    </h4>
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                      <DialogTrigger asChild>
                        <Button
                          style={{ backgroundColor: '#7B86AA' }}
                          className="hover:opacity-90"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add IP
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Add IP to {currentListType === 'whitelist' ? 'whitelist' : 'Blacklist'}
                          </DialogTitle>
                          <DialogDescription>
                            The added IP will be included in the {currentListType === 'whitelist' ? 'whitelist' : 'Blacklist'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">name</Label>
                            <Input
                              id="name"
                              value={newEntryName}
                              onChange={(e) => {
                                setNewEntryName(e.target.value);
                                if (nameError) setNameError("");
                              }}
                              placeholder="Enter a description for the IP, e.g., Office Network"
                              className={nameError ? "border-destructive" : ""}
                            />
                            {nameError && (
                              <p className="text-sm text-destructive mt-1">{nameError}</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="ip">IP Address</Label>
                            <Input
                              id="ip"
                              value={newEntryIp}
                              onChange={(e) => {
                                setNewEntryIp(e.target.value);
                                if (ipError) setIpError("");
                              }}
                              placeholder="Enter a valid IPv4 address, e.g., 192.168.1.1 or 192.168.1.0/24"
                              className={ipError ? "border-destructive" : ""}
                            />
                            {ipError && (
                              <p className="text-sm text-destructive mt-1">{ipError}</p>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleAddIp}
                            style={{ backgroundColor: '#7B86AA' }}
                            className="hover:opacity-90"
                          >
                            Add
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* IP清單 */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead className="text-right">Operation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCurrentEntries().map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">
                            {entry.name}
                          </TableCell>
                          <TableCell>{entry.ip}</TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete  "{entry.name}" ({entry.ip}) This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteIp(entry.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {getCurrentEntries().length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                            No IP addresses configured yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* 保存按鈕 */}
              <div className="flex justify-end pt-4 border-t">
                <Button 
                  type="submit"
                  onClick={form.handleSubmit(handleSubmit)}
                  style={{ backgroundColor: '#7B86AA' }}
                  className="hover:opacity-90"
                >
                  Save Settings
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default IpAccessTab;