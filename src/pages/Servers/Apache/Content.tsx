// import { useCallback, useEffect, useState } from 'react';
// import { ComputerList } from './ComputerList';
// import { ComputerDetail } from './ComputerDetail';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { CheckCircle2, Download, Search } from 'lucide-react';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Input } from '@/components/ui/input';
// // import type { PcsUuid, GetAllPcResponse } from './types';
// import { toast } from 'sonner';
// import { getNoinstall, postInstall, type Uuid } from '@/api/openapi-client';

// interface Computer {
//   id: string;
//   name: string;
//   // uuid: string;
//   // status: 'online' | 'offline';
// }

// const ServerContent = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isInstalling, setIsInstalling] = useState(false);
//   const [installDialogOpen, setInstallDialogOpen] = useState(false);
//   const [selectedComputersForInstall, setSelectedComputersForInstall] = useState<string[]>([]);
//   const [computers, setComputers] = useState<Computer[]>([]);
//   const [selectedComputerId, setSelectedComputerId] = useState<string | null>(null);
//   const [listReloadKey, setListReloadKey] = useState(0);
//   const [installComputer] = useState<Uuid[]>([
//     { Status: true, Hostname: 'ServerA', Ip: '192.168.0.10' },
//     { Status: true, Hostname: 'ServerB', Ip: '192.168.0.11' },
//     { Status: false, Hostname: 'ServerC', Ip: '192.168.0.12' },
//   ]);

//   /** 取得線上電腦資料 */
//   const getOnlineComputers = useCallback(async () => {
//     try {
//       const { data } = await getNoinstall({ query: { Server: 'apache' } });
//       if (!data || !data.Pcs || Object.keys(data.Pcs).length === 0) {
//         console.warn('API 回傳空資料，改用測試資料');
//         setComputers(
//           installComputer.map((pc, idx) => ({
//             id: `mock-${idx}`,
//             name: pc.Hostname,
//             // uuid: `uuid-${idx}`,
//             // status: pc.Status ? 'online' : 'offline',
//           })),
//         );
//         return;
//       }
//       let noinstalled: Record<string, string> = {};
//       if ('NotInstalled' in data.Pcs) {
//         noinstalled = data.Pcs.NotInstalled;
//       } else if ('Installed' in data.Pcs) {
//         noinstalled = {};
//       }

//       const pcsArray: Computer[] = Object.entries(noinstalled).map(([uuid, hostname]) => ({
//         id: uuid,
//         name: hostname || uuid,
//         // uuid,
//         // status: pc.Status ? 'online' : 'offline',
//       }));
//       setComputers(pcsArray);
//     } catch {
//       toast.error('Error', { description: 'Failed to fetch computer list, using test data.' });
//       setComputers(
//         installComputer.map((pc, idx) => ({
//           id: `mock-${idx}`,
//           name: pc.Hostname,
//           uuid: `uuid-${idx}`,
//           status: pc.Status ? 'online' : 'offline',
//         })),
//       );
//     }
//   }, [installComputer]);

//   useEffect(() => {
//     getOnlineComputers();
//   }, [getOnlineComputers]);

//   /** 切換主機勾選 */
//   const handleComputerToggle = (computerId: string) => {
//     setSelectedComputersForInstall((prev) =>
//       prev.includes(computerId) ? prev.filter((id) => id !== computerId) : [...prev, computerId],
//     );
//   };

//   /** 點擊主機卡片時：顯示詳細資訊畫面 */
//   const handleComputerSelect = (computerId: string) => {
//     setSelectedComputerId(computerId);
//   };

//   /** 從詳細資訊返回清單 */
//   const handleBackToList = () => {
//     setSelectedComputerId(null);
//   };

//   /** 安裝流程 */
//   const handleInstallServer = async () => {
//     if (selectedComputersForInstall.length === 0) {
//       toast.error('Error', { description: 'Please select at least one computer to install.' });
//       return;
//     }

//     setIsInstalling(true);
//     console.log('安裝中電腦:', selectedComputersForInstall);

//     try {
//       const { data } = await postInstall({
//         body: { Server: 'apache', Uuids: selectedComputersForInstall },
//       });
//       // await new Promise((resolve) => setTimeout(resolve, 2000));
//       if (!data || data.Type !== 'Ok') {
//         throw new Error('Installation API returned an error');
//       }
//       toast.success('Success', {
//         description: `已成功在 ${selectedComputersForInstall.length} 台電腦安裝 Apache。`,
//       });
//       setInstallDialogOpen(false);
//       setSelectedComputersForInstall([]);
//     } catch {
//       toast.error('Error', { description: 'Installation failed, please try again later.' });
//     } finally {
//       setIsInstalling(false);
//     }
//   };

//   /** 若有選取主機，顯示詳細資訊畫面 */
//   if (selectedComputerId) {
//     return <ComputerDetail computerId={selectedComputerId} onBack={handleBackToList} />;
//   }

