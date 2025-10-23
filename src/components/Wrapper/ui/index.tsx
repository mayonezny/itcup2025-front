import React from 'react';
import { Outlet } from 'react-router-dom';

import { Header } from '@/components/Header';
import './wrapper.scss';
import { SideBar } from '@/components/SideBar';

export const Wrapper: React.FC = () => (
  <div className="wrapper">
    <Header />
    
    <div className="wrapper__maincont">
      <SideBar />
      <Outlet />
    </div>
  </div>
);
