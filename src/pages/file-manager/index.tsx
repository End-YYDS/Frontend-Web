import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileBrowser } from './FileBrowser';
import { VirtualDirectoryManager } from './VirtualDirectoryManager';

export const meta = { requiresAuth: false };

const index = () => {
  const [activeTab, setActiveTab] = useState('physical');

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="bg-[#A8AEBD] py-1.5 mb-6">
          <h1 className="text-4xl font-extrabold text-center text-[#E6E6E6]">
            File Manager
          </h1>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="physical">Physical Hosts</TabsTrigger>
                <TabsTrigger value="virtual">Virtual Machines</TabsTrigger>
            </TabsList>
            <TabsContent value="physical" className="space-y-4">
                <FileBrowser />
            </TabsContent>
        
            <TabsContent value="virtual" className="space-y-4">
                <VirtualDirectoryManager />
            </TabsContent>
        </Tabs>
    </div>
  );
};

export default index
