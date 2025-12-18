import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles, Server, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { addPc, getAllPc, postInstall } from '@/api/openapi-client';

interface SetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ServerOption {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

const serverOptions: ServerOption[] = [
  { id: 'apache', name: 'Apache', description: '穩定可靠的網頁伺服器', enabled: true },
  { id: 'nginx', name: 'Nginx', description: '高效能反向代理與負載平衡器', enabled: false },
  {
    id: 'bind_dns',
    name: 'BIND DNS',
    description: '權威與遞迴的 DNS 名稱解析服務',
    enabled: false,
  },
  {
    id: 'dhcp',
    name: 'DHCP',
    description: '自動分配 IP、網關與 DNS 的網路設定服務',
    enabled: false,
  },
  { id: 'ldap', name: 'LDAP', description: '集中式的目錄與身份驗證服務', enabled: false },
  {
    id: 'mysql',
    name: 'MySQL Database',
    description: '主流的關聯式資料庫管理系統',
    enabled: false,
  },
  {
    id: 'proftpd',
    name: 'ProFTPD',
    description: '可客製化且安全的 FTP 檔案伺服器',
    enabled: false,
  },
  { id: 'samba', name: 'Samba', description: '提供 Windows 相容的檔案與列印分享', enabled: false },
  {
    id: 'squid_proxy',
    name: 'Squid proxy',
    description: 'HTTP/HTTPS 的快取與代理伺服器',
    enabled: false,
  },
  { id: 'ssh', name: 'SSH', description: '安全的遠端登入與指令執行服務', enabled: false },
];

export default function SetupWizard({ isOpen, onClose }: SetupWizardProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [ipAddress, setIpAddress] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [selectedServers, setSelectedServers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPages = 4;
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleServerToggle = (serverId: string, enabled: boolean) => {
    if (!enabled) return;
    setSelectedServers((prev) =>
      prev.includes(serverId) ? prev.filter((id) => id !== serverId) : [...prev, serverId],
    );
  };

  const handleNext = () => {
    if (currentPage === 1) {
      if (!ipAddress.trim()) {
        toast.error('請輸入 IP 位址');
        return;
      }
      if (!otpCode.trim()) {
        toast.error('請輸入 OTP 驗證碼');
        return;
      }
    }
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    const ip = ipAddress.trim();
    const otp = otpCode.trim();
    setIsSubmitting(true);
    try {
      // 先記錄現有 UUID，方便找出新增的主機
      const beforeRes = await getAllPc();
      const existingUuids = new Set(Object.keys(beforeRes.data?.Pcs ?? {}));
      const delayMs = 1500;

      // 新增 Agent (使用 OTP 當作密碼)
      const { data: addResult } = await addPc({ body: { Ip: ip, Password: otp } });
      if (!addResult || addResult.Type !== 'Ok') {
        throw new Error(addResult?.Message ?? '新增 Agent 失敗');
      }
      await wait(delayMs);
      // 重新取得主機列表以找到新加入的 UUID
      const afterRes = await getAllPc();
      const pcsMap = afterRes.data?.Pcs ?? {};
      const newEntry = Object.entries(pcsMap).find(([uuid, info]) => {
        if (!info) return false;
        return !existingUuids.has(uuid) || info.Ip === ip;
      });
      const newUuid = newEntry?.[0];
      const newInfo = newEntry?.[1];

      // 等待 Agent 就緒（Status=true），避免安裝時後端回報 Agent 不可用
      if (newUuid) {
        const maxRetries = 5;
        const delayMs = 2000;
        const initialStatus = (newInfo as { Status?: boolean } | undefined)?.Status;
        let ready = initialStatus === true;
        let attempt = 0;
        while (!ready && attempt < maxRetries) {
          attempt += 1;
          await wait(delayMs);
          const { data: pollData } = await getAllPc();
          const polled = pollData?.Pcs?.[newUuid];
          ready = polled?.Status === true;
          console.log('[SetupWizard] polling agent ready', { attempt, ready, uuid: newUuid });
        }
        if (!ready) {
          throw new Error('Agent 已新增但尚未就緒，請稍後再試');
        }
      }

      // 安裝選擇的伺服器
      if (selectedServers.length > 0) {
        if (!newUuid) throw new Error('新增 Agent 成功，但無法取得主機 UUID');

        const serverIdToApi: Record<string, string> = {
          apache: 'apache',
          nginx: 'nginx',
          bind_dns: 'bind',
          dhcp: 'dhcp',
          ldap: 'ldap',
          mysql: 'mysql',
          proftpd: 'proftpd',
          samba: 'samba',
          squid_proxy: 'squid',
          ssh: 'ssh',
        };

        const serversToInstall = selectedServers
          .map((id) => serverIdToApi[id])
          .filter((server): server is string => Boolean(server));

        const installResults = await Promise.all(
          serversToInstall.map((server) =>
            postInstall({ body: { Server: server, Uuids: [newUuid] } }),
          ),
        );

        const failed = installResults.find((res) => res.data?.Type !== 'Ok');
        if (failed) throw new Error(failed.data?.Message ?? '伺服器安裝失敗');
      }

      const installedNames =
        selectedServers.length > 0
          ? selectedServers
              .map((id) => serverOptions.find((s) => s.id === id)?.name)
              .filter(Boolean)
              .join(', ')
          : '';

      toast.success(
        installedNames ? `Agent 新增並安裝完成：${installedNames}` : 'Agent 已成功新增',
      );

      setCurrentPage(0);
      setIpAddress('');
      setOtpCode('');
      setSelectedServers([]);
      onClose();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : '設定失敗，請稍後再試';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentPage(0);
    setIpAddress('');
    setOtpCode('');
    setSelectedServers([]);
    onClose();
  };

  if (!isOpen) return null;

  const configItems = [
    { label: 'IP 位址', value: ipAddress || '未填寫' },
    { label: 'OTP 驗證碼', value: otpCode ? otpCode.replace(/./g, '•') : '未填寫' },
    {
      label: '選擇的伺服器',
      value:
        selectedServers.length > 0
          ? selectedServers
              .map((id) => serverOptions.find((s) => s.id === id)?.name)
              .filter(Boolean)
              .join(', ')
          : '無',
    },
  ];

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center px-4'>
      <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={handleClose} />

      <div className='relative w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200'>
        <div className='flex items-center justify-between border-b border-border bg-[#A8AEBD] px-6 py-4 text-white'>
          <div className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5' />
            <h2 className='text-lg font-semibold'>系統小精靈</h2>
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleClose}
            className='text-white/80 hover:bg-white/10 hover:text-white rounded-full'
          >
            <X className='h-5 w-5' />
          </Button>
        </div>

        <div className='px-6 pt-4'>
          <div className='flex items-center gap-2'>
            {Array.from({ length: totalPages }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  index <= currentPage ? 'bg-gray-500' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className='mt-2 text-xs text-muted-foreground'>
            步驟 {currentPage + 1} / {totalPages}
          </p>
        </div>

        <div className='min-h-80 px-6 py-6'>
          {currentPage === 0 && (
            <div className='space-y-4 animate-in fade-in slide-in-from-right-4 duration-300'>
              <div className='flex justify-center'>
                <div className='flex h-20 w-20 items-center justify-center rounded-full bg-gray-100'>
                  <Sparkles className='h-10 w-10 text-gray-600' />
                </div>
              </div>
              <h3 className='text-center text-2xl font-bold text-foreground'>歡迎使用CHM</h3>
              <p className='text-center leading-relaxed text-muted-foreground'>
                這個精靈將幫助您快速完成 Agent 的設定與伺服器安裝。
                只需幾個簡單的步驟，即可開始使用系統的完整功能。
              </p>
              <div className='mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3'>
                <p className='text-sm text-amber-800'>
                  <strong>提示：</strong>請確保您已準備好 Agent 的 IP 位址和 OTP 驗證碼。
                </p>
              </div>
            </div>
          )}

          {currentPage === 1 && (
            <div className='space-y-6 animate-in fade-in slide-in-from-right-4 duration-300'>
              <div className='flex justify-center'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-sky-50'>
                  <Server className='h-8 w-8 text-sky-600' />
                </div>
              </div>
              <h3 className='text-center text-xl font-bold text-foreground'>新增 Agent</h3>
              <p className='text-center text-sm text-muted-foreground'>請輸入要連接的 Agent 資訊</p>

              <div className='mt-4 space-y-4'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-foreground'>IP 位址</label>
                  <Input
                    type='text'
                    placeholder='例如：192.168.1.100'
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className='h-11'
                  />
                </div>
                <div>
                  <label className='mb-2 block text-sm font-medium text-foreground'>
                    OTP 驗證碼
                  </label>
                  <Input
                    type='text'
                    placeholder='請輸入 6 位數驗證碼'
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    className='h-11'
                  />
                </div>
              </div>
            </div>
          )}

          {currentPage === 2 && (
            <div className='space-y-4 animate-in fade-in slide-in-from-right-4 duration-300'>
              <h3 className='text-center text-xl font-bold text-foreground'>選擇要安裝的伺服器</h3>
              <p className='mb-4 text-center text-sm text-muted-foreground'>
                請勾選要安裝的伺服器（目前僅支援 Apache）
              </p>

              <div className='max-h-[220px] space-y-3 overflow-y-auto pr-2'>
                {serverOptions.map((server) => {
                  const isSelected = selectedServers.includes(server.id);
                  return (
                    <div
                      key={server.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                        server.enabled
                          ? 'border-border hover:border-gray-400 hover:bg-gray-50'
                          : 'cursor-not-allowed border-border/50 bg-muted/40 opacity-60'
                      } ${isSelected && server.enabled ? 'border-gray-500 bg-gray-50' : ''}`}
                      onClick={() => handleServerToggle(server.id, server.enabled)}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={!server.enabled}
                        onCheckedChange={() => handleServerToggle(server.id, server.enabled)}
                        className='data-[state=checked]:bg-gray-500 data-[state=checked]:border-gray-500'
                      />
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <span
                            className={`font-medium ${
                              server.enabled ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {server.name}
                          </span>
                          {!server.enabled && (
                            <span className='rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
                              即將推出
                            </span>
                          )}
                        </div>
                        <p className='text-sm text-muted-foreground'>{server.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentPage === 3 && (
            <div className='space-y-4 animate-in fade-in slide-in-from-right-4 duration-300'>
              <div className='flex justify-center'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50'>
                  <Check className='h-8 w-8 text-emerald-600' />
                </div>
              </div>
              <h3 className='text-center text-xl font-bold text-foreground'>確認您的設定</h3>
              <p className='text-center text-sm text-muted-foreground'>請確認以下資訊是否正確</p>

              <div className='mt-4 space-y-3 rounded-lg bg-muted/60 p-4'>
                {configItems.map((item, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between border-b border-border py-2 last:border-0'
                  >
                    <span className='text-sm text-muted-foreground'>{item.label}</span>
                    <span className='text-sm font-medium text-foreground'>{item.value}</span>
                  </div>
                ))}
              </div>

              <div className='mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4'>
                <p className='text-sm text-amber-800'>
                  按下「完成」後，系統將開始設定 Agent 並安裝選擇的伺服器。
                </p>
              </div>
            </div>
          )}
        </div>

        <div className='flex items-center justify-between border-t border-border bg-muted/40 px-6 py-4'>
          <Button
            variant='outline'
            onClick={handlePrev}
            disabled={currentPage === 0}
            className='gap-1'
          >
            <ChevronLeft className='h-4 w-4' />
            上一頁
          </Button>

          {currentPage < totalPages - 1 ? (
            <Button onClick={handleNext} className='gap-1 bg-gray-500 text-white hover:bg-gray-600'>
              下一頁
              <ChevronRight className='h-4 w-4' />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isSubmitting}
              className='gap-1 bg-emerald-500 text-white hover:bg-emerald-600'
            >
              {isSubmitting ? '處理中...' : '完成'}
              <Check className='h-4 w-4' />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
