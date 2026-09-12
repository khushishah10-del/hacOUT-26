import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Layers,
  Flame,
  Trash2,
  TrendingDown,
  Clock,
  DollarSign,
  CheckCircle2,
  X,
  ChevronRight,
  Factory,
  ArrowRight,
  ShieldAlert,
  Info,
  Lightbulb,
  Target,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import Badge from '../components/common/Badge';
import { calculateEmissions } from '../utils/emissionCalculator';
import { detectHotspot } from '../utils/hotspotDetector';
import { getRecommendation } from '../utils/recommendationEngine';

/**
 * Returns icon, color, and background matching the category
 */
const getCategoryIconInfo = (category) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('elect') || cat.includes('energy')) {
    return { icon: Zap, bg: '#fef3c7', color: '#d97706', border: '#fde68a' };
  }
  if (cat.includes('fuel')) {
    return { icon: Flame, bg: '#ffedd5', color: '#ea580c', border: '#fed7aa' };
  }
  if (cat.includes('material')) {
    return { icon: Layers, bg: '#ede9fe', color: '#7c3aed', border: '#ddd6fe' };
  }
  if (cat.includes('waste')) {
    return { icon: Trash2, bg: '#e0f2fe', color: '#0284c7', border: '#bae6fd' };
  }
  return { icon: Sparkles, bg: '#ecfdf5', color: '#10b981', border: '#a7f3d0' };
};

