import React from 'react';
import { Outlet } from 'react-router-dom';

import { Header } from '@/components/Header';
import './wrapper.scss';

export const Wrapper: React.FC = () => (
  <div className="wrapper">
    <Header />
    <Outlet />
  </div>
);
