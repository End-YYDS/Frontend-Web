import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { getAlertThresholds, updateAlertThresholds } from './types';
import { alertSettingsSchema } from './settings';
import type { z } from 'zod';

type AlertSettings = z.infer<typeof alertSettingsSchema>;

const defaultThreshold = { warn: 0, dang: 0 };
const thresholdDefaults = () => ({ ...defaultThreshold });
type ThresholdGroup = {
  cpu: { warn: number; dang: number };
  disk: { warn: number; dang: number };
  memory: { warn: number; dang: number };
};

const AlertsTab = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const lastFetchedRef = useRef<ThresholdGroup>({
    cpu: thresholdDefaults(),
    disk: thresholdDefaults(),
    memory: thresholdDefaults(),
  });
  const initialFetchedRef = useRef<ThresholdGroup | null>(null);

  const form = useForm<AlertSettings>({
    resolver: zodResolver(alertSettingsSchema),
    defaultValues: {
      enableNotifications: true,
      cpu: thresholdDefaults(),
      disk: thresholdDefaults(),
      memory: thresholdDefaults(),
    },
  });

  const isNotificationsEnabled = form.watch('enableNotifications');

  const fetchValues = useCallback(async (opts?: { withLoading?: boolean }) => {
    if (opts?.withLoading ?? true) setLoading(true);
    try {
      const res = await getAlertThresholds();
      const cpu = res.data?.Cpu_usage ?? { Warn: 0, Dang: 0 };
      const disk = res.data?.Disk_usage ?? { Warn: 0, Dang: 0 };
      const memory = res.data?.Memory ?? { Warn: 0, Dang: 0 };

      const nextThresholds = {
        cpu: { warn: cpu.Warn ?? 0, dang: cpu.Dang ?? 0 },
        disk: { warn: disk.Warn ?? 0, dang: disk.Dang ?? 0 },
        memory: { warn: memory.Warn ?? 0, dang: memory.Dang ?? 0 },
      };

      lastFetchedRef.current = nextThresholds;
      if (!initialFetchedRef.current) {
        initialFetchedRef.current = nextThresholds;
      }
      form.reset({
        enableNotifications: true,
        ...nextThresholds,
      });
      return true;
    } catch {
      toast.error('Failed to fetch alert settings, using defaults');
      const fallback = lastFetchedRef.current ?? {
        cpu: thresholdDefaults(),
        disk: thresholdDefaults(),
        memory: thresholdDefaults(),
      };
      lastFetchedRef.current = fallback;
      form.reset({
        enableNotifications: true,
        ...fallback,
      });
      return false;
    } finally {
      if (opts?.withLoading ?? true) setLoading(false);
    }
  }, [form]);

  const handleResetDefaults = async () => {
    if (initialFetchedRef.current) {
      form.reset({
        enableNotifications: true,
        ...initialFetchedRef.current,
      });
      toast.success('Reset to defaults', {
        description: 'Restored to initial values from server',
      });
      return;
    }

    const ok = await fetchValues({ withLoading: false });
    if (ok) {
      toast.success('Reset to defaults', {
        description: 'All alert settings have been restored from server values',
      });
    } else {
      toast.error('Unable to reset; could not reach server');
    }
  };

  useEffect(() => {
    fetchValues();
  }, [fetchValues]);

  const handleSubmit = async (values: AlertSettings) => {
    const payload = {
      Cpu_usage: { Warn: values.cpu.warn, Dang: values.cpu.dang },
      Disk_usage: { Warn: values.disk.warn, Dang: values.disk.dang },
      Memory: { Warn: values.memory.warn, Dang: values.memory.dang },
    };

    try {
      setSaving(true);
      const res = await updateAlertThresholds(payload);
      if (res.data.Type === 'Ok') {
        toast.success('Alert settings saved', { description: res.data.Message });
        fetchValues();
      } else {
        // console.log(res.data.Type);
        toast.error(res.data.Message);
      }
    } catch {
      toast.error('Failed to save alert settings');
    } finally {
      setSaving(false);
    }
  };

  const handleNumericChange = (onChange: (value: number) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    onChange(Number.isNaN(value) ? 0 : value);
  };

  const renderThresholdGroup = (
    name: 'cpu' | 'memory' | 'disk',
    label: string,
    description: string,
  ) => (
    <div className='space-y-2'>
      <FormLabel>{label}</FormLabel>
      <div className='grid gap-3 sm:grid-cols-2'>
        <FormField
          control={form.control}
          name={`${name}.warn`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-xs text-muted-foreground'>Warning</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  step='0.1'
                  min={0}
                  max={100}
                  value={field.value}
                  onChange={handleNumericChange(field.onChange)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${name}.dang`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-xs text-muted-foreground'>Danger</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  step='0.1'
                  min={0}
                  max={100}
                  value={field.value}
                  onChange={handleNumericChange(field.onChange)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormDescription>{description}</FormDescription>
    </div>
  );

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Monitoring Alert Settings</CardTitle>
        <CardDescription>
          Set alert thresholds for system resource usage. Notifications will be sent when usage
          exceeds the thresholds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='enableNotifications'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel>Enable Notifications</FormLabel>
                    <FormDescription>
                      Notifications will be sent when resource usage exceeds thresholds.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {isNotificationsEnabled && (
              <Collapsible open={isNotificationsEnabled}>
                <CollapsibleContent className='space-y-6'>
                  {renderThresholdGroup(
                    'cpu',
                    'CPU Usage Alert Threshold (%)',
                    'Alert when CPU usage exceeds the warning or danger thresholds (0-100%).',
                  )}
                  {renderThresholdGroup(
                    'memory',
                    'Memory Usage Alert Threshold (%)',
                    'Alert when memory usage exceeds the warning or danger thresholds (0-100%).',
                  )}
                  {renderThresholdGroup(
                    'disk',
                    'Disk Usage Alert Threshold (%)',
                    'Alert when disk usage exceeds the warning or danger thresholds (0-100%).',
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}

            <div className='flex space-x-2'>
              <Button type='button' variant='outline' onClick={handleResetDefaults}>
                Reset to Defaults
              </Button>
            </div>

            <div className='flex justify-end pt-4 border-t'>
              <Button
                type='submit'
                style={{ backgroundColor: '#7B86AA' }}
                className='hover:opacity-90'
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AlertsTab;
