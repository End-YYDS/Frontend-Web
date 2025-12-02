import type { PageComponent } from '@/types';
import { PCManagerContent } from './Content';

const Pc_manager: PageComponent = () => <PCManagerContent />;
Pc_manager.meta = {
  requiresAuth: true,
  layout: true,
};
export default Pc_manager;
