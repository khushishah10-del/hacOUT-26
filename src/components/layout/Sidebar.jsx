import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Factory,
  PieChart,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Leaf,
  X
} from 'lucide-react';
import { FACTORY_INFO } from '../../data/mockData';

export default function Sidebar({ mobileOpen = false, onClose = () => {} }) {
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

  // Resolve active facility name dynamically
  const activeFactoryName = (() => {
    try {
      const savedResults = localStorage.getItem('ecoloop_emission_results');
      if (savedResults) {
        const parsed = JSON.parse(savedResults);
        if (parsed.factoryName) return parsed.factoryName;
      }
      const savedFactory = localStorage.getItem('ecoloop_factory_data');
      if (savedFactory) {
        const parsed = JSON.parse(savedFactory);
        if (parsed.factoryName) return parsed.factoryName;
      }
    } catch (e) {
      // Fallback
    }
    return FACTORY_INFO.name;
  })();

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
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

          <button
            type="button"
            className="close-mobile-nav-btn"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Core Modules</div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
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
              <span className="facility-status-title" title={activeFactoryName}>
                {activeFactoryName}
              </span>
              <span className="facility-status-sub">{FACTORY_INFO.facilityId} • {FACTORY_INFO.status}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

