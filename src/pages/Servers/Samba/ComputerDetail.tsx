import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Play,
  Square,
  RotateCcw,
  Monitor,
  Cpu,
  MemoryStick,
  Users,
  AlertTriangle,
  Loader2,
  Folder,
} from 'lucide-react';
import type {
  GetSambaRequest,
  GetSambaResponse,
  PostSambaActionRequest,
  PostSambaActionResponse,
} from './types';
import { toast } from 'sonner';

interface ComputerDetailProps {
  computerId: string;
  onBack: () => void;
}

export function ComputerDetail({ computerId, onBack }: ComputerDetailProps) {
  const [sambaStatus, setSambaStatus] = useState<GetSambaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'' | 'start' | 'stop' | 'restart'>('');

  /** 取得 Samba 狀態 */
  const fetchSambaStatus = useCallback(async () => {
    setLoading(true);
    try {
      const sendData: GetSambaRequest = { Uuid: computerId };
      const res = await axios.post<GetSambaResponse>('/api/server/samba', sendData);
      setSambaStatus(res.data);
    } catch (error) {
      console.error('Fetch Samba status failed:', error);
      toast.error('Error', { description: 'Failed to fetch Samba status' });
    } finally {
      setLoading(false);
    }
  }, [computerId]);

  useEffect(() => {
    fetchSambaStatus();
  }, [fetchSambaStatus]);

  /** 執行 Samba 操作 (Start / Stop / Restart) */
  const performAction = async (action: 'start' | 'stop' | 'restart') => {
    setActionLoading(action);
    try {
      const sendData: PostSambaActionRequest = { Uuid: computerId };
      const res = await axios.post<PostSambaActionResponse>(
        `/api/server/samba/action/${action}`,
        sendData,
      );
      const data = res.data;

      if (data.Type === 'Ok') {
        toast.success('Success', { description: `Samba ${action} succeeded` });
        fetchSambaStatus();
      } else {
        toast.error('Error', { description: `Samba ${action} failed: ${data.Message}` });
      }
    } catch (error) {
      console.error(`${action} failed`, error);
      toast.error('Error', { description: `Failed to ${action} Samba` });
    } finally {
      setActionLoading('');
    }
  };

  // Loading 狀態畫面
  if (loading) {
    return (
      <div className='p-6'>
        <div className='animate-pulse space-y-6'>
          <div className='h-8 bg-slate-200 rounded w-1/3'></div>
          <div className='grid grid-cols-4 gap-4'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='h-24 bg-slate-200 rounded'></div>
            ))}
          </div>
          <div className='h-64 bg-slate-200 rounded'></div>
        </div>
      </div>
    );
  }

  // 取得失敗畫面
  if (!sambaStatus) {
    return (
      <div className='p-6'>
        <Button onClick={onBack} variant='ghost' className='mb-4'>
          <ArrowLeft className='w-4 h-4 mr-2' /> Back
        </Button>
        <Card>
          <CardContent className='p-12 text-center'>
            <AlertTriangle className='w-12 h-12 text-red-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-slate-600 mb-2'>
              Failed to load Samba status
            </h3>
            <Button onClick={fetchSambaStatus}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 顯示 Samba 狀態與 Logs
  return (
    <div className='p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <Button onClick={onBack} variant='ghost'>
            <ArrowLeft className='w-4 h-4 mr-2' /> Back
          </Button>
          <div>
            <h1 className='text-2xl font-bold text-slate-800'>
              Samba Server - {sambaStatus.Hostname}
            </h1>
            <p className='text-slate-600'>{computerId}</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            onClick={() => performAction('start')}
            disabled={sambaStatus.Status === 'active' || actionLoading !== ''}
            className='bg-green-600 hover:bg-green-700'
          >
            {actionLoading === 'start' ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : (
              <Play className='w-4 h-4 mr-2' />
            )}
            Start
          </Button>
          <Button
            onClick={() => performAction('stop')}
            disabled={sambaStatus.Status === 'stopped' || actionLoading !== ''}
            variant='destructive'
          >
            {actionLoading === 'stop' ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : (
              <Square className='w-4 h-4 mr-2' />
            )}
            Stop
          </Button>
          <Button
            onClick={() => performAction('restart')}
            disabled={actionLoading !== ''}
            variant='outline'
          >
            {actionLoading === 'restart' ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : (
              <RotateCcw className='w-4 h-4 mr-2' />
            )}
            Restart
          </Button>
        </div>
      </div>

      {/* 系統資訊 */}
      <div className='grid grid-cols-4 gap-4 mb-6'>
        <Card>
          <CardContent className='p-4 flex items-center gap-3'>
            <Monitor className='w-8 h-8 text-blue-500' />
            <div>
              <p className='text-sm font-medium text-slate-600'>Status</p>
              <Badge className={sambaStatus.Status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
                {sambaStatus.Status === 'active' ? 'Running' : 'Stopped'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 flex items-center gap-3'>
            <Cpu className='w-8 h-8 text-purple-500' />
            <div>
              <p className='text-sm font-medium text-slate-600'>CPU Usage</p>
              <p className='text-xl font-bold'>{sambaStatus.Cpu}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 flex items-center gap-3'>
            <MemoryStick className='w-8 h-8 text-orange-500' />
            <div>
              <p className='text-sm font-medium text-slate-600'>Memory</p>
              <p className='text-xl font-bold'>{sambaStatus.Memory}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 flex items-center gap-3'>
            <Users className='w-8 h-8 text-green-500' />
            <div>
              <p className='text-sm font-medium text-slate-600'>Connections</p>
              <p className='text-xl font-bold'>{sambaStatus.Connections}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shares */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Samba Shares</CardTitle>
        </CardHeader>
        <CardContent>
          {sambaStatus.Shares.length === 0 ? (
            <p className='text-sm text-slate-500'>No shared folders</p>
          ) : (
            sambaStatus.Shares.map((share, i) => (
              <div
                key={i}
                className='border-b border-slate-200 py-3 flex justify-between items-center text-sm'
              >
                <div className='flex items-center gap-3'>
                  <Folder className='w-5 h-5 text-blue-600' />
                  <div>
                    <p className='font-semibold'>{share.Name}</p>
                    <p className='text-slate-500'>{share.Path}</p>
                  </div>
                </div>
                <div className='text-right'>
                  <Badge className={share.Status === 'active' ? 'bg-green-500' : 'bg-gray-400'}>
                    {share.Status}
                  </Badge>
                  <p className='text-xs text-slate-500'>{share.Users} users</p>
                  <p className='text-xs text-slate-600'>{share.Permissions}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Samba Logs ({sambaStatus.Logs.SambaLength})</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='all' className='w-full'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='all'>All</TabsTrigger>
              <TabsTrigger value='warn'>Warnings</TabsTrigger>
              <TabsTrigger value='error'>Errors</TabsTrigger>
            </TabsList>

            {['all', 'warn', 'error'].map((type) => (
              <TabsContent key={type} value={type} className='space-y-4'>
                {sambaStatus.Logs.SambaLog.filter(
                  (log) => type === 'all' || log.Level === type,
                ).map((log, i) => (
                  <Card key={i} className='border border-slate-200'>
                    <CardContent className='p-4 flex justify-between'>
                      <div>
                        <Badge
                          variant='outline'
                          className={`border ${
                            log.Level === 'error'
                              ? 'border-red-500 text-red-700'
                              : log.Level === 'warn'
                              ? 'border-yellow-500 text-yellow-700'
                              : 'border-green-500 text-green-700'
                          }`}
                        >
                          {log.Level.toUpperCase()}
                        </Badge>
                        <p className='text-sm mt-1'>{log.Message}</p>
                        <p className='text-xs text-slate-600 mt-1'>
                          Client: {log.Client} — {log.Event}
                        </p>
                      </div>
                      <div className='text-right text-xs text-slate-500'>
                        <p>
                          {log.Date.Month} {log.Date.Day}, {log.Date.Year}
                        </p>
                        <p>
                          {String(log.Date.Time.Hour).padStart(2, '0')}:
                          {String(log.Date.Time.Min).padStart(2, '0')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
