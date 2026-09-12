import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { EMISSION_HOTSPOT } from '../../data/mockData';

export default function HotspotCard() {
  const navigate = useNavigate();

  return (
    <div className="card hotspot-card">
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="hotspot-header">
            <AlertCircle size={18} />
            <span>🔴 Primary Emission Hotspot</span>
          </div>

          <div className="hotspot-source-title">
            {EMISSION_HOTSPOT?.category || 'Electricity'}
          </div>

          <div className="hotspot-stat">
            {EMISSION_HOTSPOT?.percentage || 48}% of total estimated emissions ({EMISSION_HOTSPOT?.tons || 599} tons CO2)
          </div>

          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.4 }}>
            Leak Point Detected: {EMISSION_HOTSPOT?.leakPoint || 'Primary curing and compression lines'}. High potential for immediate solar and heat recovery offset.
          </p>
        </div>

        <div>
          <button
            className="btn btn-outline"
            style={{ borderColor: '#fca5a5', color: '#b91c1c' }}
            onClick={() => navigate('/emission-analysis')}
          >
            <span>Analyze Factory Data</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
