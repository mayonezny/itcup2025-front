import { useState } from 'react';
import './HomePage.scss';

export const HomePage = () => {
  const [count, setCount] = useState(0);
  console.log('ivan');
  return (
    <main className="main-block">
      <p>Здарова</p>
    </main>
  );
};
