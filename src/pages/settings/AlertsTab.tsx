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
    console.log("警告設定:", values);
    toast.success("警告設定已儲存", {
      description: "您的系統監控警告設定已成功更新",
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
    toast.success("已重設為預設值", {
      description: "所有警告設定已重設為系統預設值",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>系統監控警告設定</CardTitle>
        <CardDescription>
          設定系統資源使用量的警告閾值，當超過設定值時將發送通知
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
                      啟用通知
                    </FormLabel>
                    <FormDescription>
                      開啟後當資源使用量超過警告閾值時將發送通知
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
                        <FormLabel>CPU使用率警告閾值 (%)</FormLabel>
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
                          當CPU使用率超過此百分比時發送警告（1-100%）
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
                        <FormLabel>磁碟使用率警告閾值 (%)</FormLabel>
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
                          當磁碟使用率超過此百分比時發送警告（1-100%）
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
                        <FormLabel>記憶體使用率警告閾值 (%)</FormLabel>
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
                          當記憶體使用率超過此百分比時發送警告（1-100%）
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
                        <FormLabel>網路使用率警告閾值 (%)</FormLabel>
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
                          當網路使用率超過此百分比時發送警告（1-100%）
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
                重設為預設值
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AlertsTab;