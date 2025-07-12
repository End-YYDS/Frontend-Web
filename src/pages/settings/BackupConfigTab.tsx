import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Database } from 'lucide-react';

const backupConfigSchema = z.object({
  enableAutoBackup: z.boolean().default(true),
  backupLocation: z.string().min(1, "備份位置為必填"),
  backupFrequency: z.string().min(1, "備份頻率為必填"),
  retentionCount: z.number().min(1).max(100).default(10),
});

const BackupConfigTab = () => {
  const backupConfigForm = useForm<z.infer<typeof backupConfigSchema>>({
    resolver: zodResolver(backupConfigSchema),
    defaultValues: {
      enableAutoBackup: true,
      backupLocation: "local",
      backupFrequency: "daily",
      retentionCount: 10,
    },
  });

  const handleBackupConfigSubmit = (values: z.infer<typeof backupConfigSchema>) => {
    console.log("備份配置:", values);
    toast.success("備份設定已儲存", {
      description: "您的備份配置已成功更新",
    });
  };

  const handleImmediateBackup = async () => {
    try {
      toast.success("開始備份", {
        description: "正在執行立即備份，請稍候...",
      });
      
      // 模擬備份過程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("備份完成", {
        description: "系統備份已成功建立",
      });
    } catch (error) {
      console.error("Error during backup:", error);
      toast.error("備份失敗", {
        description: "備份過程中發生錯誤，請稍後再試",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>備份配置</CardTitle>
        <CardDescription>
          設定系統備份相關選項
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...backupConfigForm}>
          <form onSubmit={backupConfigForm.handleSubmit(handleBackupConfigSubmit)} className="space-y-4">
            {/* 啟用自動備份開關移到最上面 */}
            <FormField
              control={backupConfigForm.control}
              name="enableAutoBackup"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">啟用自動備份</FormLabel>
                    <FormDescription>
                      按照設定的頻率自動備份系統資料
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
            
            {/* 備份位置改為下拉式選單 */}
            <FormField
              control={backupConfigForm.control}
              name="backupLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>備份位置</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇備份位置" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="local">本地儲存</SelectItem>
                      <SelectItem value="cloud">雲端儲存</SelectItem>
                      <SelectItem value="network">網路磁碟</SelectItem>
                      <SelectItem value="external">外部儲存</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    選擇備份檔案的儲存位置
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={backupConfigForm.control}
              name="backupFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>備份頻率</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇備份頻率" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">每日</SelectItem>
                      <SelectItem value="weekly">每週</SelectItem>
                      <SelectItem value="monthly">每月</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    選擇系統自動備份的頻率
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 保留天數改為保留份數 */}
            <FormField
              control={backupConfigForm.control}
              name="retentionCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>保留份數</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="10" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    指定備份檔案保留的份數
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-2">
              <Button type="submit">保存設定</Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleImmediateBackup}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                立即備份
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BackupConfigTab;