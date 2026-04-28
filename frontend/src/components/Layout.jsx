import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import StarBackground from './StarBackground';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-transparent text-slate-200">
      <StarBackground />
      <Navbar />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
