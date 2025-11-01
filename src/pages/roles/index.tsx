import type { PageMeta } from '@/types';
import { RolesContent } from './Content';

const Roles = () => {
  return (
    <div className='container mx-auto py-6 px-4'>
      <div className='bg-[#A8AEBD] py-1.5 mb-6'>
        <h1 className='text-4xl font-extrabold text-center text-[#E6E6E6]'>Role</h1>
      </div>
      <RolesContent />
    </div>
  );
};

(Roles as any).meta = {
  requiresAuth: true, //驗證
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;
export default Roles;
