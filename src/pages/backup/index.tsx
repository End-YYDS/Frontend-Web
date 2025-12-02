import type { PageComponent } from '@/types';
import { BackupContent } from './Content';

const Backup: PageComponent = () => <BackupContent />;

Backup.meta = {
  requiresAuth: true,
  layout: true,
};
export default Backup;
