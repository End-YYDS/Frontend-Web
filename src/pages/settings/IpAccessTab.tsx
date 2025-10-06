import { useState, useEffect } from 'react';
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
import axios from "axios";
import type { Mode, GetIpResponse, PostIpRequest, DeleteIpRequest, PutIpRequest } from "./types";

const IpAccessTab = () => {
  const { toast } = useToast();
  const [ipEntries, setIpEntries] = useState<{ whitelist: IpEntry[]; blacklist: IpEntry[] }>({ whitelist: [], blacklist: [] });
  const [, setMode] = useState<Mode>("None");
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
    }
  } as any); // Explicitly cast to avoid type mismatch

  const currentListType = form.watch("listType");
  const isRestrictionEnabled = form.watch("enableIpRestriction");

  // -------------------- Fetch IPs --------------------
  const fetchIpList = async () => {
    try {
      const res = await axios.get<GetIpResponse>("/api/chm/setting/ip", { withCredentials: true });
      setMode(res.data.Mode);
      if (res.data.Lists) {
        const whitelist: IpEntry[] = [];
        const blacklist: IpEntry[] = [];
        Object.entries(res.data.Lists).forEach(([did, entry]) => {
          const item: IpEntry = { id: did, name: entry.Name, ip: entry.Ip };
          if (res.data.Mode === "White") whitelist.push(item);
          else if (res.data.Mode === "Black") blacklist.push(item);
        });
        setIpEntries({ whitelist, blacklist });
      } else {
        setIpEntries({ whitelist: [], blacklist: [] });
      }
    } catch (err) {
      toast({ title: "Fetch Error", description: "Unable to retrieve IP list" });
    }
  };

  useEffect(() => {
    fetchIpList();
  }, []);

  // -------------------- Add IP --------------------
  const handleAddIp = async () => {
    setNameError(""); setIpError("");
    if (!newEntryName.trim()) { setNameError("Please enter a description name"); return; }
    if (!newEntryIp.trim()) { setIpError("Please enter an IP address"); return; }

    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:[0-9]|[1-2][0-9]|3[0-2]))?$/;
    if (!ipRegex.test(newEntryIp.trim())) { setIpError("Invalid IPv4 format"); return; }

    try {
      const payload: PostIpRequest = {
        Mode: currentListType === "whitelist" ? "White" : "Black",
        Name: newEntryName.trim(),
        Ip: newEntryIp.trim()
      };
      const res = await axios.post("/api/chm/setting/ip", payload, { withCredentials: true });
      if (res.data.Type === "OK") {
        toast({ title: "IP Added", description: `Added to ${currentListType}` });
        fetchIpList();
        setNewEntryName(""); setNewEntryIp(""); setShowAddDialog(false);
      } else {
        toast({ title: "Add Failed", description: res.data.Message });
      }
    } catch (err) {
      toast({ title: "Add Failed", description: "Unable to add IP" });
    }
  };

  // -------------------- Delete IP --------------------
  const handleDeleteIp = async (id: string) => {
    try {
      const payload: DeleteIpRequest = { Mode: currentListType === "whitelist" ? "White" : "Black", Did: id };
      const res = await axios.delete("/api/chm/setting/ip", { data: payload, withCredentials: true });
      if (res.data.Type === "OK") {
        toast({ title: "IP Deleted", description: `Removed from ${currentListType}` });
        fetchIpList();
      } else {
        toast({ title: "Delete Failed", description: res.data.Message });
      }
    } catch (err) {
      toast({ title: "Delete Failed", description: "Unable to delete IP" });
    }
  };

  const getCurrentEntries = () => ipEntries[currentListType];

  // -------------------- Save Settings (Mode Switch) --------------------
  const handleSubmit = async (values: IpAccessSettings) => {
    try {
      const payload: PutIpRequest = { Mode: values.listType === "whitelist" ? "White" : "Black" };
      const res = await axios.put("/api/chm/setting/ip", payload, { withCredentials: true });
      if (res.data.Type === "OK") toast({ title: "Saved", description: res.data.Message });
      else toast({ title: "Save Failed", description: res.data.Message });
      fetchIpList();
    } catch (err) {
      toast({ title: "Save Failed", description: "Unable to save IP access settings" });
    }
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