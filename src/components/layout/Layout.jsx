import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <div className="main-wrapper">
        <Header
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

