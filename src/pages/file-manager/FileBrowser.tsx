import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Folder, File, HardDrive, Copy, Trash2, Download, Upload, Edit2 } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import type {
  GetOnePdirFileResponse,
  GetPdirFileResponse,
  PostDownloadPdirFileRequest,
} from './types'; // 假設你 types.ts 放在 src/types.ts
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
  ip?: string;
  status?: 'online' | 'offline';
}

interface UploadResponse {
  Type: 'OK' | 'ERR';
  Message: string;
}

export const FileBrowser = () => {
  // ---------------------- Hosts ----------------------
  const [hosts, setHosts] = useState<Host[]>([]);
  const [selectedHost, setSelectedHost] = useState<string>('');

  // ---------------------- Files ----------------------
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // ---------------------- Upload ----------------------
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedUploadHosts, setSelectedUploadHosts] = useState<string[]>([]);
  const [, setUploadProgress] = useState<number>(0);

  // ---------------------- Axios Instance ----------------------
  const api = axios.create({
    baseURL: '/api/file',
    headers: { 'Content-Type': 'application/json' },
    timeout: 8000,
  });

  // ---------------------- API Methods ----------------------

  /** 抓取所有主機清單 */
  const fetchHosts = async () => {
    try {
      const { data } = await api.get<GetPdirFileResponse>('/pdir/pcs');

      if (!data || !data.Pcs || typeof data.Pcs !== 'object') {
        console.warn('Invalid response structure:', data);
        toast.error('Error', { description: 'Invalid host list format' });
        return;
      }

      const hostList: Host[] = Object.entries(data.Pcs).map(([uuid, hostname]) => ({
        uuid,
        hostname,
        status: 'online',
      }));

      setHosts(hostList);
    } catch (error) {
      console.error('Fetch hosts failed', error);
      toast.error('Error', { description: 'Failed to fetch hosts' });
    }
  };

  /** 抓取指定主機、指定路徑的檔案 */
  const fetchFiles = async (_hostUuid: string, path: string) => {
    try {
      const payload = { uuid: { Directory: path } };
      const { data } = await api.post<GetOnePdirFileResponse>('/pdir/one', payload);
      // Rust回傳為: { Files: {...}, Length: number }
      const newFiles: FileItem[] = Object.entries(data.Files).map(([name, info]) => ({
        name,
        type: name.includes('.') ? 'file' : 'folder',
        size: info.Size ? `${info.Size} ${info.Unit}` : undefined,
        owner: info.Owner,
        mode: info.Mode,
        modified: info.Modified,
      }));
      setFiles(newFiles);
    } catch (error) {
      console.error('Fetch files failed', error);
      toast.error('Error', { description: 'Failed to fetch files' });
    }
  };

  /** 上傳檔案 */
  const handleUpload = async (hostUuid: string, fileList: FileList) => {
    try {
      const formData = new FormData();
      Array.from(fileList).forEach((f) => formData.append('File', f));
      formData.append('Uuid', hostUuid);

      const { data } = await axios.post<UploadResponse>('/api/file/pdir/action/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / (p.total ?? 1))),
      });

      if (data.Type === 'OK') toast.info('Success', { description: 'Upload Success' });
      toast.error('Upload Failed', { description: data.Message });

      setShowUploadDialog(false);
      setSelectedUploadHosts([]);
      setUploadProgress(0);
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Upload Failed', { description: 'Error uploading files' });
    }
  };

  /** 下載檔案 */
  const handleDownload = async (hostUuid: string, fileName: string) => {
    try {
      const payload: PostDownloadPdirFileRequest = { Uuid: hostUuid, Filename: fileName };
      const { data } = await api.post<UploadResponse>('/pdir/action/download', payload);
      if (data.Type === 'OK') toast.info('Download Success', { description: data.Message });
      else toast.error('Download Failed', { description: data.Message });
    } catch (error) {
      console.error('Download failed', error);
      toast.error('Download Failed', { description: 'Error downloading file' });
    }
  };

  // ---------------------- File selection ----------------------
  const handleItemSelect = (itemName: string, isCtrlClick: boolean = false) => {
    if (isCtrlClick) {
      setSelectedItems((prev) =>
        prev.includes(itemName) ? prev.filter((name) => name !== itemName) : [...prev, itemName],
      );
    } else {
      setSelectedItems([itemName]);
    }
  };

  const handleCheckboxChange = (itemName: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemName) ? prev.filter((name) => name !== itemName) : [...prev, itemName],
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedItems(files.map((f) => f.name));
    else setSelectedItems([]);
  };

  const handleDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      const newPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      setCurrentPath(newPath);
      fetchFiles(selectedHost, newPath);
    }
  };

  const navigateToPath = (path: string) => {
    setCurrentPath(path);
    fetchFiles(selectedHost, path);
  };

  // ---------------------- Context Menu ----------------------
  const handleContextAction = (action: string, itemName: string) => {
    if (!selectedHost) return;
    switch (action) {
      case 'copy':
        toast.success('Copy', { description: `${itemName} copied` });
        break;
      case 'delete':
        setFiles((prev) => prev.filter((f) => f.name !== itemName));
        toast.success('Delete', { description: `${itemName} deleted` });
        break;
      case 'download':
        handleDownload(selectedHost, itemName);
        break;
      case 'rename':
        toast.success('Rename', { description: `${itemName} renamed` });
        break;
    }
  };

  // ---------------------- Load Hosts on mount ----------------------
  useEffect(() => {
    fetchHosts();
  }, []);

  // ---------------------- Render ----------------------
  return (
    <div className='space-y-4'>
      {/* Host Selection */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-4'>
            <CardTitle className='flex items-center gap-2'>
              <HardDrive className='w-5 h-5' /> Host Selection
            </CardTitle>
            <Select
              value={selectedHost}
              onValueChange={(v) => {
                setSelectedHost(v);
                fetchFiles(v, '/');
              }}
            >
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='Select Host' />
              </SelectTrigger>
              <SelectContent>
                {hosts
                  .filter((h) => h.status === 'online')
                  .map((h) => (
                    <SelectItem key={h.uuid} value={h.uuid}>
                      {h.hostname}
                    </SelectItem>
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
          <CardContent className='p-0'>
            <div className='flex items-center justify-between p-4 border-b bg-gray-50'>
              <div className='flex items-center gap-2 overflow-x-auto'>
                <Breadcrumb path={currentPath} onNavigate={navigateToPath} rootPath='/' />
              </div>
              <Button variant='outline' size='sm' onClick={() => setShowUploadDialog(true)}>
                <Upload className='w-4 h-4 mr-1' /> Upload
              </Button>
            </div>

            <div className='px-4 py-2 text-sm text-gray-600 border-b'>
              Total: {files.filter((f) => f.type === 'file').length} files,{' '}
              {files.filter((f) => f.type === 'folder').length} folders. Selected:{' '}
              {selectedItems.length}
            </div>

            <div className='overflow-auto max-h-96'>
              <Table>
                <TableHeader>
                  <TableRow className='sticky top-0 bg-white z-10'>
                    <TableHead className='w-8'>
                      <input
                        type='checkbox'
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
                          className={`cursor-pointer ${
                            selectedItems.includes(file.name) ? 'bg-blue-50' : ''
                          }`}
                          onClick={(e) => handleItemSelect(file.name, e.ctrlKey)}
                          onDoubleClick={() => handleDoubleClick(file)}
                        >
                          <TableCell>
                            <input
                              type='checkbox'
                              checked={selectedItems.includes(file.name)}
                              onChange={() => handleCheckboxChange(file.name)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell className='flex items-center gap-2'>
                            {file.type === 'folder' ? (
                              <Folder className='w-4 h-4 text-blue-500' />
                            ) : (
                              <File className='w-4 h-4 text-gray-500' />
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
                          <Copy className='w-4 h-4 mr-2' /> Copy
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handleContextAction('delete', file.name)}>
                          <Trash2 className='w-4 h-4 mr-2' /> Delete
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handleContextAction('rename', file.name)}>
                          <Edit2 className='w-4 h-4 mr-2' /> Rename
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handleContextAction('download', file.name)}>
                          <Download className='w-4 h-4 mr-2' /> Download
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
                  <DialogTitle>Select Hosts for Upload</DialogTitle>
                </DialogHeader>

                <div className='flex flex-col space-y-2 max-h-60 overflow-y-auto'>
                  {hosts
                    .filter((h) => h.status === 'online')
                    .map((h) => (
                      <div
                        key={h.uuid}
                        className='flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50'
                        onClick={() =>
                          setSelectedUploadHosts((prev) =>
                            prev.includes(h.uuid)
                              ? prev.filter((id) => id !== h.uuid)
                              : [...prev, h.uuid],
                          )
                        }
                      >
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            checked={selectedUploadHosts.includes(h.uuid)}
                            onChange={() => {}}
                          />
                          <span>{h.hostname}</span>
                        </label>
                        <Badge>Online</Badge>
                      </div>
                    ))}
                </div>

                <div className='mt-4 flex justify-end gap-2'>
                  <Button variant='outline' onClick={() => setShowUploadDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    style={{ backgroundColor: '#7B86AA' }}
                    className='hover:opacity-90 text-white'
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files) selectedUploadHosts.forEach((host) => handleUpload(host, files));
                      };
                      input.click();
                    }}
                    disabled={selectedUploadHosts.length === 0}
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
