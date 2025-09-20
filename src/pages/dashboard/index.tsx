import { Button } from '@/components/ui/button';
import { type PageMeta } from '@/types';
import Test from './Test';
export const meta: PageMeta = { requiresAuth: true, layout: false };
const index = () => {
  return (
    <div>
      <Test></Test>
      <Button></Button>
    </div>
  );
};

export default index;
