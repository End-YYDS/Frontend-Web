import type { PageComponent } from '@/types';
import ServerContent from './Content';
const Ssh: PageComponent = () => {
  return (
    <div className='container mx-auto py-8 px-6'>
      <div className='bg-[#A8AEBD] py-1.5 mb-6'>
        <h1 className='text-4xl font-extrabold text-center text-[#E6E6E6]'>SSH Server</h1>
      </div>
      <ServerContent />
    </div>
  );
};
Ssh.meta = {
  requiresAuth: true,
  layout: true,
};
export default Ssh;
