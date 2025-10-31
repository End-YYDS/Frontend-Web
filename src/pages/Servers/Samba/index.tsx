import type { PageMeta } from '@/types';
import ServerContent from './Content';
const Samba = () => {
  return (
    <div className='container mx-auto py-8 px-6'>
      <div className='bg-[#A8AEBD] py-1.5 mb-6'>
        <h1 className='text-4xl font-extrabold text-center text-[#E6E6E6]'>Samba Windows File Sharing</h1>
      </div>
      <ServerContent />
    </div>
  );
};
(Samba as any).meta = {
  requiresAuth: false, //驗證
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;
export default Samba;