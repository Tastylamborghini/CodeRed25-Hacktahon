import React from 'react';
import { Home, Layout, HelpCircle } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Layout size={24} />
        <h1>Home Layout Optimizer</h1>
      </div>
      
      <div className="navbar-menu">
        <a href="/" className="navbar-link active">
          <Home size={16} />
          Builder
        </a>
        <a href="/help" className="navbar-link">
          <HelpCircle size={16} />
          Help
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
