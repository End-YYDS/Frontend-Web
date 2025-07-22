
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { 
  Folder, 
  File, 
  HardDrive, 
  ChevronLeft, 
  ChevronRight, 
  Copy,
  Trash2,
  Download,
  Upload,
  RefreshCcw
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

interface Host {
  uuid: string;
  hostname: string;
  ip: string;
  status: 'online' | 'offline';
}

export const FileBrowser = () => {
  const [hosts] = useState<Host[]>([
    { uuid: 'host-001', hostname: 'PC-OFFICE-001', ip: '192.168.1.101', status: 'online' },
    { uuid: 'host-002', hostname: 'PC-OFFICE-002', ip: '192.168.1.102', status: 'online' },
    { uuid: 'host-003', hostname: 'SERVER-001', ip: '192.168.1.103', status: 'offline' },
  ]);

  const [selectedHost, setSelectedHost] = useState<string>('');
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([
    { name: 'Applications', type: 'folder', owner: 'root:root', mode: '0775', modified: '2025/05/23 - 14:38:38' },
    { name: 'bin', type: 'folder', owner: 'root:root', mode: '0777', modified: '2024/04/22 - 21:08:03' },
    { name: 'bin.usr-is-merged', type: 'folder', owner: 'root:root', mode: '0755', modified: '2024/02/26 - 20:58:31' },
    { name: 'boot', type: 'folder', owner: 'root:root', mode: '0755', modified: '2024/04/22 - 21:08:03' },
    { name: 'dev', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/05/26 - 00:45:46' },
    { name: 'etc', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/03/21 - 14:46:51' },
    { name: 'home', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/03/21 - 14:26:57' },
    { name: 'lib', type: 'folder', owner: 'root:root', mode: '0777', modified: '2024/04/22 - 21:08:03' },
    { name: 'lib.usr-is-merged', type: 'folder', owner: 'root:root', mode: '0755', modified: '2024/04/08 - 22:37:57' },
    { name: 'Library', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/03/10 - 13:53:16' },
    { name: 'media', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/03/18 - 15:44:00' },
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
      const newPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      
      // 檢查是否已經在該路徑中，避免重複點擊造成路徑累加
      if (newPath === currentPath) {
        return;
      }
      
      setCurrentPath(newPath);
      // 模擬載入新目錄內容
      setFiles([
        { name: '..', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/05/23 - 14:38:38' },
        { name: 'subdirectory', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/05/23 - 14:38:38' },
        { name: 'example.txt', type: 'file', size: '1.2 KB', owner: 'root:root', mode: '0644', modified: '2025/05/23 - 14:38:38' },
      ]);
    }
  };

  const navigateUp = () => {
    if (currentPath !== '/') {
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
      setCurrentPath(parentPath);
      // 重新載入根目錄內容
      if (parentPath === '/') {
        setFiles([
          { name: 'Applications', type: 'folder', owner: 'root:root', mode: '0775', modified: '2025/05/23 - 14:38:38' },
          { name: 'bin', type: 'folder', owner: 'root:root', mode: '0777', modified: '2024/04/22 - 21:08:03' },
          { name: 'bin.usr-is-merged', type: 'folder', owner: 'root:root', mode: '0755', modified: '2024/02/26 - 20:58:31' },
          { name: 'boot', type: 'folder', owner: 'root:root', mode: '0755', modified: '2024/04/22 - 21:08:03' },
          { name: 'dev', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/05/26 - 00:45:46' },
          { name: 'etc', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/03/21 - 14:46:51' },
          { name: 'home', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/03/21 - 14:26:57' },
          { name: 'lib', type: 'folder', owner: 'root:root', mode: '0777', modified: '2024/04/22 - 21:08:03' },
          { name: 'lib.usr-is-merged', type: 'folder', owner: 'root:root', mode: '0755', modified: '2024/04/08 - 22:37:57' },
          { name: 'Library', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/03/10 - 13:53:16' },
          { name: 'media', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/03/18 - 15:44:00' },
        ]);
      }
    }
  };

  const navigateToPath = (path: string) => {
    setCurrentPath(path);
    // 根據路徑載入對應的內容
    if (path === '/') {
      setFiles([
        { name: 'Applications', type: 'folder', owner: 'root:root', mode: '0775', modified: '2025/05/23 - 14:38:38' },
        { name: 'bin', type: 'folder', owner: 'root:root', mode: '0777', modified: '2024/04/22 - 21:08:03' },
        { name: 'bin.usr-is-merged', type: 'folder', owner: 'root:root', mode: '0755', modified: '2024/02/26 - 20:58:31' },
        { name: 'boot', type: 'folder', owner: 'root:root', mode: '0755', modified: '2024/04/22 - 21:08:03' },
        { name: 'dev', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/05/26 - 00:45:46' },
        { name: 'etc', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/03/21 - 14:46:51' },
        { name: 'home', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/03/21 - 14:26:57' },
        { name: 'lib', type: 'folder', owner: 'root:root', mode: '0777', modified: '2024/04/22 - 21:08:03' },
        { name: 'lib.usr-is-merged', type: 'folder', owner: 'root:root', mode: '0755', modified: '2024/04/08 - 22:37:57' },
        { name: 'Library', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/03/10 - 13:53:16' },
        { name: 'media', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/03/18 - 15:44:00' },
      ]);
    } else {
      // 模擬載入其他目錄內容
      setFiles([
        { name: '..', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/05/23 - 14:38:38' },
        { name: 'subdirectory', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/05/23 - 14:38:38' },
        { name: 'example.txt', type: 'file', size: '1.2 KB', owner: 'root:root', mode: '0644', modified: '2025/05/23 - 14:38:38' },
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
        toast({
          title: "下載",
          description: `正在下載 ${itemName}`,
        });
        break;
      case 'rename':
        toast({
          title: "重新命名",
          description: `重新命名 ${itemName}`,
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

  return (
    <div className="space-y-4">
      {/* 主機選擇 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            主機選擇
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedHost} onValueChange={setSelectedHost}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇主機" />
                </SelectTrigger>
                <SelectContent>
                  {hosts.map((host) => (
                    <SelectItem key={host.uuid} value={host.uuid}>
                      <div className="flex items-center gap-2">
                        <span>{host.hostname}</span>
                        <Badge variant={host.status === 'online' ? 'default' : 'secondary'}>
                          {host.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => window.location.reload()}
              disabled={!selectedHost}
              variant="outline"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              重新載入
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 文件瀏覽器 */}
      {selectedHost && (
        <Card>
          <CardHeader>
            <CardTitle>文件瀏覽器</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* 工具列 */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={navigateUp} disabled={currentPath === '/'}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <div className="ml-2">
                  <Breadcrumb 
                    path={currentPath} 
                    onNavigate={navigateToPath}
                    rootPath="/"
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
                        <ContextMenuItem onClick={() => handleContextAction('rename', file.name)}>
                          Rename
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
                <Button variant="outline" size="sm" disabled>2</Button>
                <Button variant="outline" size="sm" disabled>3</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};