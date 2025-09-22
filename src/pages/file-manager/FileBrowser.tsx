import { useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger 
} from '@/components/ui/context-menu';
import { 
  Folder, File, HardDrive, Copy, Trash2, Download, Upload, Edit2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumb } from './Breadcrumb';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([
    { name: 'Applications', type: 'folder', owner: 'root:root', mode: '0775', modified: '2025/05/23 - 14:38:38' },
    { name: 'bin', type: 'folder', owner: 'root:root', mode: '0777', modified: '2024/04/22 - 21:08:03' },
    { name: 'boot', type: 'folder', owner: 'root:root', mode: '0755', modified: '2024/04/22 - 21:08:03' },
    { name: 'home', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/03/21 - 14:26:57' },
    { name: 'example.txt', type: 'file', size: '1.2 KB', owner: 'root:root', mode: '0644', modified: '2025/05/23 - 14:38:38' },
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(files.map(file => file.name));
    } else {
      setSelectedItems([]);
    }
  };

  const handleDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      if (item.name === '..') {
        navigateUp();
        return;
      }
      const newPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      if (newPath === currentPath) return;
      setCurrentPath(newPath);
      setFiles([
        { name: '..', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/05/23' },
        { name: 'longlonglonglongsubdir', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/05/23' },
        { name: 'readme.md', type: 'file', size: '512 B', owner: 'root:root', mode: '0644', modified: '2025/05/23' },
      ]);
    }
  };

  const navigateUp = () => {
    if (currentPath !== '/') {
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
      setCurrentPath(parentPath);
      if (parentPath === '/') {
        setFiles([
          { name: 'Applications', type: 'folder', owner: 'root:root', mode: '0775', modified: '2025/05/23' },
          { name: 'bin', type: 'folder', owner: 'root:root', mode: '0777', modified: '2024/04/22' },
          { name: 'home', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/03/21' },
        ]);
      }
    }
  };

  const navigateToPath = (path: string) => {
    setCurrentPath(path);
    if (path === '/') {
      setFiles([
        { name: 'Applications', type: 'folder', owner: 'root:root', mode: '0775', modified: '2025/05/23' },
        { name: 'bin', type: 'folder', owner: 'root:root', mode: '0777', modified: '2024/04/22' },
        { name: 'home', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/03/21' },
      ]);
    } else {
      setFiles([
        { name: '..', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/05/23' },
        { name: 'nested', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/05/23' },
      ]);
    }
  };

  const handleContextAction = (action: string, itemName: string) => {
    switch (action) {
      case 'copy':
        toast({ title: "複製", description: `已複製 ${itemName}` });
        break;
      case 'delete':
        setFiles(prev => prev.filter(file => file.name !== itemName));
        toast({ title: "刪除", description: `已刪除 ${itemName}` });
        break;
      case 'download':
        toast({ title: "下載", description: `正在下載 ${itemName}` });
        break;
      case 'rename':
        toast({ title: "重新命名", description: `重新命名 ${itemName}` });
        break;
    }
  };
  const [selectedUploadHosts, setSelectedUploadHosts] = useState<string[]>([]);

 const handleUploadToSelectedHosts = (hostUUIDs: string[]) => {
    console.log('上傳到主機:', hostUUIDs);
    // 在這裡加入上傳邏輯
    setShowUploadDialog(false);
    setSelectedUploadHosts([]);
  };

  return (
    <div className="space-y-4">
      {/* 主機選擇 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              主機選擇
            </CardTitle>
            <Select value={selectedHost} onValueChange={setSelectedHost}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="選擇主機" />
              </SelectTrigger>
              <SelectContent>
                {hosts.filter(h => h.status === "online").map(h => (
                  <SelectItem key={h.uuid} value={h.uuid}>{h.hostname}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
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
              <div className="flex items-center gap-2 overflow-x-auto">
                <Breadcrumb path={currentPath} onNavigate={navigateToPath} rootPath="/" />
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowUploadDialog(true)}>
                <Upload className="w-4 h-4 mr-1" /> 上傳
              </Button>
            </div>

            {/* 狀態列 */}
            <div className="px-4 py-2 text-sm text-gray-600 border-b">
              Total: {files.filter(f => f.type === 'file').length} files,{" "}
              {files.filter(f => f.type === 'folder').length} folders. Selected: {selectedItems.length}
            </div>

            {/* 文件列表 */}
            <div className="overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0 bg-white z-10">
                    <TableHead className="w-8">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === files.length && files.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </TableHead>
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
                        <ContextMenuItem onClick={() => handleContextAction('copy', file.name)}>
                          <Copy className="w-4 h-4 mr-2" /> Copy
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handleContextAction('delete', file.name)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handleContextAction('rename', file.name)}>
                          <Edit2 className="w-4 h-4 mr-2" /> Rename
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handleContextAction('download', file.name)}>
                          <Download className="w-4 h-4 mr-2" /> Download
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          {/* 上傳對話框 */}
          {showUploadDialog && (
  <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>選擇要上傳的主機</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col space-y-2 max-h-60 overflow-y-auto">
        {/* 全選勾選框 */}
        

        {hosts
          .filter(h => h.status === 'online')
          .map(h => (
            <div
              key={h.uuid}
              className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50"
              onClick={() => {
                setSelectedUploadHosts(prev =>
                  prev.includes(h.uuid)
                    ? prev.filter(id => id !== h.uuid)
                    : [...prev, h.uuid]
                );
              }}
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedUploadHosts.includes(h.uuid)}
                  onChange={() => {}}
                />
                <span>{h.hostname}</span>
              </label>
              <Badge>Online</Badge>
            </div>
          ))}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button
          onClick={() => handleUploadToSelectedHosts(selectedUploadHosts)}
          disabled={selectedUploadHosts.length === 0}
        >
          上傳
        </Button>
        <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
          取消
        </Button>
      </div>
    </DialogContent>
  </Dialog>
)}

        </Card>
      )}
    </div>
  );
};
