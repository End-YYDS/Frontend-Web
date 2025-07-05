import { Button } from '@/components/ui/button';
import Test from './Test';
export const meta = { requiresAuth: false };
const index = () => {
  return (
    <div>
      <Test></Test>
      <Button></Button>
    </div>
  );
};

export default index;
