// TODO: 完成 Sidebar
import { useState } from "react";
import { ServerContent } from './Content';

export const meta = { requiresAuth: false };

const index = () => {
  const [selectedComputer, setSelectedComputer] = useState<string | null>(null);
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="text-center mb-8">
          <h1 
          className="text-4xl font-bold mb-2" 
          style={{ color: '#E6E6E6', backgroundColor: '#A8AEBD' }}
          >
            Apache Webserver
          </h1>
      </div>
      <ServerContent 
        selectedServer={null} // Replace with actual server ID after finish Sidebar
        selectedComputer={selectedComputer}
        onComputerSelect={setSelectedComputer}
        />
    </div>
  );
};

export default index