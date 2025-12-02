import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { type PageComponent } from '../types';

const NotFound: PageComponent = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 p-4'>
      <div
        className='
          w-full
          max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl
          bg-white rounded-2xl shadow-2xl
          p-10
          text-center
          transition-all duration-300
        '
      >
        <h1 className='text-5xl font-bold text-gray-800 mb-4'>404</h1>
        <p className='text-xl text-gray-600 mb-4'>哇! 頁面不存在</p>
        <a href='/' className='text-blue-500 hover:text-blue-700 underline'>
          返回首頁
        </a>
      </div>
    </div>
  );
};

NotFound.meta = {
  requiresAuth: false,
  layout: false,
};
export default NotFound;
