import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
import { Upload, Check, Trash, Settings, X } from 'lucide-react';
import { toast } from 'sonner';

// Module types
type ModuleStatus = 'loaded' | 'unloaded' | 'error';
type ModuleState = 'enabled' | 'disabled';
type ConfigValue = string | number | boolean;

interface ModuleConfigOption {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  label: string;
  options?: string[];
  defaultValue: ConfigValue;
  description?: string;
}

interface Module {
  id: string;
  name: string;
  version: string;
  loadStatus: ModuleStatus;
  enableStatus: ModuleState;
  description: string;
  configOptions: ModuleConfigOption[];
  currentConfig: Record<string, ConfigValue>;
}

const ModuleManagementTab = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [showUploadResults, setShowUploadResults] = useState(false);
  const [uploadResults, setUploadResults] = useState<{ success: string[]; failed: string[] }>({
    success: [],
    failed: [],
  });
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    if (showUploadResults) {
      const timer = setTimeout(() => {
        setShowUploadResults(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showUploadResults]);

  const fetchModules = async () => {
    setIsLoadingModules(true);
    try {
      const data = [
        {
          id: 'monitoring',
          name: '系統監控',
          version: '1.2.0',
          loadStatus: 'loaded',
          enableStatus: 'enabled',
          description: '監控系統資源使用情況，提供即時性能指標',
          configOptions: [
            {
              name: 'interval',
              type: 'number',
              label: '監控間隔(秒)',
              defaultValue: 30,
              description: '設定監控資料收集間隔',
            },
            { name: 'alerts', type: 'boolean', label: '啟用警告', defaultValue: true },
            {
              name: 'logLevel',
              type: 'select',
              label: '日誌等級',
              options: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
              defaultValue: 'INFO',
            },
          ],
          currentConfig: { interval: 30, alerts: true, logLevel: 'INFO' },
        },
        {
          id: 'logging',
          name: '日誌管理',
          version: '0.9.5',
          loadStatus: 'loaded',
          enableStatus: 'enabled',
          description: '系統日誌記錄與管理，支援多種日誌格式',
          configOptions: [
            { name: 'maxSize', type: 'number', label: '最大檔案大小(MB)', defaultValue: 100 },
            { name: 'retention', type: 'number', label: '保留天數', defaultValue: 7 },
            {
              name: 'format',
              type: 'select',
              label: '日誌格式',
              options: ['JSON', 'TEXT', 'XML'],
              defaultValue: 'JSON',
            },
          ],
          currentConfig: { maxSize: 100, retention: 7, format: 'JSON' },
        },
        {
          id: 'security',
          name: '安全管理',
          version: '1.0.0',
          loadStatus: 'unloaded',
          enableStatus: 'disabled',
          description: '系統安全設定與防護，包含防火牆和入侵檢測',
          configOptions: [
            { name: 'firewall', type: 'boolean', label: '啟用防火牆', defaultValue: true },
            { name: 'scanInterval', type: 'number', label: '掃描間隔(分鐘)', defaultValue: 60 },
            { name: 'alertEmail', type: 'text', label: '警告信箱', defaultValue: '' },
          ],
          currentConfig: { firewall: true, scanInterval: 60, alertEmail: '' },
        },
      ];

      setModules(data as unknown as Module[]);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('獲取模組失敗', {
        description: '無法加載模組清單，請稍後再試',
      });
    } finally {
      setIsLoadingModules(false);
    }
  };

  const handleUploadModules = async () => {
    try {
      toast.success('上傳模組中', {
        description: '正在上傳模組，請稍候...',
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const result = {
        success: ['監控模組', '日誌模組'],
        failed: ['安全模組'],
      };

      setUploadResults(result);
      setShowUploadResults(true);

      toast.success('模組上傳完成', {
        description: `成功上傳 ${result.success.length} 個模組，${result.failed.length} 個模組上傳失敗`,
      });

      fetchModules();
    } catch (error) {
      console.error('Error uploading modules:', error);
      toast.error('模組上傳失敗', {
        description: '無法上傳模組，請檢查系統狀態',
      });
    }
  };

  const toggleModuleStatus = async (moduleId: string, currentStatus: ModuleState) => {
    try {
      const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
      const newLoadStatus = newStatus === 'disabled' ? 'unloaded' : 'loaded';

      await new Promise((resolve) => setTimeout(resolve, 500));

      setModules((prevModules) =>
        prevModules.map((module) =>
          module.id === moduleId
            ? {
                ...module,
                enableStatus: newStatus as ModuleState,
                loadStatus: newLoadStatus as ModuleStatus,
              }
            : module,
        ),
      );

      toast.success(`模組${newStatus === 'enabled' ? '啟用' : '停用'}成功`, {
        description: `已${newStatus === 'enabled' ? '啟用' : '停用'}所選模組`,
      });
    } catch (error) {
      console.error('Error toggling module status:', error);
      toast.error('操作失敗', {
        description: '無法更改模組狀態，請稍後再試',
      });
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setModules((prevModules) => prevModules.filter((module) => module.id !== moduleId));

      toast.success('模組刪除成功', {
        description: '已成功刪除所選模組',
      });
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('刪除失敗', {
        description: '無法刪除模組，請稍後再試',
      });
    }
  };

  const incrementVersion = (version: string) => {
    const parts = version.split('.');
    if (parts.length === 3) {
      const patch = parseInt(parts[2]) + 1;
      return `${parts[0]}.${parts[1]}.${patch}`;
    }
    return version;
  };

  const handleUpdateModule = async (moduleId: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setModules((prevModules) =>
        prevModules.map((module) =>
          module.id === moduleId
            ? { ...module, version: incrementVersion(module.version) }
            : module,
        ),
      );

      toast.success('模組更新成功', {
        description: '已成功更新所選模組到最新版本',
      });
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('更新失敗', {
        description: '無法更新模組，請稍後再試',
      });
    }
  };

  const handleSaveModuleSettings = async (
    moduleId: string,
    settings: Record<string, ConfigValue>,
  ) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setModules((prevModules) =>
        prevModules.map((module) =>
          module.id === moduleId ? { ...module, currentConfig: settings } : module,
        ),
      );

      toast.success('模組設定已保存', {
        description: '模組配置已成功更新',
      });
    } catch (error) {
      console.error('Error saving module settings:', error);
      toast.error('保存失敗', {
        description: '無法保存模組設定，請稍後再試',
      });
    }
  };

  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const renderStatusBadge = (status: ModuleStatus | ModuleState) => {
    let variant: 'default' | 'destructive' | 'outline' | 'secondary' = 'default';

    switch (status) {
      case 'loaded':
      case 'enabled':
        variant = 'default';
        break;
      case 'unloaded':
      case 'disabled':
        variant = 'secondary';
        break;
      case 'error':
        variant = 'destructive';
        break;
    }

    return (
      <Badge variant={variant}>
        {status === 'loaded'
          ? '已載入'
          : status === 'unloaded'
          ? '未載入'
          : status === 'error'
          ? '錯誤'
          : status === 'enabled'
          ? '已啟用'
          : '未啟用'}
      </Badge>
    );
  };

  //   const renderConfigOption = (option: ModuleConfigOption, value: ConfigValue, onChange: (val: ConfigValue) => void) => {
  //   switch (option.type) {
  //     case "text":
  //       return (
  //         <Input
  //           type="text"
  //           value={String(value ?? "")}
  //           onChange={(e) => onChange(e.target.value)}
  //         />
  //       );

  //     case "number":
  //       return (
  //         <Input
  //           type="number"
  //           value={value !== undefined ? String(value) : ""}
  //           onChange={(e) => {
  //             const parsed = parseFloat(e.target.value);
  //             onChange(isNaN(parsed) ? 0 : parsed);
  //           }}
  //         />
  //       );

  //     case "boolean":
  //       return (
  //         <Switch
  //           checked={Boolean(value)}
  //           onCheckedChange={onChange}
  //         />
  //       );

  //     case "select":
  //       return (
  //         <Select value={String(value)} onValueChange={onChange}>
  //           <SelectTrigger>
  //             <SelectValue placeholder="請選擇" />
  //           </SelectTrigger>
  //           <SelectContent>
  //             {option.options?.map((opt) => (
  //               <SelectItem key={opt} value={opt}>
  //                 {opt}
  //               </SelectItem>
  //             ))}
  //           </SelectContent>
  //         </Select>
  //       );

  //     default:
  //       return null;
  //   }
  // };

  const handleConfigureModule = (moduleId: string) => {
    toggleModuleExpansion(moduleId);
  };

  const ModuleConfigPanel = ({ module }: { module: Module }) => {
    const [tempConfig, setTempConfig] = useState(module.currentConfig);

    // const handleConfigChange = (optionName: string, value: ConfigValue) => {
    //   setTempConfig(prev => ({ ...prev, [optionName]: value }));
    // };

    const handleSave = () => {
      handleSaveModuleSettings(module.id, tempConfig);
      toggleModuleExpansion(module.id);
    };

    const handleCancel = () => {
      setTempConfig(module.currentConfig);
      toggleModuleExpansion(module.id);
    };

    return (
      <TableRow>
        <TableCell colSpan={5} className='p-0'>
          <div className='bg-gray-50 border-t border-gray-200 p-6'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold'>修改模組設定 - {module.name}</h3>
              <Button variant='ghost' size='sm' onClick={() => toggleModuleExpansion(module.id)}>
                <X className='h-4 w-4' />
              </Button>
            </div>
            <p className='text-sm text-gray-600 mb-6'>設定模組相關配置參數</p>

            <div className='space-y-4'>
              <div>
                <Label className='text-base font-medium'>描述</Label>
                <Input value={module.description} className='mt-1' readOnly />
              </div>

              <div>
                <Label className='text-base font-medium'>配置 (JSON)</Label>
                <textarea
                  className='w-full h-32 mt-1 p-3 border border-gray-300 rounded-md resize-none font-mono text-sm'
                  value={JSON.stringify(tempConfig, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setTempConfig(parsed);
                    } catch {
                      // Invalid JSON, keep current value
                    }
                  }}
                />
                <p className='text-sm text-gray-500 mt-1'>使用JSON格式設定模組參數</p>
              </div>
            </div>

            <div className='flex justify-end gap-2 mt-6'>
              <Button variant='outline' onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <div>
              <CardTitle>模組管理</CardTitle>
              <CardDescription>管理系統模組，查看模組狀態，上傳或更新模組</CardDescription>
            </div>
            <Button
              onClick={handleUploadModules}
              disabled={isLoadingModules}
              className='flex items-center gap-2'
            >
              <Upload className='h-4 w-4' />
              {isLoadingModules ? '上傳中...' : '上傳模組'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Table>
            <TableCaption>系統模組列表</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>名稱</TableHead>
                <TableHead>版本</TableHead>
                <TableHead>啟用狀態</TableHead>
                <TableHead>加載狀態</TableHead>
                <TableHead className='text-right'>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className='text-center py-4'>
                    {isLoadingModules ? '加載中...' : '暫無模組資料'}
                  </TableCell>
                </TableRow>
              ) : (
                modules.map((module) => (
                  <React.Fragment key={module.id}>
                    <TableRow>
                      <TableCell className='font-medium'>{module.name}</TableCell>
                      <TableCell>{module.version}</TableCell>
                      <TableCell>{renderStatusBadge(module.enableStatus)}</TableCell>
                      <TableCell>{renderStatusBadge(module.loadStatus)}</TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => toggleModuleStatus(module.id, module.enableStatus)}
                          >
                            {module.enableStatus === 'enabled' ? '停用' : '啟用'}
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleUpdateModule(module.id)}
                          >
                            更新
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDeleteModule(module.id)}
                          >
                            <Trash className='h-4 w-4' />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='outline' size='sm'>
                                <Settings className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className='bg-white border shadow-md'>
                              <DropdownMenuItem onClick={() => handleConfigureModule(module.id)}>
                                修改模組設定
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedModules.has(module.id) && <ModuleConfigPanel module={module} />}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showUploadResults} onOpenChange={setShowUploadResults}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>模組上傳結果</DialogTitle>
            <DialogDescription>以下是模組上傳的結果詳情</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            {uploadResults.success.length > 0 && (
              <div>
                <div className='flex items-center text-green-600 mb-2'>
                  <Check className='h-4 w-4 mr-2' />
                  <span className='font-semibold'>成功上傳:</span>
                </div>
                <ul className='list-disc list-inside ml-6'>
                  {uploadResults.success.map((module, index) => (
                    <li key={index}>{module}</li>
                  ))}
                </ul>
              </div>
            )}
            {uploadResults.failed.length > 0 && (
              <div>
                <div className='flex items-center text-red-600 mb-2'>
                  <span className='font-semibold'>上傳失敗:</span>
                </div>
                <ul className='list-disc list-inside ml-6'>
                  {uploadResults.failed.map((module, index) => (
                    <li key={index}>{module}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModuleManagementTab;
