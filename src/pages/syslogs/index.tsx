import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemLogsManager } from './SystemLogsManager';
import { HostLogsManager } from './HostLogsManager';
export const meta = { requiresAuth: false };

const index = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="text-center mb-8">
          <h1 
          className="text-4xl font-bold mb-2" 
            style={{ color: '#E6E6E6', backgroundColor: '#A8AEBD' }}
          >
            System & Host Logs
          </h1>
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

export default index