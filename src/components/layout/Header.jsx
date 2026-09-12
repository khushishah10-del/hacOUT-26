import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Building2, User } from 'lucide-react';
import { FACTORY_INFO } from '../../data/mockData';

const PAGE_TITLES = {
  '/dashboard': {
    title: 'Sustainability Dashboard',
    subtitle: 'Real-time industrial emission monitoring & circular benchmarks'
  },
  '/factory-data': {
    title: 'Factory Data Input',
    subtitle: 'Log monthly energy, fuel, raw materials, waste, and output'
  },
  '/emission-analysis': {
    title: 'Emission Leak-Point Analysis',
    subtitle: 'Categorized Scope 1, 2, & 3 breakdown with hotspot detection'
  },
  '/recommendations': {
    title: 'AI Decarbonization Recommendations',
    subtitle: 'Ranked actionable interventions with estimated CO2 & cost impact'
  },
  '/circular-alternatives': {
    title: 'Circular Economy Alternatives',
    subtitle: 'Material substitution, closed-loop packaging, and waste upcycling'
  },
  '/what-if': {
    title: 'What-If Decarbonization Simulator',
    subtitle: 'Model potential emission reductions with interactive scenario sliders'
  }
};

export default function Header() {
  const location = useLocation();
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  const currentMeta = PAGE_TITLES[location.pathname] || {
    title: 'EcoLoop Industrial Platform',
    subtitle: 'Manufacturing Sustainability Management'
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <h1 className="header-title">{currentMeta.title}</h1>
        <p className="header-subtitle">{currentMeta.subtitle}</p>
      </div>

      <div className="header-right">
        {/* Factory name badge */}
        <div className="factory-badge" title={`Facility ID: ${FACTORY_INFO.facilityId}`}>
          <Building2 size={16} />
          <span>{FACTORY_INFO.name}</span>
        </div>

        {/* Notification Icon */}
        <div style={{ position: 'relative' }}>
          <button
            className="notification-btn"
            title="System Notifications"
            onClick={() => setShowNotificationToast(!showNotificationToast)}
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="notification-badge-dot" />
          </button>

          {showNotificationToast && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '320px',
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '1rem',
                zIndex: 100
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>System Alerts</span>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>1 New</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                🔴 <strong>Hotspot Notice:</strong> Electricity consumption in Curing Bay exceeded target by 4.2% this cycle.
              </p>
            </div>
          )}
        </div>

        {/* User Profile Area */}
        <div className="user-profile-area">
          <div className="user-avatar" title="Plant Environmental Officer">
            <User size={18} />
          </div>
          <div className="user-details">
            <span className="user-name">Alex Miller</span>
            <span className="user-role">Plant Sustainability Lead</span>
          </div>
        </div>
      </div>
    </header>
  );
}
