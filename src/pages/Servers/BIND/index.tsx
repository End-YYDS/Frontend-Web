import ServerContent from './Content';

export const meta = { requiresAuth: false };

const index = () => {
  return (
    <div className='max-w-4xl mx-auto py-8 px-6'>
      <div className='bg-[#A8AEBD] py-1.5 mb-6'>
        <h1 className='text-4xl font-extrabold text-center text-[#E6E6E6]'>BIND DNS Server</h1>
      </div>
      <ServerContent />
    </div>
  );
};

export default index;