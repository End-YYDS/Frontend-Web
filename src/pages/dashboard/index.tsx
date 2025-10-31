import type { PageMeta } from '@/types';
import { DashboardContent } from './Content';


const Dashboard = () => {
  return (
    <div className='container mx-auto'>
      <DashboardContent />
    </div>
  );
};

(Dashboard as any).meta = {
  requiresAuth: false, //驗證
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;
export default Dashboard;