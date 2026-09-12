import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Factory,
  PieChart,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Leaf
} from 'lucide-react';
import { FACTORY_INFO } from '../../data/mockData';

export default function Sidebar() {
  const navLinks = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      to: '/factory-data',
      label: 'Factory Data',
      icon: Factory
    },
    {
      to: '/emission-analysis',
      label: 'Emission Analysis',
      icon: PieChart
    },
    {
      to: '/recommendations',
      label: 'Recommendations',
      icon: Sparkles
    },
    {
      to: '/circular-alternatives',
      label: 'Circular Alternatives',
      icon: RefreshCw
    },
    {
      to: '/what-if',
      label: 'What-If Simulator',
      icon: SlidersHorizontal
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon-wrapper">
          <Leaf size={22} />
        </div>
        <div className="logo-text-wrapper">
          <div className="logo-title">
            EcoLoop
          </div>
          <span className="logo-tag">Industrial Circularity</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Core Modules</div>
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="facility-status-card">
          <span className="status-dot" />
          <div className="facility-status-info">
            <span className="facility-status-title">{FACTORY_INFO.name}</span>
            <span className="facility-status-sub">{FACTORY_INFO.facilityId} • {FACTORY_INFO.status}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
