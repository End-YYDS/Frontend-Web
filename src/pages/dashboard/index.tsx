import { DashboardContent } from './Content';

export const meta = { requiresAuth: false };

const index = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <DashboardContent />
    </div>
  );
}

export default index
