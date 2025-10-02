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
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

const backupConfigSchema = z.object({
  enableAutoBackup: z.boolean().default(true),
  backupLocation: z.string().min(1, "Backup location is required"),
  backupFrequency: z.string().min(1, "Backup frequency is required"),
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

  const isAutoBackupEnabled = backupConfigForm.watch("enableAutoBackup");

  const handleBackupConfigSubmit = (values: z.infer<typeof backupConfigSchema>) => {
    console.log("Backup Configuration:", values);
    toast.success("Backup settings saved", {
      description: "Your backup configuration has been successfully updated",
    });
  };

  const handleImmediateBackup = async () => {
    try {
      toast.success("Backup started", {
        description: "Running immediate backup, please wait...",
      });
      
      // 模擬備份過程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Backup completed", {
        description: "System backup has been successfully created",
      });
    } catch (error) {
      console.error("Error during backup:", error);
      toast.error("Backup failed", {
        description: "An error occurred during backup, please try again later",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup Configuration</CardTitle>
        <CardDescription>
          Configure system backup options
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
                    <FormLabel className="text-base">Enable Auto Backup</FormLabel>
                    <FormDescription>
                      Automatically backup system data based on the configured frequency
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
            
            {/* 只有在啟用自動備份時才顯示設定選項 */}
            {isAutoBackupEnabled && (
              <Collapsible open={isAutoBackupEnabled}>
                <CollapsibleContent className="space-y-4">
                  {/* 備份位置改為下拉式選單 */}
                  <FormField
                    control={backupConfigForm.control}
                    name="backupLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Backup Location</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選擇備份位置" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="local">Local Storage</SelectItem>
                            <SelectItem value="cloud">Cloud Storage</SelectItem>
                            <SelectItem value="network">Network Drive</SelectItem>
                            <SelectItem value="external">External Storage</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the storage location for backup files
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
                        <FormLabel>Backup Frequency</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select backup frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose how often the system automatically backs up
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
                        <FormLabel>Retention Count</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="10" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Specify how many backup files to retain
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>
            )}
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleImmediateBackup}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Backup Now
              </Button>
            </div>

            {/* 保存按鈕 */}
            <div className="flex justify-end pt-4 border-t">
              <Button 
                type="submit"
                onClick={backupConfigForm.handleSubmit(handleBackupConfigSubmit)}
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
  );
};

export default BackupConfigTab;