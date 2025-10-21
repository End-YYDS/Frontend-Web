import type { PageMeta } from '@/types';
import { FirewallManager } from './Content';
const Firewall = () => {
  return (
    <div className='max-w-4xl mx-auto py-8 px-6'>
      <div className='bg-[#A8AEBD] py-1.5 mb-6'>
        <h1 className='text-4xl font-extrabold text-center text-[#E6E6E6]'>Firewall</h1>
      </div>
      <FirewallManager />
    </div>
  );
};
(Firewall as any).meta = {
  requiresAuth: false, //驗證
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;
export default Firewall;
