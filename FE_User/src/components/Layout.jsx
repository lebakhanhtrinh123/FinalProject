import React from 'react';
import Header from './Header';
import ChatBox from './ChatBox'

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-10 md:pt-14">
        {children}
      </main>
      <ChatBox/>
    </div>
  );
};

export default Layout;