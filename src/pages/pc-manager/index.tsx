import type { PageMeta } from '@/types';
import { PCManagerContent } from './Content';

const Pc_manager = () => <PCManagerContent />;
(Pc_manager as any).meta = {
  requiresAuth: true, //驗證
  layout: true,
  // allowedRoles: ['admin']
} satisfies PageMeta;
export default Pc_manager;
