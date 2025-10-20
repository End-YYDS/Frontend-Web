import { BackupContent } from './Content';
import { Toaster } from "sonner"

export const meta = { requiresAuth: false };

const index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1">
        <BackupContent />
        <Toaster position="top-right" richColors theme="light" />
      </div>
    </div>
  );
}

export default index
