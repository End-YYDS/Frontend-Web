import { useState, useEffect } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, Trash, RefreshCw, Package, Plus } from 'lucide-react';
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import type { PageMeta } from '@/types';

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

const ITEMS_PER_PAGE = 20; // 每頁顯示20個項目

const SoftwarePackagesPage = () => {
  const isMobile = useIsMobile();
  const [pcs, setPcs] = useState<PC[]>([]);
  const [selectedPc, setSelectedPc] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [packageToInstall, setPackageToInstall] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileDisplayCount, setMobileDisplayCount] = useState(ITEMS_PER_PAGE); // 手機版顯示數量

  // Mock data
  useEffect(() => {
    fetchPCs();
  }, []);

  const fetchPCs = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate more mock data to simulate large package lists
      const generatePackages = (baseCount: number) => {
        const packages: Record<string, Package> = {};
        const packageNames = [
          'Node.js', 'Python', 'Docker', 'Visual Studio Code', 'Git', 'MySQL', 'PostgreSQL',
          'MongoDB', 'Redis', 'Nginx', 'Apache', 'PHP', 'Java', 'Maven', 'Gradle',
          'IntelliJ IDEA', 'Eclipse', 'Postman', 'Chrome', 'Firefox', 'Slack', 'Discord',
          'Zoom', 'Teams', 'Office 365', 'Adobe Photoshop', 'Adobe Illustrator', 'Figma',
          'Sketch', 'Blender', 'Unity', 'Unreal Engine', 'Steam', 'Epic Games Launcher',
          'VLC', 'Spotify', 'iTunes', 'WhatsApp', 'Telegram', 'Signal', 'Android Studio',
          'Xcode', 'Flutter', 'React Native', 'Expo', 'Webpack', 'Vite', 'Rollup',
          'ESLint', 'Prettier', 'TypeScript', 'Babel', 'Jest', 'Cypress', 'Playwright',
          'Kubernetes', 'Terraform', 'AWS CLI', 'Azure CLI', 'Google Cloud SDK',
          'Vagrant', 'VirtualBox', 'VMware', 'Parallels', 'WSL', 'Homebrew', 'Chocolatey',
          'npm', 'yarn', 'pnpm', 'pip', 'conda', 'Ruby', 'Rails', 'Django', 'Flask',
          'Laravel', 'Symfony', 'Spring Boot', 'Express.js', 'Fastify', 'Koa.js',
          'Angular', 'Vue.js', 'Svelte', 'Next.js', 'Nuxt.js', 'Gatsby', 'Remix',
          'Tailwind CSS', 'Bootstrap', 'Material-UI', 'Ant Design', 'Chakra UI',
          'Styled Components', 'Emotion', 'SASS', 'Less', 'PostCSS', 'GraphQL',
          'Apollo', 'Prisma', 'Sequelize', 'TypeORM', 'Mongoose', 'Supabase',
          'Firebase', 'Vercel', 'Netlify', 'Heroku', 'DigitalOcean', 'Cloudflare'
        ];

        for (let i = 0; i < baseCount; i++) {
          const packageName = packageNames[i % packageNames.length];
          const suffix = i >= packageNames.length ? ` ${Math.floor(i / packageNames.length) + 1}` : '';
          const key = `pkg${i}`;
          packages[key] = {
            name: `${packageName}${suffix}`,
            version: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
            status: Math.random() > 0.3 ? 'Installed' : 'Notinstall'
          };
        }
        return packages;
      };

      const mockData: PC[] = [
        {
          uuid: "pc-001",
          name: "工作站-001",
          packages: generatePackages(150) // 生成150個套件
        },
        {
          uuid: "pc-002",
          name: "工作站-002",
          packages: generatePackages(120) // 生成120個套件
        }
      ];
      
      setPcs(mockData);
      if (mockData.length > 0) {
        setSelectedPc(mockData[0].uuid);
      }
    } catch (error) {
      console.error("Error fetching PCs:", error);
      toast.error("獲取電腦清單失敗", {
        description: "無法載入電腦清單，請稍後再試"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPcData = pcs.find(pc => pc.uuid === selectedPc);
  
  // Filter only installed packages and apply search
  const installedPackages = selectedPcData ? 
    Object.entries(selectedPcData.packages).filter(([, pkg]) =>
      pkg.status === 'Installed' && 
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

  // Calculate pagination for desktop
  const totalPages = Math.ceil(installedPackages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  
  // For mobile: show first N items based on mobileDisplayCount
  // For desktop: show current page items
  const currentPackages = isMobile 
    ? installedPackages.slice(0, mobileDisplayCount)
    : installedPackages.slice(startIndex, endIndex);

  // Reset when search term or selected PC changes
  useEffect(() => {
    setCurrentPage(1);
    setMobileDisplayCount(ITEMS_PER_PAGE); // 重置手機版顯示數量
  }, [searchTerm, selectedPc]);

  const handleLoadMore = () => {
    setMobileDisplayCount(prev => prev + ITEMS_PER_PAGE);
  };
//TODO: 
  // const handleInstallPackage = async (packageKey: string) => {
  //   try {
  //     setIsLoading(true);
      
  //     // Mock API call
  //     await new Promise(resolve => setTimeout(resolve, 1500));
      
  //     // Mock response - simulate finding similar package if exact not found
  //     const foundSimilar = Math.random() > 0.3; // 70% chance of finding similar
  //     const actualInstalled = foundSimilar ? packageKey : `${packageKey}-community`;
      
  //     // Update local state
  //     setPcs(prevPcs => prevPcs.map(pc => 
  //       pc.uuid === selectedPc ? {
  //         ...pc,
  //         packages: {
  //           ...pc.packages,
  //           [packageKey]: {
  //             ...pc.packages[packageKey],
  //             status: 'Installed'
  //           }
  //         }
  //       } : pc
  //     ));
      
  //     toast.success("安裝完成", {
  //       description: foundSimilar 
  //         ? `成功安裝 ${actualInstalled}`
  //         : `找不到指定套件，已安裝類似套件 ${actualInstalled}`
  //     });
  //   } catch (error) {
  //     console.error("Error installing package:", error);
  //     toast.error("安裝失敗", {
  //       description: "套件安裝過程中發生錯誤"
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleUninstallPackage = async (packageKey: string) => {
    try {
      setIsLoading(true);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setPcs(prevPcs => prevPcs.map(pc => 
        pc.uuid === selectedPc ? {
          ...pc,
          packages: {
            ...pc.packages,
            [packageKey]: {
              ...pc.packages[packageKey],
              status: 'Notinstall'
            }
          }
        } : pc
      ));
      
      toast.success("解除安裝完成", {
        description: `已成功移除 ${selectedPcData?.packages[packageKey].name}`
      });
    } catch (error) {
      console.error("Error uninstalling package:", error);
      toast.error("解除安裝失敗", {
        description: "套件移除過程中發生錯誤"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePackage = async (packageKey: string) => {
    try {
      setIsLoading(true);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mock version update
      const currentPkg = selectedPcData?.packages[packageKey];
      if (currentPkg) {
        const versionParts = currentPkg.version.split('.');
        if (versionParts.length >= 3) {
          versionParts[2] = String(parseInt(versionParts[2]) + 1);
          const newVersion = versionParts.join('.');
          
          // Update local state
          setPcs(prevPcs => prevPcs.map(pc => 
            pc.uuid === selectedPc ? {
              ...pc,
              packages: {
                ...pc.packages,
                [packageKey]: {
                  ...pc.packages[packageKey],
                  version: newVersion
                }
              }
            } : pc
          ));
        }
      }
      
      toast.success("更新完成", {
        description: `已成功更新 ${currentPkg?.name}`
      });
    } catch (error) {
      console.error("Error updating package:", error);
      toast.error("更新失敗", {
        description: "套件更新過程中發生錯誤"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstallCustomPackage = async () => {
    if (!packageToInstall.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newPackageKey = packageToInstall.toLowerCase().replace(/\s+/g, '-');
      
      // Add to local state
      setPcs(prevPcs => prevPcs.map(pc => 
        pc.uuid === selectedPc ? {
          ...pc,
          packages: {
            ...pc.packages,
            [newPackageKey]: {
              name: packageToInstall,
              version: "1.0.0",
              status: 'Installed'
            }
          }
        } : pc
      ));
      
      setShowInstallDialog(false);
      setPackageToInstall('');
      
      toast.success("安裝完成", {
        description: `已成功安裝 ${packageToInstall}`
      });
    } catch (error) {
      console.error("Error installing custom package:", error);
      toast.error("安裝失敗", {
        description: "套件安裝過程中發生錯誤"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPagination = () => {
    // 只在桌面版顯示分頁
    if (isMobile || totalPages <= 1) return null;

    const renderPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      // Calculate start and end page numbers
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
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
          載入更多已安裝套件 ({installedPackages.length - mobileDisplayCount} 個剩餘)
        </Button>
      </div>
    );
  };

  return (
      <div className="container mx-auto py-6 px-4">
      <div className="bg-[#A8AEBD] py-3 mb-3">
        <h1 className="text-2xl font-extrabold text-center text-[#E6E6E6]">
            Software Packages
        </h1>
      </div>


      <div className="space-y-6">
        {/* PC 選擇和搜尋 */}
        <Card>
          <CardHeader>
            <CardTitle>選擇電腦</CardTitle>
            <CardDescription>選擇要管理軟體套件的電腦</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="pc-select" className="mb-2">電腦</Label>
                <Select value={selectedPc} onValueChange={setSelectedPc}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇電腦" />
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
                <Label htmlFor="search" className="mb-2">搜尋已安裝軟體套件</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="搜尋已安裝的軟體套件..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="flex items-end gap-2">
                <Button onClick={fetchPCs} disabled={isLoading} className="bg-[#7B86AA] hover:bg-[#7B86AA]">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  重新整理
                </Button>
                
                <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#7B86AA] hover:bg-[#7B86AA]">
                      <Download className="h-4 w-4 mr-2" />
                      安裝套件
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>安裝新套件</DialogTitle>
                      <DialogDescription>
                        輸入要安裝的套件名稱
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="package-name">套件名稱</Label>
                        <Input
                          id="package-name"
                          value={packageToInstall}
                          onChange={(e) => setPackageToInstall(e.target.value)}
                          placeholder="例如: nginx, redis, mongodb"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowInstallDialog(false)}>
                          取消
                        </Button>
                        <Button 
                          onClick={handleInstallCustomPackage}
                          disabled={!packageToInstall.trim() || isLoading}
                        >
                          安裝
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
              <CardTitle>已安裝軟體套件清單</CardTitle>
              <CardDescription>
                {selectedPcData.name} 的已安裝軟體套件 (共 {installedPackages.length} 個
                {!isMobile && `, 第 ${currentPage} 頁，共 ${totalPages} 頁`}
                {isMobile && `, 顯示 ${Math.min(mobileDisplayCount, installedPackages.length)} 個`})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                /* 手機版：卡片列表 */
                <div className="space-y-3">
                  {currentPackages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {isLoading ? '載入中...' : searchTerm ? '找不到相關的已安裝套件' : '目前沒有已安裝的套件'}
                    </div>
                  ) : (
                    currentPackages.map(([key, pkg]) => (
                      <Card key={key} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-base mb-1">{pkg.name}</h3>
                              <p className="text-sm text-muted-foreground">版本: {pkg.version}</p>
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
                              更新
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUninstallPackage(key)}
                              disabled={isLoading}
                              className="flex-1"
                            >
                              <Trash className="h-4 w-4 mr-1" />
                              移除
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
                    {searchTerm ? `搜尋結果：${installedPackages.length} 個已安裝套件` : `共 ${installedPackages.length} 個已安裝套件`}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>套件名稱</TableHead>
                      <TableHead>版本</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPackages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          {isLoading ? '載入中...' : searchTerm ? '找不到相關的已安裝套件' : '目前沒有已安裝的套件'}
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
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUpdatePackage(key)}
                                disabled={isLoading}
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                更新
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUninstallPackage(key)}
                                disabled={isLoading}
                              >
                                <Trash className="h-4 w-4 mr-1" />
                                移除
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
    </div>
  );
};

(SoftwarePackagesPage as any).meta = {
  requiresAuth: true, //驗證
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;

export default SoftwarePackagesPage;