import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { toast } from "sonner";
import axios from "axios";
import { alertSettingsSchema } from "./settings";
import type { z } from "zod";
import type { Values, ValuesUpdate } from "./types";

type AlertSettings = z.infer<typeof alertSettingsSchema>;

const AlertsTab = () => {
  const [loading, setLoading] = useState(true);

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



  // -------------------- Fetch API --------------------
  const fetchValues = async () => {
    try {
      const res = await axios.get<Values>("/api/chm/setting/values", { withCredentials: true });
      form.reset({
        enableNotifications: true,
        cpuUsage: res.data.Cpu_usage ?? 80,
        diskUsage: res.data.Disk_usage ?? 90,
        memory: res.data.Memory ?? 80,
        network: res.data.Network ?? 85,
      });
    } catch (err) {
      toast.error("Failed to fetch alert settings, using defaults");
      // 保留預設值，API 失敗也不改
    } finally {
      setLoading(false);
    }
  };

  // Reset Defaults 保留原本預設值
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

  useEffect(() => {
    fetchValues();
  }, []);

  // -------------------- Save API --------------------
  const handleSubmit = async (values: AlertSettings) => {
    const payload: ValuesUpdate = {
      Cpu_usage: values.cpuUsage,
      Disk_usage: values.diskUsage,
      Memory: values.memory,
      Network: values.network,
    };

    try {
      const res = await axios.put<{ Type: "OK" | "ERR"; Message: string }>("/api/chm/setting/values", payload, { withCredentials: true });
      if (res.data.Type === "OK") {
        toast.success("Alert settings saved", { description: res.data.Message });
        fetchValues(); // refresh
      } else {
        toast.error(res.data.Message);
      }
    } catch (err) {
      toast.error("Failed to save alert settings");
    }
  };

  if (loading) return <div>Loading...</div>;

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
            {/* Enable Notifications */}
            <FormField
              control={form.control}
              name="enableNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Enable Notifications</FormLabel>
                    <FormDescription>Notifications will be sent when resource usage exceeds thresholds.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {isNotificationsEnabled && (
              <Collapsible open={isNotificationsEnabled}>
                <CollapsibleContent className="space-y-4">
                  {/* CPU */}
                  <FormField
                    control={form.control}
                    name="cpuUsage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPU Usage Alert Threshold (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} min={0} max={100} />
                        </FormControl>
                        <FormDescription>Alert when CPU usage exceeds this percentage (0-100%).</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Disk */}
                  <FormField
                    control={form.control}
                    name="diskUsage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disk Usage Alert Threshold (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} min={0} max={100} />
                        </FormControl>
                        <FormDescription>Alert when disk usage exceeds this percentage (0-100%).</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Memory */}
                  <FormField
                    control={form.control}
                    name="memory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Memory Usage Alert Threshold (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} min={0} max={100} />
                        </FormControl>
                        <FormDescription>Alert when memory usage exceeds this percentage (0-100%).</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Network */}
                  <FormField
                    control={form.control}
                    name="network"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Network Usage Alert Threshold (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} min={0} max={100} />
                        </FormControl>
                        <FormDescription>Alert when network usage exceeds this percentage (0-100%).</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>
            )}

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={handleResetDefaults}>Reset to Defaults</Button>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" style={{ backgroundColor: "#7B86AA" }} className="hover:opacity-90">
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