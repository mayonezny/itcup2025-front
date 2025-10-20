import { useState } from 'react';

import { rules } from '@/components/RuleTable/mocks';
import { RuleTable } from '@/components/RuleTable/ui';
import './HomePage.scss';

export const HomePage = () => {
  const [count, setCount] = useState(0);
  console.log('ivan');
  return (
    <main className="main-block">
      <RuleTable rows={rules} />
    </main>
  );
};
