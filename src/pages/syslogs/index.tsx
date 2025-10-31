import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemLogsManager } from './SystemLogsManager';
import { HostLogsManager } from './HostLogsManager';
import type { PageMeta } from '@/types';
const Syslogs = () => {
  return (
    <div className='container mx-auto py-6 px-4'>
      <div className='bg-[#A8AEBD] py-1.5 mb-6'>
        <h1 className='text-4xl font-extrabold text-center text-[#E6E6E6]'>System & Host Logs</h1>
      </div>
      <Tabs defaultValue="system" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="system">System Logs</TabsTrigger>
              <TabsTrigger value="host">Host Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="system" className="space-y-4">
              <SystemLogsManager />
            </TabsContent>
            
            <TabsContent value="host" className="space-y-4">
              <HostLogsManager />
            </TabsContent>
        </Tabs>
    </div>
  );
};
(Syslogs as any).meta = {
  requiresAuth: false, //驗證
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;
export default Syslogs;