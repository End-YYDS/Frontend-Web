import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { toast } from "sonner";
import { alertSettingsSchema } from "./settings";
import type { z } from "zod";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

type AlertSettings = z.infer<typeof alertSettingsSchema>;

const AlertsTab = () => {
  const form = useForm<AlertSettings>({
    resolver: zodResolver(alertSettingsSchema),
    defaultValues: {
      enableNotifications: true,
      cpuUsage: 80,
      diskUsage: 90,
      memory: 80,
      network: 85,
    },
  });

  const isNotificationsEnabled = form.watch("enableNotifications");

  const handleSubmit = (values: AlertSettings) => {
    console.log("Alert Settings:", values);
    toast.success("Alert settings saved", {
      description: "Your system monitoring alert settings have been successfully updated",
    });
  };

  const handleResetDefaults = () => {
    form.reset({
      enableNotifications: true,
      cpuUsage: 80,
      diskUsage: 90,
      memory: 80,
      network: 85,
    });
    toast.success("Reset to defaults", {
      description: "All alert settings have been reset to system default values",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Monitoring Alert Settings</CardTitle>
        <CardDescription>
          Set alert thresholds for system resource usage. Notifications will be sent when usage exceeds the thresholds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* 啟用通知開關 - 移至最上面 */}
            <FormField
              control={form.control}
              name="enableNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Notifications
                    </FormLabel>
                    <FormDescription>
                      Notifications will be sent when resource usage exceeds the thresholds.
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

            {/* 只有在啟用通知時才顯示警告設定 */}
            {isNotificationsEnabled && (
              <Collapsible open={isNotificationsEnabled}>
                <CollapsibleContent className="space-y-4">
                  {/* CPU使用率警告 */}
                  <FormField
                    control={form.control}
                    name="cpuUsage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPU Usage Alert Threshold (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                            min={1}
                            max={100}
                          />
                        </FormControl>
                        <FormDescription>
                          Send an alert when CPU usage exceeds this percentage (1-100%).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 磁碟使用率警告 */}
                  <FormField
                    control={form.control}
                    name="diskUsage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disk Usage Alert Threshold (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                            min={1}
                            max={100}
                          />
                        </FormControl>
                        <FormDescription>
                          Send an alert when disk usage exceeds this percentage (1-100%).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 記憶體使用率警告 */}
                  <FormField
                    control={form.control}
                    name="memory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Memory Usage Alert Threshold (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                            min={1}
                            max={100}
                          />
                        </FormControl>
                        <FormDescription>
                          Send an alert when memory usage exceeds this percentage (1-100%).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 網路使用率警告 */}
                  <FormField
                    control={form.control}
                    name="network"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Network Usage Alert Threshold (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                            min={1}
                            max={100}
                          />
                        </FormControl>
                        <FormDescription>
                          Send an alert when network usage exceeds this percentage (1-100%).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>
            )}
            
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleResetDefaults}
              >
                Reset to Defaults
              </Button>
            </div>

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
  );
};

export default AlertsTab;