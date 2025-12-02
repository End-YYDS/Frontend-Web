import type { PageComponent } from '@/types';
import { DashboardContent } from './Content';
const Dashboard: PageComponent = () => <DashboardContent />;
Dashboard.meta = {
  requiresAuth: true,
  layout: true,
};
export default Dashboard;
