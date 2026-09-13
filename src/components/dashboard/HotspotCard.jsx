import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { EMISSION_HOTSPOT } from '../../data/mockData';

export default function HotspotCard({ hotspotData }) {
  const navigate = useNavigate();

  // Read latest emission results from props or localStorage
  const activeHotspot = (() => {
    let raw = hotspotData;
    if (!raw || !raw.category || raw.category === 'No hotspot') {
      try {
        const saved = localStorage.getItem('ecoloop_emission_results');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.hotspot && parsed.hotspot.category && parsed.hotspot.category !== 'No hotspot') {
            raw = parsed.hotspot;
          }
        }
      } catch (e) {
        // Fallback to mock
      }
    }

    if (raw && raw.category && raw.category !== 'No hotspot') {
      const tons = raw.tons !== undefined
        ? raw.tons
        : (raw.value !== undefined ? Number((Number(raw.value) / 1000).toFixed(1)) : EMISSION_HOTSPOT.tons);
      const pct = (raw.percentage !== undefined && raw.percentage !== null && !isNaN(raw.percentage))
        ? raw.percentage
        : EMISSION_HOTSPOT.percentage;
      return {
        category: raw.category,
        percentage: pct,
        tons: tons,
        kg: raw.kg !== undefined ? raw.kg : Math.round(Number(raw.value) || 0),
        leakPoint: raw.leakPoint || `Primary operational equipment and intensity in ${raw.category.toLowerCase()}`
      };
    }
    return EMISSION_HOTSPOT;
  })();

  const displayPct = activeHotspot?.percentage !== undefined && activeHotspot?.percentage !== null && !isNaN(activeHotspot.percentage)
    ? activeHotspot.percentage
    : 0;
  const displayTons = activeHotspot?.tons !== undefined && activeHotspot?.tons !== null && !isNaN(activeHotspot.tons)
    ? activeHotspot.tons
    : 0;

  return (
    <div className="card hotspot-card">
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="hotspot-header">
            <AlertCircle size={18} />
            <span>🔴 Primary Emission Hotspot</span>
          </div>

          <div className="hotspot-source-title">
            {activeHotspot?.category || 'Electricity'}
          </div>

          <div className="hotspot-stat">
            {displayPct}% of total estimated emissions ({displayTons} tons CO2)
          </div>

          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.4 }}>
            Leak Point Detected: {activeHotspot?.leakPoint || 'Primary curing and compression lines'}. High potential for immediate emission reduction.
          </p>
        </div>


        <div>
          <button
            className="btn btn-outline"
            style={{ borderColor: '#fca5a5', color: '#b91c1c' }}
            onClick={() => navigate('/emission-analysis')}
          >
            <span>View Emission Analysis</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
