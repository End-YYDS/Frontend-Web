import { useCallback, useEffect, useRef, useState } from 'react';
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
  Network,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  actionRestart,
  actionStart,
  actionStop,
  getApacheAll,
  type ApacheResponse,
  type UuidRequest,
} from '@/api/openapi-client';

interface ComputerDetailProps {
  computerId: string;
  onBack: () => void;
}

export function ComputerDetail({ computerId, onBack }: ComputerDetailProps) {
  const [serverStatus, setServerStatus] = useState<ApacheResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'' | 'start' | 'stop' | 'restart'>('');
  const headerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const backWrapperRef = useRef<HTMLDivElement>(null);
  const hostnameRef = useRef<HTMLHeadingElement>(null);
  const uuidMeasureRef = useRef<HTMLParagraphElement>(null);
  const [showUuid, setShowUuid] = useState(true);

  const updateUuidVisibility = useCallback(() => {
    if (
      !headerRef.current ||
      !actionsRef.current ||
      !backWrapperRef.current ||
      !hostnameRef.current ||
      !uuidMeasureRef.current
    ) {
      return;
    }

    const headerWidth = headerRef.current.clientWidth;
    const actionsWidth = actionsRef.current.scrollWidth;
    const backWidth = backWrapperRef.current.clientWidth;
    const hostnameWidth = hostnameRef.current.offsetWidth;
    const uuidWidth = uuidMeasureRef.current.scrollWidth;

    const gapBetweenButtonAndText = 16; // gap-4
    const buffer = 8;
    const textWidthWithUuid = Math.max(hostnameWidth, uuidWidth);
    const leftWidthWithUuid = backWidth + gapBetweenButtonAndText + textWidthWithUuid;
    const canShowUuid = leftWidthWithUuid + actionsWidth + buffer <= headerWidth;

    setShowUuid(canShowUuid);
  }, []);

  /** 取得 Apache 狀態 */
  const fetchServerStatus = useCallback(async () => {
    setLoading(true);
    try {
      const sendData: UuidRequest = { Uuid: computerId };
      const res = await getApacheAll({ query: sendData });
      if (!res.data || typeof res.data !== 'object') {
        throw new Error('Invalid response data');
      }
      setServerStatus(res.data);
    } catch (error) {
      console.error('Fetch server status failed:', error);
      toast.error('Error', { description: 'Failed to fetch server status' });
    } finally {
      setLoading(false);
    }
  }, [computerId]);

  useEffect(() => {
    fetchServerStatus();
  }, [fetchServerStatus]);

  useEffect(() => {
    updateUuidVisibility();
    const handleResize = () => updateUuidVisibility();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateUuidVisibility]);

  useEffect(() => {
    updateUuidVisibility();
  }, [computerId, serverStatus?.Hostname, updateUuidVisibility]);

  /** 執行 Apache 操作 (Start / Stop / Restart) */
  const performAction = async (action: 'start' | 'stop' | 'restart') => {
    setActionLoading(action);
    const actionMap = {
      start: actionStart,
      stop: actionStop,
      restart: actionRestart,
    };
    try {
      const sendData: UuidRequest = { Uuid: computerId };
      const { data } = await actionMap[action]({ body: sendData });
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response data');
      }
      if (data.Type === 'Ok') {
        toast.success('Success', { description: `Server ${action} succeeded` });
        fetchServerStatus();
      } else {
        toast.error('Error', { description: data.Message || `Failed to ${action} server` });
      }
    } catch (error) {
      console.error(`${action} failed`, error);
      toast.error('Error', { description: `Failed to ${action} server` });
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
  if (!serverStatus) {
    return (
      <div className='p-6'>
        <Button onClick={onBack} variant='ghost' className='mb-4'>
          <ArrowLeft className='w-4 h-4 mr-2' /> Back
        </Button>
        <Card>
          <CardContent className='p-12 text-center'>
            <AlertTriangle className='w-12 h-12 text-red-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-slate-600 mb-2'>
              Failed to load server status
            </h3>
            <Button onClick={fetchServerStatus}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 顯示 Apache 狀態與 Logs
  return (
    <div className="p-6 w-full max-w-[1400px] mx-auto overflow-x-hidden">
      {/* Header */}
      <div ref={headerRef} className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <div ref={backWrapperRef}>
            <Button onClick={onBack} variant='ghost'>
              <ArrowLeft className='w-4 h-4 mr-2' /> Back
            </Button>
          </div>
          <div className='relative'>
            <h1 ref={hostnameRef} className='text-2xl font-bold text-slate-800'>
              {serverStatus.Hostname}
            </h1>
            {showUuid && (
              <p className='text-slate-600 whitespace-nowrap text-sm sm:text-base'>
                {computerId}
              </p>
            )}
            <p
              ref={uuidMeasureRef}
              className='absolute opacity-0 pointer-events-none -z-10 whitespace-nowrap text-slate-600 text-sm sm:text-base'
              aria-hidden='true'
            >
              {computerId}
            </p>
          </div>
        </div>

        <div ref={actionsRef} className="flex items-center gap-2">
          <Button
            onClick={() => performAction('start')}
            disabled={serverStatus.Status === 'Active' || actionLoading !== ''}
            className='bg-green-600 hover:bg-green-700'
          >
            {actionLoading === 'start'
              ? <Loader2 className='w-4 h-4 animate-spin' />
              : <Play className='w-4 h-4' />}
            <span className="ml-2 hidden lg:inline">Start</span>
          </Button>

          <Button
            onClick={() => performAction('stop')}
            disabled={serverStatus.Status === 'Stopped' || actionLoading !== ''}
            variant='destructive'
          >
            {actionLoading === 'stop'
              ? <Loader2 className='w-4 h-4 animate-spin' />
              : <Square className='w-4 h-4' />}
            <span className="ml-2 hidden lg:inline">Stop</span>
          </Button>

          <Button
            onClick={() => performAction('restart')}
            disabled={actionLoading !== ''}
            variant='outline'
          >
            {actionLoading === 'restart'
              ? <Loader2 className='w-4 h-4 animate-spin' />
              : <RotateCcw className='w-4 h-4' />}
            <span className="ml-2 hidden lg:inline">Restart</span>
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-4 gap-4 mb-6'>
        <Card>
          <CardContent className='p-3 sm:p-4 flex flex-wrap sm:flex-nowrap items-center sm:items-center justify-center sm:justify-start gap-4 sm:gap-5 text-center sm:text-left'>
            <Monitor className='w-6 h-6 text-blue-500 shrink-0 self-center sm:self-center' />
            <div className='flex flex-col gap-1 min-w-0 w-full sm:w-auto sm:flex-1'>
              <p className='text-sm font-medium text-slate-600 hidden lg:block'>Status</p>
              <div className='flex items-center gap-2 justify-center lg:justify-start'>
                <Badge
                  variant={serverStatus.Status === 'Active' ? 'default' : 'secondary'}
                  className={`${serverStatus.Status === 'Active' ? 'bg-green-500' : 'bg-red-500 text-white'} hidden lg:inline-flex`}
                >
                  {serverStatus.Status === 'Active' ? 'Running' : 'Stopped'}
                </Badge>
                <span
                  className={`lg:hidden h-3 w-3 rounded-full ${
                    serverStatus.Status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  aria-label={serverStatus.Status === 'Active' ? 'Running' : 'Stopped'}
                ></span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-3 sm:p-4 flex flex-wrap sm:flex-nowrap items-center sm:items-center justify-center sm:justify-start gap-2 sm:gap-3 text-center sm:text-left'>
            <Cpu className='w-6 h-6 text-purple-500 shrink-0 self-center sm:self-center' />
            <div className='flex flex-col gap-1 min-w-0 w-full sm:w-auto sm:flex-1'>
              <p className='text-sm font-medium text-slate-600 hidden lg:block'>CPU Usage</p>
              <p className='text-lg sm:text-xl font-bold leading-tight'>{serverStatus.Cpu}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-3 sm:p-4 flex flex-wrap sm:flex-nowrap items-center sm:items-center justify-center sm:justify-start gap-2 sm:gap-3 text-center sm:text-left'>
            <MemoryStick className='w-6 h-6 text-orange-500 shrink-0 self-center sm:self-center' />
            <div className='flex flex-col gap-1 min-w-0 w-full sm:w-auto sm:flex-1'>
              <p className='text-sm font-medium text-slate-600 hidden lg:block'>Memory</p>
              <p className='text-lg sm:text-xl font-bold leading-tight'>{serverStatus.Memory}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-3 sm:p-4 flex flex-wrap sm:flex-nowrap items-center sm:items-center justify-center sm:justify-start gap-2 sm:gap-3 text-center sm:text-left'>
            <Network className='w-6 h-6 text-green-500 shrink-0 self-center sm:self-center' />
            <div className='flex flex-col gap-1 min-w-0 w-full sm:w-auto sm:flex-1'>
              <p className='text-sm font-medium text-slate-600 hidden lg:block'>Connections</p>
              <p className='text-lg sm:text-xl font-bold leading-tight'>{serverStatus.Connections}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Server Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='errors' className='w-full'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='errors'>Error Logs ({serverStatus.Logs.Errlength})</TabsTrigger>
              <TabsTrigger value='access'>Access Logs ({serverStatus.Logs.Acclength})</TabsTrigger>
            </TabsList>

            {/* Error Logs */}
            <TabsContent value='errors' className='space-y-4'>
              {serverStatus.Logs.ErrorLog.map((log, i) => (
                <Card key={i} className='bg-red-50 border-red-200'>
                  <CardContent className='p-4 flex justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <Badge
                          variant='outline'
                          className={
                            log.Level === 'error'
                              ? 'border-red-500 text-red-700'
                              : log.Level === 'warn'
                                ? 'border-yellow-500 text-yellow-700'
                                : ''
                          }
                        >
                          {log.Level.toUpperCase()}
                        </Badge>
                        <span className='text-sm text-slate-600'>{log.Module}</span>
                        <span className='text-sm text-slate-500'>PID: {log.Pid}</span>
                      </div>
                      <p className='text-sm font-medium text-slate-800 mb-1'>{log.Message}</p>
                      <p className='text-xs text-slate-600'>Client: {log.Client}</p>
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

            {/* Access Logs */}
            <TabsContent value='access' className='space-y-4'>
              {serverStatus.Logs.AccessLog.map((log, i) => (
                <Card key={i} className='bg-green-50 border-green-200'>
                  <CardContent className='p-4 flex justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <Badge
                          variant='outline'
                          className={
                            log.Status >= 200 && log.Status < 300
                              ? 'border-green-500 text-green-700'
                              : log.Status >= 400
                                ? 'border-red-500 text-red-700'
                                : ''
                          }
                        >
                          {log.Status}
                        </Badge>
                        <span className='text-sm font-medium text-slate-700'>{log.Method}</span>
                        <span className='text-sm text-slate-600'>{log.Url}</span>
                      </div>
                      <p className='text-xs text-slate-600 mb-1'>
                        IP: {log.Ip} | Protocol: {log.Protocol}
                      </p>
                      <p className='text-xs text-slate-600'>Size: {log.Byte} bytes</p>
                      {log.Referer && (
                        <p className='text-xs text-slate-500 truncate'>Referer: {log.Referer}</p>
                      )}
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
