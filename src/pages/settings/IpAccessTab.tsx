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
import { Plus, Trash } from 'lucide-react';
import { toast } from "sonner";
import { ipAccessSchema, type IpAccessSettings, type IpEntry } from "./settings";

const IpAccessTab = () => {
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

  const form = useForm<z.infer<typeof ipAccessSchema>>({
  resolver: zodResolver(ipAccessSchema),
  defaultValues: {
    enableIpRestriction: true,
    listType: "blacklist",
    allowedIps: "",
    whitelist: [],
    blacklist: [],
  },
});

  const currentListType = form.watch("listType");
  const isRestrictionEnabled = form.watch("enableIpRestriction");

  const handleSubmit = (values: IpAccessSettings) => {
    console.log("IP存取控制設定:", values);
    toast.success("IP存取控制已儲存", {
      description: "您的IP存取控制設定已成功更新",
    });
  };

  const handleAddIp = () => {
    if (!newEntryName.trim() || !newEntryIp.trim()) {
      toast.error("輸入錯誤", {
        description: "請填寫完整的名稱和IP地址",
      });
      return;
    }

    // 驗證IP格式
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    if (!ipRegex.test(newEntryIp.trim())) {
      toast.error("IP格式錯誤", {
        description: "請輸入有效的IPv4地址",
      });
      return;
    }

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
    setShowAddDialog(false);

    toast.success("IP已新增", {
      description: `已成功新增IP到${currentListType === 'whitelist' ? '白名單' : '黑名單'}`,
    });
  };

  const handleDeleteIp = (id: string) => {
    setIpEntries(prev => ({
      ...prev,
      [currentListType]: prev[currentListType].filter(entry => entry.id !== id)
    }));

    toast.success("IP已刪除", {
      description: `已從${currentListType === 'whitelist' ? '白名單' : '黑名單'}中刪除IP`,
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
            IP存取控制設定
            {isRestrictionEnabled && (
              <Badge variant={currentListType === 'whitelist' ? 'default' : 'destructive'}>
                {currentListType === 'whitelist' ? '白名單模式' : '黑名單模式'}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            管理系統的IP存取權限，設定白名單或黑名單模式
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
                        啟用IP存取限制
                      </FormLabel>
                      <FormDescription>
                        開啟後將根據設定的名單控制IP存取權限
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
                        <FormLabel>名單類型</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="選擇名單類型" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="blacklist">黑名單（拒絕列表中的IP）(預設)</SelectItem>
                            <SelectItem value="whitelist">白名單（只允許列表中的IP）</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          選擇要使用白名單還是黑名單模式
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  {/* 新增IP按鈕 */}
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">
                      {currentListType === 'whitelist' ? '白名單' : '黑名單'}IP清單
                    </h4>
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          新增IP
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            新增IP到{currentListType === 'whitelist' ? '白名單' : '黑名單'}
                          </DialogTitle>
                          <DialogDescription>
                            新增的IP將會被加入到{currentListType === 'whitelist' ? '白名單' : '黑名單'}中
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">名稱</Label>
                            <Input
                              id="name"
                              value={newEntryName}
                              onChange={(e) => setNewEntryName(e.target.value)}
                              placeholder="輸入IP描述名稱"
                            />
                          </div>
                          <div>
                            <Label htmlFor="ip">IP地址</Label>
                            <Input
                              id="ip"
                              value={newEntryIp}
                              onChange={(e) => setNewEntryIp(e.target.value)}
                              placeholder="例如：192.168.1.1 或 192.168.1.0/24"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                            取消
                          </Button>
                          <Button onClick={handleAddIp}>
                            新增
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* IP清單 */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>名稱</TableHead>
                        <TableHead>IP地址</TableHead>
                        <TableHead className="text-right">操作</TableHead>
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteIp(entry.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {getCurrentEntries().length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                            暫無任何IP地址設定
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              <Button type="submit">
                儲存設定
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default IpAccessTab;