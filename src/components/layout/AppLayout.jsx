import React from 'react';
import { Header } from './index';

/**
 * AppLayout Component
 * Wraps authenticated pages with Header
 * Use this to avoid adding Header manually to every page
 */
const AppLayout = ({ children, showHeader = true }) => {
  return (
    <>
      {showHeader && <Header />}
      {children}
    </>
  );
};

export default AppLayout;
