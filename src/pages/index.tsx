import { type PageMeta } from '../types';
import { DashboardContent } from './dashboard/Content';
function Home() {
  return <DashboardContent />;
}
(Home as any).meta = {
  requiresAuth: true, //驗證
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;
export default Home;
