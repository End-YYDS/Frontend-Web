import { type PageComponent } from '../types';
const Unauthorized: PageComponent = () => {
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
        <h1 className='text-5xl font-bold text-gray-800 mb-4'>403</h1>
        <p className='text-lg text-gray-600 mb-6'>抱歉，您没有權限訪問此頁面。</p>
        <button
          onClick={() => window.history.back()}
          className='px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition'
        >
          返回上一頁
        </button>
      </div>
    </div>
  );
};
Unauthorized.meta = {
  requiresAuth: false,
  layout: false,
};
export default Unauthorized;
