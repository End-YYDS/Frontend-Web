import type { PageComponent } from '@/types';
import ServerContent from './Content';
const Dhcp: PageComponent = () => {
  return (
    <div className='container mx-auto py-8 px-6'>
      <div className='bg-[#A8AEBD] py-1.5 mb-6'>
        <h1 className='text-4xl font-extrabold text-center text-[#E6E6E6]'>DHCP Server</h1>
      </div>
      <ServerContent />
    </div>
  );
};
Dhcp.meta = {
  requiresAuth: true,
  layout: true,
  disable: true,
};
export default Dhcp;
