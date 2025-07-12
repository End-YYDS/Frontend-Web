import { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Cog, Shield, AlertTriangle, Save } from 'lucide-react';
// import { useIsMobile } from "@/hooks/use-mobile";
import AlertsTab from "./AlertsTab";
import IpAccessTab from "./IpAccessTab";
import ModuleManagementTab from "./ModuleManagementTab";
import BackupConfigTab from "./BackupConfigTab";

const SettingsPage = () => {
  // const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("modules");

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="bg-[#A8AEBD] py-3 mb-3">
        <h1 className="text-2xl font-extrabold text-center text-[#E6E6E6]">
          Settings
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full bg-[#F7F8FA] border-b rounded-b-lg">
          <TabsTrigger value="modules" className="flex items-center font-bold gap-2 data-[state=active]:bg-[#A8AEBD] data-[state=active]:text-white text-gray-700">
            <Cog className="h-4 w-4" />
            <span>模組管理</span>
          </TabsTrigger>
          <TabsTrigger value="ip-access" className="flex items-center font-bold gap-2 data-[state=active]:bg-[#A8AEBD] data-[state=active]:text-white text-gray-700">
            <Shield className="h-4 w-4" />
            <span>IP存取控制</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center font-bold gap-2 data-[state=active]:bg-[#A8AEBD] data-[state=active]:text-white text-gray-700">
            <AlertTriangle className="h-4 w-4" />
            <span>警告設定</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center font-bold gap-2 data-[state=active]:bg-[#A8AEBD] data-[state=active]:text-white text-gray-700">
            <Save className="h-4 w-4" />
            <span>備份配置</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          <ModuleManagementTab />
        </TabsContent>

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

export default SettingsPage;