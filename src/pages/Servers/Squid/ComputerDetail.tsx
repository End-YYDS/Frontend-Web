import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Play,
  Square,
  RotateCcw,
  Monitor,
  Cpu,
  MemoryStick,
  Users,
  Loader2,
  Database,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import type {
  GetSquidRequest,
  GetSquidResponse,
  PostSquidActionRequest,
  PostSquidActionResponse,
} from './types';
import { toast } from 'sonner';

interface ComputerDetailProps {
  computerId: string;
  onBack: () => void;
}

export function ComputerDetail({ computerId, onBack }: ComputerDetailProps) {
  const [squidStatus, setSquidStatus] = useState<GetSquidResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'' | 'start' | 'stop' | 'restart'>('');

  /** 取得 Squid 狀態 */
  const fetchSquidStatus = useCallback(async () => {
    setLoading(true);
    try {
      const sendData: GetSquidRequest = { Uuid: computerId };
      const res = await axios.post<GetSquidResponse>('/api/server/squid', sendData);
      setSquidStatus(res.data);
    } catch (error) {
      console.error('Fetch Squid status failed:', error);
      toast.error('Error', { description: 'Failed to fetch Squid status' });
    } finally {
      setLoading(false);
    }
  }, [computerId]);

  useEffect(() => {
    fetchSquidStatus();
  }, [fetchSquidStatus]);

  /** 執行 Squid 操作 (Start / Stop / Restart) */
  const performAction = async (action: 'start' | 'stop' | 'restart') => {
    setActionLoading(action);
    try {
      const sendData: PostSquidActionRequest = { Uuid: computerId };
      const res = await axios.post<PostSquidActionResponse>(
        `/api/server/squid/action/${action}`,
        sendData,
      );
      const data = res.data;

      if (data.Type === 'Ok') {
        toast.success('Success', { description: `Squid ${action} succeeded` });
        fetchSquidStatus();
      } else {
        toast.error('Error', { description: `Squid ${action} failed: ${data.Message}` });
      }
    } catch (error) {
      console.error(`${action} failed`, error);
      toast.error('Error', { description: `Failed to ${action} Squid` });
    } finally {
      setActionLoading('');
    }
  };

  // Loading 狀態畫面
  if (loading) {
    return (
      <div className='p-6 animate-pulse space-y-6'>
        <div className='h-8 bg-slate-200 rounded w-1/3'></div>
        <div className='grid grid-cols-4 gap-4'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='h-24 bg-slate-200 rounded'></div>
          ))}
        </div>
        <div className='h-64 bg-slate-200 rounded'></div>
      </div>
    );
  }

  // 取得失敗畫面
  if (!squidStatus) {
    return (
      <div className='p-6'>
        <Button onClick={onBack} variant='ghost' className='mb-4'>
          <ArrowLeft className='w-4 h-4 mr-2' /> Back
        </Button>
        <Card>
          <CardContent className='p-12 text-center'>
            <AlertTriangle className='w-12 h-12 text-red-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-slate-600 mb-2'>
              Failed to load Squid status
            </h3>
            <Button onClick={fetchSquidStatus}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /** 顯示 Squid 狀態與 Logs */
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
              Squid Server - {squidStatus.Hostname}
            </h1>
            <p className='text-slate-600'>{computerId}</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            onClick={() => performAction('start')}
            disabled={squidStatus.Status === 'active' || actionLoading !== ''}
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
            disabled={squidStatus.Status === 'stopped' || actionLoading !== ''}
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
      <div className='grid grid-cols-3 md:grid-cols-6 gap-4 mb-6'>
        <InfoCard icon={<Monitor className='text-blue-500' />} label='Status'>
          <Badge className={squidStatus.Status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
            {squidStatus.Status === 'active' ? 'Running' : 'Stopped'}
          </Badge>
        </InfoCard>
        <InfoCard icon={<Cpu className='text-purple-500' />} label='CPU'>
          {squidStatus.Cpu}%
        </InfoCard>
        <InfoCard icon={<MemoryStick className='text-orange-500' />} label='Memory'>
          {squidStatus.Memory}%
        </InfoCard>
        <InfoCard icon={<Users className='text-green-500' />} label='Connections'>
          {squidStatus.Connections}
        </InfoCard>
        <InfoCard icon={<Database className='text-indigo-500' />} label='Cache Hits'>
          {squidStatus.CacheHits}
        </InfoCard>
        <InfoCard icon={<BarChart3 className='text-pink-500' />} label='Requests'>
          {squidStatus.RequestsProcessed}
        </InfoCard>
      </div>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Access Logs ({squidStatus.Logs.AccLength})</CardTitle>
        </CardHeader>
        <CardContent>
          {squidStatus.Logs.AccessLog.length === 0 ? (
            <p className='text-sm text-slate-500'>No access logs available</p>
          ) : (
            <div className='space-y-3'>
              {squidStatus.Logs.AccessLog.map((log, i) => (
                <Card key={i} className='border border-slate-200'>
                  <CardContent className='p-4 flex justify-between items-center'>
                    <div className='text-sm'>
                      <p className='font-semibold text-slate-700'>
                        {log.Method} {log.Url}
                      </p>
                      <p className='text-xs text-slate-600'>
                        {log.Ip} | {log.Status} | {log.BytesServed} bytes
                      </p>
                      <p className='text-xs text-slate-500 mt-1'>{log.UserAgent}</p>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** 小卡片元件 */
function InfoCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className='p-4 flex items-center gap-3'>
        <div className='w-8 h-8'>{icon}</div>
        <div>
          <p className='text-sm font-medium text-slate-600'>{label}</p>
          <p className='text-xl font-bold'>{children}</p>
        </div>
      </CardContent>
    </Card>
  );
}
