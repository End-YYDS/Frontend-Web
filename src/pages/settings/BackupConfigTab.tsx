import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { Database } from 'lucide-react';
import { backupConfigSchema, type BackupConfigFormValues } from './settings';

const BackupConfigTab = () => {
  const backupConfigForm = useForm<BackupConfigFormValues>({
    resolver: zodResolver(backupConfigSchema),
    defaultValues: {
      enableAutoBackup: true,
      backupLocation: 'local',
      backupFrequency: 'daily',
      retentionCount: 10,
    },
  });

  const isAutoBackupEnabled = backupConfigForm.watch('enableAutoBackup');

  // ✅ SubmitHandler<BackupConfigFormValues>，跟 useForm 泛型一致
  const handleBackupConfigSubmit: SubmitHandler<BackupConfigFormValues> = (values) => {
    console.log('Backup Configuration:', values);
    toast.success('Backup settings saved', {
      description: 'Your backup configuration has been successfully updated',
    });
  };

  const handleImmediateBackup = async () => {
    try {
      toast.success('Backup started', {
        description: 'Running immediate backup, please wait...',
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success('Backup completed', {
        description: 'System backup has been successfully created',
      });
    } catch (error) {
      console.error('Error during backup:', error);
      toast.error('Backup failed', {
        description: 'An error occurred during backup, please try again later',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup Configuration</CardTitle>
        <CardDescription>Configure system backup options</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...backupConfigForm}>
          <form
            onSubmit={backupConfigForm.handleSubmit(handleBackupConfigSubmit)}
            className='space-y-4'
          >
            {/* Enable Auto Backup */}
            <FormField
              control={backupConfigForm.control}
              name='enableAutoBackup'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Enable Auto Backup</FormLabel>
                    <FormDescription>
                      Automatically backup system data based on the configured frequency
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {isAutoBackupEnabled && (
              <Collapsible open={isAutoBackupEnabled}>
                <CollapsibleContent className='space-y-4'>
                  {/* Backup Location */}
                  <FormField
                    control={backupConfigForm.control}
                    name='backupLocation'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Backup Location</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='選擇備份位置' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='local'>Local Storage</SelectItem>
                            <SelectItem value='cloud'>Cloud Storage</SelectItem>
                            <SelectItem value='network'>Network Drive</SelectItem>
                            <SelectItem value='external'>External Storage</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the storage location for backup files
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Backup Frequency */}
                  <FormField
                    control={backupConfigForm.control}
                    name='backupFrequency'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Backup Frequency</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select backup frequency' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='daily'>Daily</SelectItem>
                            <SelectItem value='weekly'>Weekly</SelectItem>
                            <SelectItem value='monthly'>Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose how often the system automatically backs up
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Retention Count */}
                  <FormField
                    control={backupConfigForm.control}
                    name='retentionCount'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Retention Count</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='10'
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              // 避免 NaN，空字串時給 undefined 或 0 都可以，交給 zod 驗證
                              field.onChange(value === '' ? undefined : Number(value));
                            }}
                          />
                        </FormControl>
                        <FormDescription>Specify how many backup files to retain</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>
            )}

            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={handleImmediateBackup}
                className='flex items-center gap-2'
              >
                <Database className='h-4 w-4' />
                Backup Now
              </Button>
            </div>

            <div className='flex justify-end pt-4 border-t'>
              <Button
                type='submit'
                style={{ backgroundColor: '#7B86AA' }}
                className='hover:opacity-90'
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
