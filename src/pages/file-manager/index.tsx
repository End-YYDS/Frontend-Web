import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileBrowser } from './FileBrowser';
import { VirtualDirectoryManager } from './VirtualDirectoryManager';
import type { PageComponent } from '@/types';
const File_manager: PageComponent = () => {
  const [activeTab, setActiveTab] = useState('physical');

  return (
    <div className='container mx-auto py-6 px-4'>
      <div className='bg-[#A8AEBD] py-1.5 mb-6'>
        <h1 className='text-4xl font-extrabold text-center text-[#E6E6E6]'>File Manager</h1>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='physical'>Physical Hosts</TabsTrigger>
          <TabsTrigger value='virtual'>Virtual Machines</TabsTrigger>
        </TabsList>
        <TabsContent value='physical' className='space-y-4'>
          <FileBrowser />
        </TabsContent>

        <TabsContent value='virtual' className='space-y-4'>
          <VirtualDirectoryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

File_manager.meta = {
  requiresAuth: true,
  layout: true,
  disable: true,
};
export default File_manager;
