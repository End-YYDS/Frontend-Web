import { type PageComponent } from '../types';
import { DashboardContent } from './dashboard/Content';
const Home: PageComponent = () => <DashboardContent />;
Home.meta = {
  requiresAuth: true,
  layout: true,
};
export default Home;
