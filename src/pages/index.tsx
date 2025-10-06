import { type PageMeta } from '../types';
function Home() {
  return <div>Home</div>;
}
(Home as any).meta = {
  requiresAuth: false, //驗證
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;
export default Home;
// import { useEffect, useState } from 'react';
// import { TooltipProvider } from '@/components/ui/tooltip';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { Toaster } from '@/components/toaster';
// import Login from '@/pages/login';

// const queryClient = new QueryClient();

// export function AuthGate({ children }: { children: React.ReactNode }) {
//   const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
//   const [loading, setLoading] = useState(true);

// useEffect(() => {
//   (async () => {
//     try {
//       const localStatus = localStorage.getItem('isLoggedIn');
//       if (localStatus === 'true') {
//         const res = await fetch('/api/me', { credentials: 'include' });
//         if (res.ok) {
//           setIsLoggedIn(true);
//         } else {
//           setIsLoggedIn(false);
//           localStorage.removeItem('isLoggedIn');
//         }
//       }
//     } catch (e) {
//       console.error('檢查登入狀態失敗:', e);
//       setIsLoggedIn(false);
//     } finally {
//       setLoading(false);
//     }
//   })();
// }, []);

//   if (loading) {
//     return (
//       <div className='min-h-screen flex items-center justify-center text-lg'>
//         正在檢查登入狀態...
//       </div>
//     );
//   }

//   if (!isLoggedIn) {
//     return (
//       <QueryClientProvider client={queryClient}>
//         <TooltipProvider>
//           <Login
//             onSuccess={() => {
//               setIsLoggedIn(true);
//               localStorage.setItem('isLoggedIn', 'true');
//             }}
//           />
//           <Toaster />
//         </TooltipProvider>
//       </QueryClientProvider>
//     );
//   }

//   return (
//     <QueryClientProvider client={queryClient}>
//       <TooltipProvider>
//         {children}
//         <Toaster />
//       </TooltipProvider>
//     </QueryClientProvider>
//   );
// }