export default function Recommendations() {
  const navigate = useNavigate();
  const [activeModalRec, setActiveModalRec] = useState(null);

  // Load calculated emission results from localStorage (or recalculate from saved factory data)
  const [emissionData] = useState(() => {
    try {
      const savedResults = localStorage.getItem('ecoloop_emission_results');
      if (savedResults) return JSON.parse(savedResults);

      const savedFactory = localStorage.getItem('ecoloop_factory_data');
      if (savedFactory) {
        const parsed = JSON.parse(savedFactory);
        if (parsed.factoryName || parsed.electricityConsumption) {
          const calculated = calculateEmissions(parsed);
          localStorage.setItem('ecoloop_emission_results', JSON.stringify(calculated));
          return calculated;
        }
      }
      return null;
    } catch (err) {
      console.error('Error loading emission results:', err);
      return null;
    }
  });

  // Empty State: If no factory data exists yet
  if (!emissionData) {
    return (
      <div style={{ maxWidth: '640px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3.5rem 2rem', alignItems: 'center' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              marginBottom: '1.25rem'
            }}
          >
            <Factory size={34} />
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            No emission data available
          </h3>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '440px', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            Please submit factory data to generate recommendations.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/factory-data')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Sparkles size={16} />
            <span>Go to Factory Data</span>
          </button>
        </div>
      </div>
    );
  }

  // Detect dynamic hotspot
  const hotspot = detectHotspot(emissionData);
  const isZero = !hotspot || hotspot.isZero || Number(emissionData.totalCO2) <= 0;

  // Zero / Edge Case State: If emissions are 0
  if (isZero) {
    return (
      <div style={{ maxWidth: '640px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3.5rem 2rem', alignItems: 'center' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d97706',
              marginBottom: '1.25rem'
            }}
          >
            <AlertCircle size={34} />
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Insufficient emission data to identify a hotspot.
          </h3>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '460px', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            Reported factory emissions total 0 kg CO2e across all operational boundaries. Enter positive consumption values in the factory data form to detect emission leak-points and generate recommendations.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/factory-data')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Sparkles size={16} />
            <span>Go to Factory Data</span>
          </button>
        </div>
      </div>
    );
  }

  // Generate primary and supporting recommendations based on current hotspot
  const primaryRec = getRecommendation(emissionData, hotspot);
  if (!primaryRec) {
    return null;
  }

  const primaryIconInfo = getCategoryIconInfo(hotspot.category);
  const PrimaryIcon = primaryIconInfo.icon;
  const supportingRecs = primaryRec.supportingRecommendations || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Demo Factor Notice Banner */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          color: '#1e40af',
          fontSize: '0.86rem',
          fontWeight: 500,
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Info size={18} style={{ flexShrink: 0, color: '#3b82f6' }} />
          <span>Rule-based prototype: Estimated CO2 reductions are preliminary demo estimates for testing only.</span>
        </div>
        <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 600 }}>
          Phase 2 Mock Engine
        </span>
      </div>

      {/* Header */}
      <div className="page-intro" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="page-intro-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={24} style={{ color: 'var(--primary)' }} />
              <span>AI Recommendations</span>
            </h2>
            <p className="page-intro-desc">
              Recommended actions based on your factory's current emission hotspot.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/emission-analysis')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <BarChart3 size={15} />
              <span>View Emission Analysis</span>
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/factory-data')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Factory size={15} />
              <span>Update Factory Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hotspot Summary Banner / Card */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: primaryIconInfo.bg,
              color: primaryIconInfo.color,
              border: `1px solid ${primaryIconInfo.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <PrimaryIcon size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#15803d', fontWeight: 700 }}>
                Primary Hotspot Detected
              </span>
              <span
                style={{
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  border: '1px solid #86efac'
                }}
              >
                Rank #1 Contributor
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Current Hotspot: <span style={{ color: '#047857' }}>{hotspot.category}</span>
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              {hotspot.category} is the dominant greenhouse gas contributor for {emissionData.factoryName || 'the facility'}.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Hotspot Emissions
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {Number(hotspot.value).toLocaleString()}{' '}
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>kg CO2e</span>
            </div>
          </div>
          <div style={{ borderLeft: '1px solid #bbf7d0', height: '36px' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Contribution Share
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#047857' }}>
              {hotspot.percentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Primary Recommendation Card (Highlighted / Featured) */}
      <div className="rec-primary-card">
        <div>
          <div className="rec-card-top" style={{ marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                className="rec-icon"
                style={{
                  backgroundColor: primaryIconInfo.bg,
                  color: primaryIconInfo.color,
                  border: `1px solid ${primaryIconInfo.border}`
                }}
              >
                <PrimaryIcon size={24} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: 'var(--primary-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Sparkles size={14} />
                  Featured Recommendation
                </span>
                <h3 style={{ margin: '0.15rem 0 0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {primaryRec.title}
                </h3>
              </div>
            </div>

            <div className="rec-badges">
              <Badge variant={primaryRec.hotspot}>{primaryRec.hotspot}</Badge>
              <Badge variant={primaryRec.priority}>{primaryRec.priority} Priority</Badge>
            </div>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
            {primaryRec.recommendation}
          </p>

          {/* Why Matters + Recommended Action Grid */}
          <div className="rec-callout-grid">
            <div className="rec-callout-box" style={{ borderLeft: '3px solid #3b82f6' }}>
              <div className="rec-callout-title" style={{ color: '#2563eb' }}>
                <Info size={14} />
                <span>Why This Matters (Reason)</span>
              </div>
              <p className="rec-callout-content">
                {primaryRec.reason}
              </p>
            </div>

            <div className="rec-callout-box" style={{ borderLeft: '3px solid #10b981' }}>
              <div className="rec-callout-title" style={{ color: '#059669' }}>
                <Target size={14} />
                <span>Recommended Action</span>
              </div>
              <p className="rec-callout-content">
                {primaryRec.action}
              </p>
            </div>
          </div>
        </div>

        {/* Impact Summary & Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          <div
            className="rec-impact-box"
            style={{
              padding: '0.85rem 1.25rem',
              minWidth: '240px',
              backgroundColor: '#ecfdf5',
              borderColor: '#a7f3d0'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="impact-label" style={{ color: '#047857' }}>
                Estimated CO2 Reduction
              </span>
              <span className="impact-value" style={{ color: '#065f46', fontSize: '1.25rem' }}>
                {primaryRec.estimatedReductionDisplay}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#10b981' }}>
              <TrendingDown size={28} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() =>
                setActiveModalRec({
                  title: primaryRec.title,
                  category: primaryRec.hotspot,
                  priority: primaryRec.priority,
                  estimatedReduction: primaryRec.estimatedReductionDisplay,
                  reason: primaryRec.reason,
                  recommendation: primaryRec.recommendation,
                  action: primaryRec.action,
                  steps: [
                    primaryRec.action,
                    `Target a reduction of ${primaryRec.estimatedReductionPercentage}% in the next fiscal quarter.`,
                    'Review equipment energy efficiency and idle load logs.',
                    'Implement employee best practices for equipment shutdowns.',
                    'Evaluate circular raw materials and certified renewable tariffs.'
                  ]
                })
              }
            >
              <span>View Action Plan</span>
              <ChevronRight size={15} />
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/circular-alternatives')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>Explore Circular Alternatives</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Supporting Recommendations */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
            Secondary Decarbonization Opportunities
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            Continuous improvement actions across non-hotspot categories to maximize overall sustainability.
          </p>
        </div>

        <div className="recommendations-grid">
          {supportingRecs.map((rec) => {
            const iconInfo = getCategoryIconInfo(rec.category);
            const RecIcon = iconInfo.icon;

            return (
              <div key={rec.category} className="rec-card">
                <div>
                  <div className="rec-card-top">
                    <div
                      className="rec-icon"
                      style={{
                        backgroundColor: iconInfo.bg,
                        color: iconInfo.color,
                        border: `1px solid ${iconInfo.border}`
                      }}
                    >
                      <RecIcon size={22} />
                    </div>
                    <div className="rec-badges">
                      <Badge variant={rec.category}>{rec.category}</Badge>
                      <Badge variant={rec.priority}>{rec.priority} Priority</Badge>
                    </div>
                  </div>

                  <h3 className="rec-title">{rec.title}</h3>
                  <p className="rec-desc">{rec.description}</p>
                </div>

                <div>
                  <div className="rec-impact-box">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="impact-label">Est. CO2 Reduction</span>
                      <span className="impact-value">{rec.estimatedReduction}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#10b981' }}>
                      <TrendingDown size={22} />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline btn-full mt-3"
                    onClick={() =>
                      setActiveModalRec({
                        title: rec.title,
                        category: rec.category,
                        priority: rec.priority,
                        estimatedReduction: rec.estimatedReduction,
                        reason: `Secondary initiative to optimize ${rec.category.toLowerCase()} operational consumption.`,
                        recommendation: rec.description,
                        action: rec.description,
                        steps: [
                          rec.description,
                          `Incorporate ${rec.category.toLowerCase()} benchmarks into weekly facility reviews.`,
                          'Engage supply chain partners and vendors on zero-waste targets.',
                          'Calculate projected cost savings in the What-If simulator.'
                        ]
                      })
                    }
                  >
                    <span>View Details</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Details Modal */}
      {activeModalRec && (
        <div className="modal-overlay" onClick={() => setActiveModalRec(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-app)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    background: getCategoryIconInfo(activeModalRec.category).bg,
                    color: getCategoryIconInfo(activeModalRec.category).color,
                    border: `1px solid ${getCategoryIconInfo(activeModalRec.category).border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                    {activeModalRec.title}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Category: {activeModalRec.category} • {activeModalRec.priority} Priority
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalRec(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#ecfdf5', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#047857', fontWeight: 700 }}>
                    Est. CO2 Reduction
                  </span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#065f46' }}>
                    {activeModalRec.estimatedReduction}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    Priority Status
                  </span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {activeModalRec.priority} Priority
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  Why This Matters
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  {activeModalRec.reason}
                </p>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  Recommendation
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  {activeModalRec.recommendation}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-main)' }}>
                  Action Steps Checklist:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activeModalRec.steps.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.84rem', color: 'var(--text-main)' }}>
                      <CheckCircle2 size={16} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setActiveModalRec(null);
                  navigate('/circular-alternatives');
                }}
              >
                <span>Explore Circular Alternatives</span>
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveModalRec(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
