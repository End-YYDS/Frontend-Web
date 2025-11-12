import { type PageMeta } from '../types';
import { DashboardContent } from './dashboard/Content';
function Dashboard() {
  return <DashboardContent />;
}
(Dashboard as any).meta = {
  requiresAuth: true, //驗證
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;
export default Dashboard;