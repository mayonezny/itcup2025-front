import { RuleTable } from '@/components/RuleTable/ui';
import { TransactionsTable } from '@/components/TransactionTable/ui';
import './HomePage.scss';

export const HomePage = () => (
  <main className="main-block">
    <RuleTable />
    <TransactionsTable />
  </main>
);
