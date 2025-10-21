import type { PageMeta } from '@/types';
import { BackupContent } from './Content';

const Backup = () => {
  return (
    <div className='min-h-screen bg-gray-50 flex'>
      <div className='flex-1'>
        <BackupContent />
      </div>
    </div>
  );
};

(Backup as any).meta = {
  requiresAuth: false, //驗證
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;
export default Backup;
