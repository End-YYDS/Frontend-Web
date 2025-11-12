import type { PageMeta } from '@/types';
import { ProcessManager } from './Content';


const Process_manager = () => {
  return (
    <div className='container mx-auto py-6 px-4'>
      <div className='bg-[#A8AEBD] py-1.5 mb-6'>
        <h1 className='text-4xl font-extrabold text-center text-[#E6E6E6]'>Process Manager</h1>
      </div>
      <ProcessManager />
    </div>
  );
};
(Process_manager as any).meta = {
  requiresAuth: true, //驗證
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;
export default Process_manager;
