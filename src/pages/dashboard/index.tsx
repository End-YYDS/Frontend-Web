import { DashboardContent } from './Content';

export const meta = { requiresAuth: false };

const index = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="text-center mb-8">
          <h1 
          className="text-4xl font-bold mb-2" 
          style={{ color: '#E6E6E6', backgroundColor: '#A8AEBD' }}
          >
              Dashboard
          </h1>
      </div>
      <DashboardContent />
    </div>
  );
}

export default index