//   /** 主畫面（清單 + 搜尋 + 安裝 Dialog） */
//   return (
//     <div>
//       <div className='mb-6'>
//         <div className='flex items-center justify-between mb-4'>
//           <div></div>
//           <div className='flex items-center gap-2'>
//             <Dialog open={installDialogOpen} onOpenChange={setInstallDialogOpen}>
//               <DialogTrigger asChild>
//                 <Button
//                   style={{ backgroundColor: '#7B86AA' }}
//                   className='hover:opacity-80 text-white'
//                 >
//                   <Download className='w-4 h-4 mr-2' />
//                   Install
//                 </Button>
//               </DialogTrigger>

//               <DialogContent className='max-w-md'>
//                 <DialogHeader>
//                   <DialogTitle>Install Apache</DialogTitle>
//                 </DialogHeader>

//                 <div className='space-y-4'>
//                   <p className='text-sm text-slate-600'>Select computers to install Apache on:</p>

//                   <div className='space-y-2 max-h-60 overflow-y-auto'>
//                     {computers
//                       .filter((computer) =>
//                         computer.name.toLowerCase().includes(searchTerm.toLowerCase()),
//                       )
//                       // .filter((computer) => computer.status === 'online')
//                       .map((computer) => (
//                         <div
//                           key={computer.id}
//                           className='flex items-center space-x-2 p-2 border rounded'
//                         >
//                           <Checkbox
//                             id={computer.id}
//                             checked={selectedComputersForInstall.includes(computer.id)}
//                             onCheckedChange={() => handleComputerToggle(computer.id)}
//                           />
//                           <label htmlFor={computer.id} className='flex-1 cursor-pointer'>
//                             <div className='flex items-center justify-between'>
//                               <span className='font-medium'>{computer.name}</span>
//                             </div>
//                           </label>
//                         </div>
//                       ))}
//                   </div>

//                   <div className='flex justify-end gap-2'>
//                     <Button
//                       variant='outline'
//                       onClick={() => setInstallDialogOpen(false)}
//                       disabled={isInstalling}
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       onClick={handleInstallServer}
//                       disabled={isInstalling || selectedComputersForInstall.length === 0}
//                       style={{ backgroundColor: '#7B86AA' }}
//                       className='hover:opacity-80 text-white'
//                     >
//                       {isInstalling ? (
//                         <>
//                           <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
//                           Installing...
//                         </>
//                       ) : (
//                         <>
//                           <CheckCircle2 className='w-4 h-4 mr-2' />
//                           Confirm Install
//                         </>
//                       )}
//                     </Button>
//                   </div>
//                 </div>
//               </DialogContent>
//             </Dialog>

//             {/* 搜尋欄 */}
//             <div className='relative'>
//               <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
//               <Input
//                 placeholder='Search computers...'
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className='pl-10 w-64'
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 電腦清單顯示 */}
//       <ComputerList searchTerm={searchTerm} onComputerSelect={handleComputerSelect} />
//     </div>
//   );
// };

// export default ServerContent;

import { useCallback, useEffect, useState } from 'react';
import { ComputerList } from './ComputerList';
import { ComputerDetail } from './ComputerDetail';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getNoinstall, postInstall, type Uuid } from '@/api/openapi-client';

interface Computer {
  id: string;
  name: string;
}

const ServerContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [selectedComputersForInstall, setSelectedComputersForInstall] = useState<string[]>([]);
  const [computers, setComputers] = useState<Computer[]>([]);
  const [selectedComputerId, setSelectedComputerId] = useState<string | null>(null);

  // ✅ 額外加一個 key，讓 ComputerList 在 key 改變時重掛載
  const [listReloadKey, setListReloadKey] = useState(0);

  const [installComputer] = useState<Uuid[]>([
    { Status: true, Hostname: 'ServerA', Ip: '192.168.0.10' },
    { Status: true, Hostname: 'ServerB', Ip: '192.168.0.11' },
    { Status: false, Hostname: 'ServerC', Ip: '192.168.0.12' },
  ]);

  /** 取得未安裝電腦資料（給 Install Dialog 用） */
  const getOnlineComputers = useCallback(async () => {
    try {
      const { data } = await getNoinstall({ query: { Server: 'apache' } });

      if (!data || !data.Pcs || Object.keys(data.Pcs).length === 0) {
        console.warn('API 回傳空資料，改用測試資料');
        setComputers(
          installComputer.map((pc, idx) => ({
            id: `mock-${idx}`,
            name: pc.Hostname,
          })),
        );
        return;
      }

      let noinstalled: Record<string, string> = {};
      if ('NotInstalled' in data.Pcs) {
        noinstalled = data.Pcs.NotInstalled;
      } else if ('Installed' in data.Pcs) {
        noinstalled = {};
      }

      const pcsArray: Computer[] = Object.entries(noinstalled).map(([uuid, hostname]) => ({
        id: uuid,
        name: hostname || uuid,
      }));
      setComputers(pcsArray);
    } catch {
      toast.error('Error', { description: 'Failed to fetch computer list, using test data.' });
      setComputers(
        installComputer.map((pc, idx) => ({
          id: `mock-${idx}`,
          name: pc.Hostname,
        })),
      );
    }
  }, [installComputer]);

  useEffect(() => {
    getOnlineComputers();
  }, [getOnlineComputers]);

  /** 切換主機勾選 */
  const handleComputerToggle = (computerId: string) => {
    setSelectedComputersForInstall((prev) =>
      prev.includes(computerId) ? prev.filter((id) => id !== computerId) : [...prev, computerId],
    );
  };

  /** 點擊主機卡片時：顯示詳細資訊畫面 */
  const handleComputerSelect = (computerId: string) => {
    setSelectedComputerId(computerId);
  };

  /** 從詳細資訊返回清單，同時讓清單重新載 */
  const handleBackToList = () => {
    setSelectedComputerId(null);
    setListReloadKey((k) => k + 1); // ✅ 回到列表時讓 ComputerList 重載
  };

  /** 安裝流程 */
  const handleInstallServer = async () => {
    if (selectedComputersForInstall.length === 0) {
      toast.error('Error', { description: 'Please select at least one computer to install.' });
      return;
    }

    setIsInstalling(true);
    console.log('安裝中電腦:', selectedComputersForInstall);

    try {
      const { data } = await postInstall({
        body: { Server: 'apache', Uuids: selectedComputersForInstall },
      });

      if (!data || data.Type !== 'Ok') {
        throw new Error('Installation API returned an error');
      }

      toast.success('Success', {
        description: `已成功在 ${selectedComputersForInstall.length} 台電腦安裝 Apache。`,
      });

      // ✅ 關閉 dialog & 清空勾選
      setInstallDialogOpen(false);
      setSelectedComputersForInstall([]);

      // ✅ 重新抓「未安裝」清單，安裝過的就會消失
      await getOnlineComputers();

      // ✅ 讓 ComputerList 重掛載，觸發裡面的 useEffect 再抓一次已安裝清單
      setListReloadKey((k) => k + 1);
    } catch {
      toast.error('Error', { description: 'Installation failed, please try again later.' });
    } finally {
      setIsInstalling(false);
    }
  };

  /** 若有選取主機，顯示詳細資訊畫面 */
  if (selectedComputerId) {
    return <ComputerDetail computerId={selectedComputerId} onBack={handleBackToList} />;
  }

  /** 主畫面（清單 + 搜尋 + 安裝 Dialog） */
  return (
    <div>
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <div></div>
          <div className='flex items-center gap-2'>
            <Dialog open={installDialogOpen} onOpenChange={setInstallDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  style={{ backgroundColor: '#7B86AA' }}
                  className='hover:opacity-80 text-white'
                >
                  <Download className='w-4 h-4 mr-2' />
                  Install
                </Button>
              </DialogTrigger>

              <DialogContent className='max-w-md'>
                <DialogHeader>
                  <DialogTitle>Install Apache</DialogTitle>
                </DialogHeader>

                <div className='space-y-4'>
                  <p className='text-sm text-slate-600'>Select computers to install Apache on:</p>

                  <div className='space-y-2 max-h-60 overflow-y-auto'>
                    {computers
                      .filter((computer) =>
                        computer.name.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((computer) => (
                        <div
                          key={computer.id}
                          className='flex items-center space-x-2 p-2 border rounded'
                        >
                          <Checkbox
                            id={computer.id}
                            checked={selectedComputersForInstall.includes(computer.id)}
                            onCheckedChange={() => handleComputerToggle(computer.id)}
                          />
                          <label htmlFor={computer.id} className='flex-1 cursor-pointer'>
                            <div className='flex items-center justify-between'>
                              <span className='font-medium'>{computer.name}</span>
                            </div>
                          </label>
                        </div>
                      ))}
                  </div>

                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='outline'
                      onClick={() => setInstallDialogOpen(false)}
                      disabled={isInstalling}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleInstallServer}
                      disabled={isInstalling || selectedComputersForInstall.length === 0}
                      style={{ backgroundColor: '#7B86AA' }}
                      className='hover:opacity-80 text-white'
                    >
                      {isInstalling ? (
                        <>
                          <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                          Installing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className='w-4 h-4 mr-2' />
                          Confirm Install
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* 搜尋欄 */}
            <div className='relative'>
              <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400' />
              <Input
                placeholder='Search computers...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 w-64'
              />
            </div>
          </div>
        </div>
      </div>

      {/* 電腦清單顯示 */}
      <ComputerList
        key={listReloadKey}
        searchTerm={searchTerm}
        onComputerSelect={handleComputerSelect}
      />
    </div>
  );
};

export default ServerContent;
