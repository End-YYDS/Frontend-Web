import { useState, useEffect } from 'react';
import axios from 'axios';
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
import { Breadcrumb } from './Breadcrumb';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// 匯入 types
import type {GetVdirFileResponse, PostDownloadVdirFileRequest} from './types';
import { toast } from 'sonner';

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

interface UploadResponse {
  Type: 'OK' | 'ERR';
  Message: string;
}

export const VirtualDirectoryManager = () => {

  // ---------------------- Hosts ----------------------
  const [hosts] = useState<Host[]>([
    { uuid: 'host-001', hostname: 'PC-OFFICE-001', ip: '192.168.1.101', status: 'online' },
    { uuid: 'host-002', hostname: 'PC-OFFICE-002', ip: '192.168.1.102', status: 'online' },
    { uuid: 'host-003', hostname: 'SERVER-001', ip: '192.168.1.103', status: 'offline' },
  ]);
  const [selectedHost, setSelectedHost] = useState<string>('');

  // ---------------------- Files ----------------------
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<FileItem[]>([
    { name: 'Applications', type: 'folder', owner: 'root:root', mode: '0775', modified: '2025/05/23 - 14:38:38' },
    { name: 'bin', type: 'folder', owner: 'root:root', mode: '0777', modified: '2024/04/22 - 21:08:03' },
    { name: 'boot', type: 'folder', owner: 'root:root', mode: '0755', modified: '2024/04/22 - 21:08:03' },
    { name: 'home', type: 'folder', owner: 'root:root', mode: '0755', modified: '2025/03/21 - 14:26:57' },
    { name: 'example.txt', type: 'file', size: '1.2 KB', owner: 'root:root', mode: '0644', modified: '2025/05/23 - 14:38:38' },
  ]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // ---------------------- Upload ----------------------
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedUploadHosts, setSelectedUploadHosts] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // ---------------------- Fetch Virtual Directory ----------------------
  const fetchVirtualDirectory = async () => {
    try {
      const res = await axios.get<GetVdirFileResponse>('/api/file/vdir');
      if (res.data.Path) setCurrentPath(res.data.Path);
    } catch (e) {
      console.error('Fetch virtual directory failed', e);
      toast.error('Fetch Failed', { description: 'Failed to fetch virtual directory' });
    }
  };

  useEffect(() => {
    fetchVirtualDirectory();
  }, []);

  // ---------------------- File Actions ----------------------
  const handleItemSelect = (itemName: string, isCtrlClick: boolean = false) => {
    setSelectedItems((prev) =>
      isCtrlClick
        ? prev.includes(itemName)
          ? prev.filter((n) => n !== itemName)
          : [...prev, itemName]
        : [itemName]
    );
  };

  const handleCheckboxChange = (itemName: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((n) => n !== itemName)
        : [...prev, itemName]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? files.map((f) => f.name) : []);
  };

  const handleDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      if (item.name === '..') {
        navigateUp();
        return;
      }
      const newPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      setCurrentPath(newPath);
    }
  };

  const navigateUp = () => {
    if (currentPath !== '/') {
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
      setCurrentPath(parentPath);
    }
  };

  const navigateToPath = (path: string) => setCurrentPath(path);

  const handleContextAction = (action: string, itemName: string) => {
    switch (action) {
      case 'copy':
        toast.success('Copy', { description: `Copied ${itemName}` });
        break;
      case 'delete':
        setFiles((prev) => prev.filter((f) => f.name !== itemName));
        toast.success('Delete', { description: `Deleted ${itemName}` });
        break;
      case 'download':
        handleDownload(itemName);
        break;
      case 'rename':
        toast.success('Rename', { description: `Renamed ${itemName}` });
        break;
    }
  };

  // ---------------------- Upload (axios) ----------------------
  const handleUploadToSelectedHosts = async (_selectedUploadHosts?: string[]) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append('File', f));

      try {
        const res = await axios.post<UploadResponse>(
          '/api/file/vdir/action/upload',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (event) => {
              if (event.total) {
                setUploadProgress(Math.round((event.loaded / event.total) * 100));
              }
            },
          }
        );

        if (res.data.Type === 'OK') {
          toast.success('Upload Success', { description: res.data.Message });
        } else {
          toast.error('Upload Failed', { description: res.data.Message });
        }
      } catch (e) {
        console.error('Upload failed', e);
        toast.error('Upload Failed', { description: 'Error uploading files' });
      } finally {
        setShowUploadDialog(false);
        setSelectedUploadHosts([]);
        setUploadProgress(0);
      }
    };
    input.click();
  };

  // ---------------------- Download (axios) ----------------------
  const handleDownload = async (fileName: string) => {
    try {
      const body: PostDownloadVdirFileRequest = { Filename: fileName };
      const res = await axios.post<UploadResponse>(
        '/api/file/vdir/action/download',
        body
      );

      if (res.data.Type === 'OK') {
        toast.success('Download Success', { description: res.data.Message });
      } else {
        toast.error('Download Failed', { description: res.data.Message });
      }
    } catch (e) {
      console.error('Download failed', e);
      toast.error('Download Failed', { description: 'Error downloading file' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Host Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Host Selection
            </CardTitle>
            <Select value={selectedHost} onValueChange={setSelectedHost}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Host" />
              </SelectTrigger>
              <SelectContent>
                {hosts.filter(h => h.status === 'online').map(h => (
                  <SelectItem key={h.uuid} value={h.uuid}>{h.hostname}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* File Browser */}
      {selectedHost && (
        <Card>
          <CardHeader>
            <CardTitle>File Browser</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-2 overflow-x-auto">
                <Breadcrumb path={currentPath} onNavigate={navigateToPath} rootPath="/" />
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowUploadDialog(true)}>
                <Upload className="w-4 h-4 mr-1" /> Upload
              </Button>
            </div>

            <div className="px-4 py-2 text-sm text-gray-600 border-b">
              Total: {files.filter(f => f.type === 'file').length} files, {files.filter(f => f.type === 'folder').length} folders. Selected: {selectedItems.length}
            </div>

            <div className="overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0 bg-white z-10">
                    <TableHead className="w-8">
                      <input type="checkbox" checked={selectedItems.length === files.length && files.length > 0} onChange={(e) => handleSelectAll(e.target.checked)} />
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
                            <input type="checkbox" checked={selectedItems.includes(file.name)} onChange={() => handleCheckboxChange(file.name)} onClick={(e) => e.stopPropagation()} />
                          </TableCell>
                          <TableCell className="flex items-center gap-2">
                            {file.type === 'folder' ? <Folder className="w-4 h-4 text-blue-500" /> : <File className="w-4 h-4 text-gray-500" />}
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

          {/* Upload Dialog */}
          {showUploadDialog && (
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select Hosts to Upload</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col space-y-2 max-h-60 overflow-y-auto">
                  <div className="flex items-center justify-between p-2 rounded">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUploadHosts.length === hosts.filter(h => h.status === 'online').length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUploadHosts(hosts.filter(h => h.status === 'online').map(h => h.uuid));
                          } else setSelectedUploadHosts([]);
                        }}
                      />
                      Select All
                    </label>
                  </div>

                  {hosts.filter(h => h.status === 'online').map(h => (
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
                        <input type="checkbox" checked={selectedUploadHosts.includes(h.uuid)} onChange={() => {}} />
                        <span>{h.hostname}</span>
                      </label>
                      <Badge>Online</Badge>
                    </div>
                  ))}
                </div>

                {uploadProgress > 0 && (
                  <div className="mt-2 w-full bg-gray-200 rounded h-2">
                    <div className="bg-blue-500 h-2 rounded" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}

                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
                  <Button
                    onClick={() => handleUploadToSelectedHosts(selectedUploadHosts)}
                    disabled={selectedUploadHosts.length === 0}
                    style={{ backgroundColor: '#7B86AA' }}
                    className="hover:opacity-90 text-white"
                  >
                    Upload
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
