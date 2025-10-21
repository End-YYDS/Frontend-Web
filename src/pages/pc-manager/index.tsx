import type { PageMeta } from '@/types';
import { PCManagerContent } from './Content';


const Pc_manager = () => {
  return (
    <div className='min-h-screen bg-gray-50 flex'>
      <div className='flex-1'>
        <PCManagerContent />
      </div>
    </div>
  );
};
(Pc_manager as any).meta = {
  requiresAuth: false, //驗證
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;
export default Pc_manager;
