import { type PageMeta } from './types';
export const meta: PageMeta = { requiresAuth: false, layout: false };
export default function Unauthorized() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4'>
      <h1 className='text-5xl font-bold text-gray-800 mb-4'>403</h1>
      <p className='text-lg text-gray-600 mb-6'>抱歉，您没有權限訪問此頁面。</p>
      <button
        onClick={() => window.history.back()}
        className='px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition'
      >
        返回上一頁
      </button>
    </div>
  );
}
