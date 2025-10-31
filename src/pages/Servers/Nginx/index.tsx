import type { PageMeta } from '@/types';
import ServerContent from './Content';
const Nginx = () => {
  return (
    <div className='container mx-auto py-8 px-6'>
      <div className='bg-[#A8AEBD] py-1.5 mb-6'>
        <h1 className='text-4xl font-extrabold text-center text-[#E6E6E6]'>Nginx</h1>
      </div>
      <ServerContent />
    </div>
  );
};
(Nginx as any).meta = {
  requiresAuth: true, //驗證
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;
export default Nginx;