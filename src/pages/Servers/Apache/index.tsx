import type { PageMeta } from '@/types';
import ServerContent from './Content';
const Apache = () => {
  return (
    <div className='max-w-4xl mx-auto py-8 px-6'>
      <div className='bg-[#A8AEBD] py-1.5 mb-6'>
        <h1 className='text-4xl font-extrabold text-center text-[#E6E6E6]'>Apache Webserver</h1>
      </div>
      <ServerContent />
    </div>
  );
};
(Apache as any).meta = {
  requiresAuth: false, 
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;
export default Apache;
