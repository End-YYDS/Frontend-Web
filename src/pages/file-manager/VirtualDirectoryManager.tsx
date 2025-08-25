
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { 
  Upload, 
  Download, 
  Folder, 
  File, 
  ChevronLeft, 
  ChevronRight, 
  Copy,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumb } from './Breadcrumb';

interface FileItem {
  name: string;
  type: 'folder' | 'file';
  size?: string;
  owner: string;
  mode: string;
  modified: string;
}

export const VirtualDirectoryManager = () => {
  const [virtualPath] = useState<string>('/shared/virtual_directory');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('');
  const [currentPath, setCurrentPath] = useState('/shared/virtual_directory');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([
    { name: 'config.json', type: 'file', size: '2.1 KB', owner: 'root:root', mode: '0644', modified: '2023/07/13 - 10:42:57' },
    { name: 'install.sh', type: 'file', size: '5.8 KB', owner: 'root:root', mode: '0755', modified: '2023/07/13 - 10:42:57' },
    { name: 'backup.tar.gz', type: 'file', size: '125 MB', owner: 'root:root', mode: '0644', modified: '2023/07/13 - 10:42:57' },
    { name: 'update.exe', type: 'file', size: '8.9 MB', owner: 'root:root', mode: '0755', modified: '2023/07/13 - 10:42:57' },
    { name: 'scripts', type: 'folder', owner: 'root:root', mode: '0755', modified: '2023/07/13 - 10:42:57' },
    { name: 'configs', type: 'folder', owner: 'root:root', mode: '0755', modified: '2023/07/13 - 10:42:57' },
  ]);
  const { toast } = useToast();

  const handleItemSelect = (itemName: string, isCtrlClick: boolean = false) => {
    if (isCtrlClick) {
      setSelectedItems(prev => 
        prev.includes(itemName) 
          ? prev.filter(name => name !== itemName)
          : [...prev, itemName]
      );
    } else {
      setSelectedItems([itemName]);
    }
  };

  const handleCheckboxChange = (itemName: string) => {
    setSelectedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const handleDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      // 處理回到上級目錄
      if (item.name === '..') {
        navigateUp();
        return;
      }
      
      // 構建新路徑，避免重複
      const newPath = currentPath === '/shared/virtual_directory' ? `/shared/virtual_directory/${item.name}` : `${currentPath}/${item.name}`;
      
      // 檢查是否已經在該路徑中，避免重複點擊造成路徑累加
      if (newPath === currentPath) {
        return;
      }
      
      setCurrentPath(newPath);
      // 模擬載入新目錄內容
      setFiles([
        { name: '..', type: 'folder', owner: 'root:root', mode: '0755', modified: '2023/07/13 - 10:42:57' },
        { name: 'example.txt', type: 'file', size: '1.2 KB', owner: 'root:root', mode: '0644', modified: '2023/07/13 - 10:42:57' },
      ]);
    }
  };

  const navigateUp = () => {
    if (currentPath !== '/shared/virtual_directory') {
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/shared/virtual_directory';
      setCurrentPath(parentPath);
      // 重新載入根目錄內容
      if (parentPath === '/shared/virtual_directory') {
        setFiles([
          { name: 'config.json', type: 'file', size: '2.1 KB', owner: 'root:root', mode: '0644', modified: '2023/07/13 - 10:42:57' },
          { name: 'install.sh', type: 'file', size: '5.8 KB', owner: 'root:root', mode: '0755', modified: '2023/07/13 - 10:42:57' },
          { name: 'backup.tar.gz', type: 'file', size: '125 MB', owner: 'root:root', mode: '0644', modified: '2023/07/13 - 10:42:57' },
          { name: 'update.exe', type: 'file', size: '8.9 MB', owner: 'root:root', mode: '0755', modified: '2023/07/13 - 10:42:57' },
          { name: 'scripts', type: 'folder', owner: 'root:root', mode: '0755', modified: '2023/07/13 - 10:42:57' },
          { name: 'configs', type: 'folder', owner: 'root:root', mode: '0755', modified: '2023/07/13 - 10:42:57' },
        ]);
      }
    }
  };

  const navigateToPath = (path: string) => {
    setCurrentPath(path);
    // 根據路徑載入對應的內容
    if (path === '/shared/virtual_directory') {
      setFiles([
        { name: 'config.json', type: 'file', size: '2.1 KB', owner: 'root:root', mode: '0644', modified: '2023/07/13 - 10:42:57' },
        { name: 'install.sh', type: 'file', size: '5.8 KB', owner: 'root:root', mode: '0755', modified: '2023/07/13 - 10:42:57' },
        { name: 'backup.tar.gz', type: 'file', size: '125 MB', owner: 'root:root', mode: '0644', modified: '2023/07/13 - 10:42:57' },
        { name: 'update.exe', type: 'file', size: '8.9 MB', owner: 'root:root', mode: '0755', modified: '2023/07/13 - 10:42:57' },
        { name: 'scripts', type: 'folder', owner: 'root:root', mode: '0755', modified: '2023/07/13 - 10:42:57' },
        { name: 'configs', type: 'folder', owner: 'root:root', mode: '0755', modified: '2023/07/13 - 10:42:57' },
      ]);
    } else {
      // 模擬載入其他目錄內容
      setFiles([
        { name: '..', type: 'folder', owner: 'root:root', mode: '0755', modified: '2023/07/13 - 10:42:57' },
        { name: 'example.txt', type: 'file', size: '1.2 KB', owner: 'root:root', mode: '0644', modified: '2023/07/13 - 10:42:57' },
      ]);
    }
  };

  const handleContextAction = (action: string, itemName: string) => {
    switch (action) {
      case 'copy':
        toast({
          title: "複製",
          description: `已複製 ${itemName}`,
        });
        break;
      case 'delete':
        setFiles(prev => prev.filter(file => file.name !== itemName));
        toast({
          title: "刪除",
          description: `已刪除 ${itemName}`,
        });
        break;
      case 'download':
        setDownloadFilename(itemName);
        toast({
          title: "下載",
          description: `正在下載 ${itemName}`,
        });
        break;
    }
  };

  const selectAll = () => {
    setSelectedItems(files.map(file => file.name));
  };

  const invertSelection = () => {
    setSelectedItems(prev => 
      files.map(file => file.name).filter(name => !prev.includes(name))
    );
  };

  // 模擬取得虛擬目錄路徑
  const fetchVirtualDirectory = async () => {
    try {
      console.log('正在取得虛擬目錄路徑...');
      // 模擬 API 呼叫
      setTimeout(() => {
        toast({
          title: "成功",
          description: "已載入虛擬目錄路徑",
        });
      }, 300);
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法取得虛擬目錄路徑",
        variant: "destructive",
      });
    }
  };

  // 上傳檔案到虛擬目錄
  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "錯誤",
        description: "請選擇檔案",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('File', selectedFile);

    try {
      // 模擬進度條
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/file/vdir/action/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.Type === 'OK') {
        toast({
          title: "成功",
          description: "檔案上傳至虛擬目錄成功",
        });
      } else {
        toast({
          title: "錯誤",
          description: result.Message || "上傳失敗",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "錯誤",
        description: "上傳過程中發生錯誤",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // 從虛擬目錄下載檔案
  const handleFileDownload = async () => {
    if (!downloadFilename.trim()) {
      toast({
        title: "錯誤",
        description: "請輸入檔案名稱",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/file/vdir/action/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Filename: downloadFilename,
        }),
      });

      const result = await response.json();
      
      if (result.Type === 'OK') {
        toast({
          title: "成功",
          description: "檔案下載成功",
        });
      } else {
        toast({
          title: "錯誤",
          description: result.Message || "下載失敗",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "錯誤",
        description: "下載過程中發生錯誤",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchVirtualDirectory();
  }, []);

  return (
    <div className="space-y-6">
      {/* 虛擬目錄資訊 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            虛擬目錄資訊
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">虛擬目錄路徑</label>
              <Input
                value={virtualPath}
                readOnly
                placeholder="載入中..."
                className="bg-gray-50"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 p-3 rounded">
                <div className="text-2xl font-bold text-green-600">5</div>
                <div className="text-sm text-green-700">連接主機</div>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-blue-700">同步檔案</div>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <div className="text-2xl font-bold text-purple-600">98%</div>
                <div className="text-sm text-purple-700">同步率</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 文件瀏覽器 */}
      <Card>
        <CardHeader>
          <CardTitle>文件瀏覽器</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* 工具列 */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={navigateUp} disabled={currentPath === '/shared/virtual_directory'}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" disabled>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div className="ml-2">
                <Breadcrumb 
                  path={currentPath} 
                  onNavigate={navigateToPath}
                  rootPath="/shared/virtual_directory"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                全選
              </Button>
              <Button variant="outline" size="sm" onClick={invertSelection}>
                反選
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-1" />
                上傳
              </Button>
            </div>
          </div>

          {/* 狀態列 */}
          <div className="px-4 py-2 text-sm text-gray-600 border-b">
            Total: {files.filter(f => f.type === 'file').length} files and {files.filter(f => f.type === 'folder').length} directories. Selected: {selectedItems.length} items
          </div>

          {/* 文件列表 */}
          <div className="overflow-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Modified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file, index) => (
                  <ContextMenu key={index}>
                    <ContextMenuTrigger asChild>
                      <TableRow 
                        className={`cursor-pointer ${selectedItems.includes(file.name) ? 'bg-blue-50' : ''}`}
                        onClick={(e) => handleItemSelect(file.name, e.ctrlKey)}
                        onDoubleClick={() => handleDoubleClick(file)}
                      >
                        <TableCell>
                          <input 
                            type="checkbox" 
                            checked={selectedItems.includes(file.name)}
                            onChange={() => handleCheckboxChange(file.name)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          {file.type === 'folder' ? (
                            <Folder className="w-4 h-4 text-blue-500" />
                          ) : (
                            <File className="w-4 h-4 text-gray-500" />
                          )}
                          {file.name}
                        </TableCell>
                        <TableCell>{file.size || '-'}</TableCell>
                        <TableCell>{file.owner}</TableCell>
                        <TableCell>{file.mode}</TableCell>
                        <TableCell>{file.modified}</TableCell>
                      </TableRow>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => handleDoubleClick(file)}>
                        Open in new tab
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem onClick={selectAll}>
                        Select All
                      </ContextMenuItem>
                      <ContextMenuItem onClick={invertSelection}>
                        Invert Selection
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem onClick={() => handleContextAction('copy', file.name)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleContextAction('delete', file.name)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleContextAction('download', file.name)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 分頁 */}
          <div className="flex items-center justify-between p-4 border-t">
            <span className="text-sm text-gray-600">Showing 1 to {files.length} of {files.length} items</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>1</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};