import { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Shield, AlertTriangle, Save } from 'lucide-react';
// import { useIsMobile } from "@/hooks/use-mobile";
import AlertsTab from "./AlertsTab";
import IpAccessTab from "./IpAccessTab";
// import ModuleManagementTab from "./ModuleManagementTab";
import BackupConfigTab from "./BackupConfigTab";
import type { PageMeta } from '@/types';

const SettingsPage = () => {
  // const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("ip-access");

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="bg-[#A8AEBD] py-1.5 mb-6">
        <h1 className="text-4xl font-extrabold text-center text-[#E6E6E6]">
              Settings
        </h1>
      </div>  

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="ip-access">
            <Shield className="h-4 w-4" />
            <span>IP Access Control</span>
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="h-4 w-4" />
            <span>Alert Settings</span>
          </TabsTrigger>
          <TabsTrigger value="backup">
            <Save className="h-4 w-4" />
            <span>Backup Configuration</span>
          </TabsTrigger>
        </TabsList>

        {/* <TabsContent value="modules" className="space-y-4">
          <ModuleManagementTab />
        </TabsContent> */}

        <TabsContent value="ip-access" className="space-y-4">
          <IpAccessTab />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertsTab />
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <BackupConfigTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

(SettingsPage as any).meta = {
  requiresAuth: false, //驗證
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;

export default SettingsPage;