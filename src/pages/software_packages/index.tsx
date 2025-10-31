import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, Trash2, RefreshCw, Plus } from 'lucide-react';
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import type { PageMeta } from '@/types';
import axios from 'axios';
import type { InstallRequest, DeleteRequest, ActionResponse } from './types';

// interface Package {
//   name: string;
//   version: string;
//   status: 'Installed' | 'Notinstall';
// }

// interface PC {
//   uuid: string;
//   name: string;
//   packages: Record<string, Package>;
// }

const ITEMS_PER_PAGE = 20;

const SoftwarePackagesPage = () => {
  const isMobile = useIsMobile();
  const [pcs, setPcs] = useState<PC[]>([]);
  const [selectedPc, setSelectedPc] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [packageToInstall, setPackageToInstall] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileDisplayCount, setMobileDisplayCount] = useState(ITEMS_PER_PAGE);
  const [showUninstallDialog, setShowUninstallDialog] = useState(false);
  const [packageToUninstall, setPackageToUninstall] = useState<{ key: string; name: string } | null>(null);

  useEffect(() => {
    fetchPCs();
  }, []);

  // -------------------- API --------------------
  const fetchPCs = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get<{ Pcs: Record<string, { Packages: Record<string, { Version: string; Status: 'Installed' | 'Notinstall' }> }> }>('/api/software', { withCredentials: true });
      const pcList: PC[] = Object.entries(res.data.Pcs).map(([uuid, pc]) => ({
        uuid,
        name: `PC-${uuid}`,
        packages: Object.entries(pc.Packages).reduce((acc, [key, pkg]) => {
          acc[key] = { name: key, version: pkg.Version, status: pkg.Status };
          return acc;
        }, {} as Record<string, Package>)
      }));
      setPcs(pcList);
      if (pcList.length > 0) setSelectedPc(pcList[0].uuid);
    } catch (error) {
      console.error('Error fetching PCs:', error);
      toast.error('Failed to fetch PCs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUninstallPackage = async (packageKey: string) => {
    if (!selectedPc || !packageToUninstall) return;
    setIsLoading(true);
    try {
      const payload: DeleteRequest = { uuid: [selectedPc], Package: [packageKey] };
      const res = await axios.delete<ActionResponse>('/api/software', { data: payload, withCredentials: true });
      const installed = res.data.Packages[packageKey]?.Installed || [];
      setPcs(prev => prev.map(pc => pc.uuid === selectedPc ? {
        ...pc,
        packages: {
          ...pc.packages,
          ...installed.reduce((acc, name) => {
            const key = Object.keys(pc.packages).find(k => pc.packages[k].name === name) || name;
            acc[key] = { ...pc.packages[key], status: 'Notinstall' };
            return acc;
          }, {} as Record<string, Package>)
        }
      } : pc));
      toast.success('移除完成', { description: installed.length ? `成功移除 ${installed.join(', ')}` : '套件移除失敗' });
    } catch (error) {
      console.error(error);
      toast.error('移除失敗');
    } finally {
      setIsLoading(false);
      setShowUninstallDialog(false);
      setPackageToUninstall(null);
    }
  };

  const handleUpdatePackage = async (packageKey: string) => {
    if (!selectedPc) return;
    setIsLoading(true);
    try {
      // 假設後端同樣用 POST /api/software 安裝最新版本
      const payload: InstallRequest = { uuid: [selectedPc], Packages: [packageKey] };
      const res = await axios.post<ActionResponse>('/api/software', payload, { withCredentials: true });
      const installed = res.data.Packages[packageKey]?.Installed || [];

      setPcs(prev => prev.map(pc => pc.uuid === selectedPc ? {
        ...pc,
        packages: {
          ...pc.packages,
          ...installed.reduce((acc, name) => {
            const key = Object.keys(pc.packages).find(k => pc.packages[k].name === name) || name;
            const oldVersion = pc.packages[key].version.split('.');
            oldVersion[2] = String((parseInt(oldVersion[2]) || 0) + 1);
            acc[key] = { ...pc.packages[key], version: oldVersion.join('.') };
            return acc;
          }, {} as Record<string, Package>)
        }
      } : pc));
      toast.success('更新完成', { description: installed.length ? `成功更新 ${installed.join(', ')}` : '更新失敗' });
    } catch (error) {
      console.error(error);
      toast.error('更新失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstallCustomPackage = async () => {
    if (!packageToInstall.trim()) return;
    try {
      setIsLoading(true);
      const newKey = packageToInstall.toLowerCase().replace(/\s+/g, '-');
      const payload: InstallRequest = { uuid: [selectedPc], Packages: [packageToInstall] };
      await axios.post<ActionResponse>('/api/software', payload, { withCredentials: true });
      setPcs(prev => prev.map(pc => pc.uuid === selectedPc ? {
        ...pc,
        packages: {
          ...pc.packages,
          [newKey]: { name: packageToInstall, version: '1.0.0', status: 'Installed' }
        }
      } : pc));
      toast.success('安裝完成', { description: `成功安裝 ${packageToInstall}` });
      setPackageToInstall('');
      setShowInstallDialog(false);
    } catch (error) {
      console.error(error);
      toast.error('安裝失敗');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------- 分頁/搜尋 --------------------
  const selectedPcData = pcs.find(pc => pc.uuid === selectedPc);
  const installedPackages = selectedPcData
    ? Object.entries(selectedPcData.packages)
        .filter(([, pkg]) => pkg.status === 'Installed' && pkg.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const totalPages = Math.ceil(installedPackages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const currentPackages = isMobile
    ? installedPackages.slice(0, mobileDisplayCount)
    : installedPackages.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
    setMobileDisplayCount(ITEMS_PER_PAGE);
  }, [searchTerm, selectedPc]);

  const handleLoadMore = () => setMobileDisplayCount(prev => prev + ITEMS_PER_PAGE);

  const confirmUninstallPackage = (packageKey: string, packageName: string) => {
    setPackageToUninstall({ key: packageKey, name: packageName });
    setShowUninstallDialog(true);
  };

interface Package {
  name: string;
  version: string;
  status: 'Installed' | 'Notinstall';
}

interface PC {
  uuid: string;
  name: string;
  packages: Record<string, Package>;
}
  const renderPagination = () => {
    // 只在桌面版顯示分頁
    if (isMobile || totalPages <= 1) return null;

    const renderPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      // Calculate start and end page numbers
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      // Adjust start page if we're near the end
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      // Add first page if not visible
      if (startPage > 1) {
        pages.push(
          <PaginationItem key={1}>
            <PaginationLink onClick={() => setCurrentPage(1)} isActive={currentPage === 1}>
              1
            </PaginationLink>
          </PaginationItem>
        );
        if (startPage > 2) {
          pages.push(
            <PaginationItem key="start-ellipsis">
              <PaginationEllipsis />
            </PaginationItem>
          );
        }
      }

      // Add visible page numbers
      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink onClick={() => setCurrentPage(i)} isActive={currentPage === i}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Add last page if not visible
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push(
            <PaginationItem key="end-ellipsis">
              <PaginationEllipsis />
            </PaginationItem>
          );
        }
        pages.push(
          <PaginationItem key={totalPages}>
            <PaginationLink onClick={() => setCurrentPage(totalPages)} isActive={currentPage === totalPages}>
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }

      return pages;
    };

    return (
      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {renderPageNumbers()}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  const renderLoadMoreButton = () => {
    // 只在手機版顯示載入更多按鈕
    if (!isMobile || mobileDisplayCount >= installedPackages.length) return null;

    return (
      <div className="mt-4 text-center">
        <Button 
          variant="outline" 
          onClick={handleLoadMore}
          disabled={isLoading}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Load more installed packages ({installedPackages.length - mobileDisplayCount} remaining)
        </Button>
      </div>
    );
  };

  return (
      <div className="container mx-auto py-6 px-4">
        <div className="bg-[#A8AEBD] py-1.5 mb-6">
          <h1 className="text-4xl font-extrabold text-center text-[#E6E6E6]">
                Software Packages
          </h1>
        </div>

      <div className="space-y-6">
        {/* PC 選擇和搜尋 */}
        <Card>
          <CardHeader>
            <CardTitle>Select PC</CardTitle>
            <CardDescription>Select the PC to manage software packages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="pc-select" className="mb-2">PC</Label>
                <Select value={selectedPc} onValueChange={setSelectedPc}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select PC" />
                  </SelectTrigger>
                  <SelectContent>
                    {pcs.map((pc) => (
                      <SelectItem key={pc.uuid} value={pc.uuid}>
                        {pc.name} ({pc.uuid})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Label htmlFor="search" className="mb-2">Search Installed Packages</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search installed packages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="flex items-end gap-2">
                <Button onClick={fetchPCs} disabled={isLoading} className="bg-[#7B86AA] hover:bg-[#7B86AA]">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                
                <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#7B86AA] hover:bg-[#7B86AA]">
                      <Download className="h-4 w-4 mr-2" />
                      Install Package
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Install New Package</DialogTitle>
                      <DialogDescription>
                        Enter the package name to install
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="package-name">Package Name</Label>
                        <Input
                          id="package-name"
                          value={packageToInstall}
                          onChange={(e) => setPackageToInstall(e.target.value)}
                          placeholder="e.g., nginx, redis, mongodb"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowInstallDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleInstallCustomPackage}
                          disabled={!packageToInstall.trim() || isLoading}
                        >
                          Install
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 套件清單 */}
        {selectedPcData && (
          <Card>
            <CardHeader>
              <CardTitle>Installed Packages</CardTitle>
              <CardDescription>
                Installed packages on {selectedPcData.name} (Total  {installedPackages.length}
                {!isMobile && `, Page ${currentPage} of ${totalPages} `}
                {isMobile && `, Showing ${Math.min(mobileDisplayCount, installedPackages.length)}`})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                /* 手機版：卡片列表 */
                <div className="space-y-3">
                  {currentPackages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {isLoading ? 'Loading...' : searchTerm ? 'No matching installed packages found' : 'No installed packages available'}
                    </div>
                  ) : (
                    currentPackages.map(([key, pkg]) => (
                      <Card key={key} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-base mb-1">{pkg.name}</h3>
                              <p className="text-sm text-muted-foreground">Version: {pkg.version}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUpdatePackage(key)}
                              disabled={isLoading}
                              className="flex-1"
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Version
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => confirmUninstallPackage(key, pkg.name)}
                              disabled={isLoading}
                              className="flex-1"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              ) : (
                /* 桌面版：表格 */
                <Table>
                  <TableCaption>
                    {searchTerm ? `Search results: ${installedPackages.length} installed packages` : `Total ${installedPackages.length} installed packages`}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Package Name</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead className="text-right">Operation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPackages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          {isLoading ? 'Loading...' : searchTerm ? 'No matching installed packages found' : 'No installed packages available'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentPackages.map(([key, pkg]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium">{pkg.name}</TableCell>
                          <TableCell>{pkg.version}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleUpdatePackage(key)}
                                disabled={isLoading}
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => confirmUninstallPackage(key, pkg.name)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
              
              {/* 手機版顯示載入更多按鈕，桌面版顯示分頁 */}
              {renderLoadMoreButton()}
              {renderPagination()}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 移除套件確認對話框 */}
      <AlertDialog open={showUninstallDialog} onOpenChange={setShowUninstallDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to remove this package?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to remove <strong>{packageToUninstall?.name}</strong>. This action will uninstall the package, but you can reinstall it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (packageToUninstall) {
                  handleUninstallPackage(packageToUninstall.key);
                }
              }} 
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

(SoftwarePackagesPage as any).meta = {
  requiresAuth: true, //驗證
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;

export default SoftwarePackagesPage;