import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileBrowser } from './FileBrowser';
import { VirtualDirectoryManager } from './VirtualDirectoryManager';

export const meta = { requiresAuth: false };

const index = () => {
  const [activeTab, setActiveTab] = useState('physical');

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="text-center mb-8">
            <h1 
            className="text-4xl font-bold mb-2" 
            style={{ color: '#E6E6E6', backgroundColor: '#A8AEBD' }}
            >
                File Manager
            </h1>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="physical">實體主機</TabsTrigger>
                <TabsTrigger value="virtual">虛擬目錄</TabsTrigger>
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
