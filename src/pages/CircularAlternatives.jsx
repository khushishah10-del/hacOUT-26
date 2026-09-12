import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  RefreshCw,
  Sparkles,
  TrendingDown,
  DollarSign,
  Award,
  Layers,
  Box,
  Zap,
  Trash2,
  Sun,
  Cpu,
  Gauge,
  Scissors,
  Repeat,
  Share2,
  FileText,
  Factory,
  AlertCircle,
  Info,
  CheckCircle2,
  BarChart3,
  Flame,
  ShieldCheck,
  ChevronRight,
  Package,
  Recycle,
  X
} from 'lucide-react';
import Badge from '../components/common/Badge';
import { calculateEmissions } from '../utils/emissionCalculator';
import { detectHotspot } from '../utils/hotspotDetector';
import { getCircularAlternatives } from '../utils/circularAlternativeEngine';

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
  return { icon: RefreshCw, bg: '#ecfdf5', color: '#10b981', border: '#a7f3d0' };
};

/**
 * Returns alternative icon component based on icon name or category
 */
const getAltIcon = (iconName, category) => {
  switch (iconName?.toLowerCase()) {
    case 'sun':
      return Sun;
    case 'cpu':
      return Cpu;
    case 'zap':
      return Zap;
    case 'gauge':
      return Gauge;
    case 'scissors':
      return Scissors;
    case 'refreshcw':
      return RefreshCw;
    case 'trash2':
      return Trash2;
    case 'repeat':
      return Repeat;
    case 'share2':
      return Share2;
    case 'box':
      return Box;
    case 'layers':
      return Layers;
    case 'filetext':
      return FileText;
    case 'flame':
      return Flame;
    default:
      if (category?.toLowerCase().includes('elect')) return Zap;
      if (category?.toLowerCase().includes('fuel')) return Flame;
      if (category?.toLowerCase().includes('material')) return Layers;
      if (category?.toLowerCase().includes('waste')) return Trash2;
      return RefreshCw;
  }
};

export default function CircularAlternatives() {
  const navigate = useNavigate();
  const [activeModalAlt, setActiveModalAlt] = useState(null);

  // Load saved factory data and calculated emissions from localStorage
  const [dataState] = useState(() => {
    try {
      const savedFactory = localStorage.getItem('ecoloop_factory_data');
      const parsedFactory = savedFactory ? JSON.parse(savedFactory) : null;

      const savedResults = localStorage.getItem('ecoloop_emission_results');
      let emissionResult = savedResults ? JSON.parse(savedResults) : null;

      if (!emissionResult && parsedFactory && (parsedFactory.factoryName || parsedFactory.electricityConsumption)) {
        emissionResult = calculateEmissions(parsedFactory);
        localStorage.setItem('ecoloop_emission_results', JSON.stringify(emissionResult));
      }

      return {
        factoryData: parsedFactory,
        emissionResult
      };
    } catch (err) {
      console.error('Error loading circular alternatives data:', err);
      return { factoryData: null, emissionResult: null };
    }
  });

  const { factoryData, emissionResult } = dataState;

  // NO DATA STATE: If there is no factory/emission data
  if (!emissionResult || !factoryData) {
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
            No factory data available
          </h3>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '440px', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            Submit factory data to discover circular alternatives.
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
  const hotspot = detectHotspot(emissionResult);
  const isZero = !hotspot || hotspot.isZero || Number(emissionResult.totalCO2) <= 0;

  // ZERO EMISSION STATE: If total emissions are 0
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
            Insufficient emission data
          </h3>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '460px', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            Add factory activity data to identify meaningful circular opportunities.
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

  // Generate dynamic circular alternatives & resource opportunity
  const circularData = getCircularAlternatives(factoryData, emissionResult, hotspot);
  if (!circularData) return null;

  const { alternatives, resourceOpportunity } = circularData;
  const hotspotIconInfo = getCategoryIconInfo(hotspot.category);
  const HotspotIcon = hotspotIconInfo.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Important Estimate Disclaimer Banner */}
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
          <span>CO₂ reduction and cost figures are illustrative demo estimates and are not guaranteed savings.</span>
        </div>
        <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 600 }}>
          Demo Estimate
        </span>
      </div>

      {/* Header */}
      <div className="page-intro" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="page-intro-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <RefreshCw size={24} style={{ color: 'var(--primary)' }} />
              <span>Circular Alternatives</span>
            </h2>
            <p className="page-intro-desc">
              Explore practical ways to reduce emissions by reusing resources, improving efficiency, and replacing high-impact inputs.
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

      {/* SECTION 1: CURRENT HOTSPOT */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '1px solid var(--border-color)',
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
              backgroundColor: hotspotIconInfo.bg,
              color: hotspotIconInfo.color,
              border: `1px solid ${hotspotIconInfo.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <HotspotIcon size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700 }}>
                CURRENT HOTSPOT
              </span>
              <Badge variant={hotspot.category}>Rank #1 Source</Badge>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {hotspot.category}
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Targeting practical circular-economy substitutions directly against {factoryData.factoryName || 'your facility'}'s largest leak-point.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Emission Value
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {Number(hotspot.value).toLocaleString()}{' '}
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>kg CO₂e</span>
            </div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', height: '36px' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Percentage Contribution
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
              {hotspot.percentage}% <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>of total emissions</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: RECOMMENDED CIRCULAR OPTIONS */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
                Recommended Circular Options
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                High-impact closed-loop alternatives and efficiency substitutions tailored to {hotspot.category}.
              </p>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Showing {alternatives.length} Tailored Alternatives
            </span>
          </div>
        </div>

        <div className="circular-grid">
          {alternatives.map((alt) => {
            const AltIcon = getAltIcon(alt.icon, alt.category);
            const iconInfo = getCategoryIconInfo(alt.category);

            return (
              <div key={alt.id} className="circular-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: iconInfo.bg,
                          color: iconInfo.color,
                          border: `1px solid ${iconInfo.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <AltIcon size={22} />
                      </div>
                      <div>
                        <Badge variant={alt.category}>{alt.category}</Badge>
                        <h4 style={{ margin: '0.35rem 0 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {alt.title}
                        </h4>
                      </div>
                    </div>

                    <span
                      style={{
                        backgroundColor: '#ecfdf5',
                        color: '#065f46',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        border: '1px solid #a7f3d0',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {alt.priority || 'High Suitability'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 1rem' }}>
                    {alt.description}
                  </p>

                  {/* Circular Benefit Callout */}
                  <div className="circular-benefit-box" style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#047857', fontWeight: 700, marginBottom: '0.2rem' }}>
                      ♻️ Circular Benefit:
                    </div>
                    <div style={{ fontSize: '0.86rem', color: '#065f46', lineHeight: 1.45, fontWeight: 500 }}>
                      {alt.circularBenefit}
                    </div>
                  </div>
                </div>

                <div>
                  {/* Metrics: Est. CO2 Reduction + Estimated Cost + Demo Estimate Label */}
                  <div className="circular-metrics" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '1rem' }}>
                    <div className="metric-pill" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                      <span className="metric-pill-label" style={{ color: '#047857' }}>
                        Estimated CO₂ Reduction
                      </span>
                      <span className="metric-pill-val" style={{ color: '#065f46', fontSize: '1.05rem' }}>
                        ~{alt.estimatedCO2Reduction}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600 }}>
                        Demo Estimate
                      </span>
                    </div>

                    <div className="metric-pill">
                      <span className="metric-pill-label">
                        Estimated Cost
                      </span>
                      <span className="metric-pill-val" style={{ color: 'var(--text-main)', fontSize: '1.05rem' }}>
                        {alt.estimatedCost}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        Capex / Setup
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-full"
                      onClick={() => setActiveModalAlt(alt)}
                    >
                      <span>View Implementation Roadmap</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: RESOURCE OPPORTUNITY */}
      <div className="resource-opportunity-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>
              RESOURCE OPPORTUNITY
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Factory Scrap & Material Stream Analysis
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Quantified from submitted operational logs for {factoryData.factoryName || 'the factory'}.
            </p>
          </div>

          {resourceOpportunity.opportunityDetected && (
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #6ee7b7',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#065f46',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              <Sparkles size={16} style={{ color: '#059669' }} />
              <span>High-value recovery opportunity detected</span>
            </div>
          )}
        </div>

        {/* Dynamic Context Message */}
        <div
          style={{
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            fontSize: '0.88rem',
            color: 'var(--text-main)',
            lineHeight: 1.5
          }}
        >
          {resourceOpportunity.message}
        </div>

        {/* 4 Waste Streams Grid */}
        <div className="resource-streams-grid">
          <div className="resource-stream-box">
            <span className="resource-stream-label">
              <Box size={14} style={{ color: '#0284c7' }} />
              <span>Plastic Waste</span>
            </span>
            <span className="resource-stream-val">
              {resourceOpportunity.plastic.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>kg</span>
            </span>
          </div>

          <div className="resource-stream-box">
            <span className="resource-stream-label">
              <Layers size={14} style={{ color: '#7c3aed' }} />
              <span>Metal Waste</span>
            </span>
            <span className="resource-stream-val">
              {resourceOpportunity.metal.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>kg</span>
            </span>
          </div>

          <div className="resource-stream-box">
            <span className="resource-stream-label">
              <FileText size={14} style={{ color: '#d97706' }} />
              <span>Paper Waste</span>
            </span>
            <span className="resource-stream-val">
              {resourceOpportunity.paper.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>kg</span>
            </span>
          </div>

          <div className="resource-stream-box">
            <span className="resource-stream-label">
              <Trash2 size={14} style={{ color: '#64748b' }} />
              <span>Other Waste</span>
            </span>
            <span className="resource-stream-val">
              {resourceOpportunity.other.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>kg</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Total Production Waste: <strong style={{ color: 'var(--text-main)' }}>{resourceOpportunity.totalWaste.toLocaleString()} kg</strong>
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/what-if')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span>Simulate Waste Recovery Impact in What-If</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Interactive Implementation Details Modal */}
      {activeModalAlt && (
        <div className="modal-overlay" onClick={() => setActiveModalAlt(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-app)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    background: getCategoryIconInfo(activeModalAlt.category).bg,
                    color: getCategoryIconInfo(activeModalAlt.category).color,
                    border: `1px solid ${getCategoryIconInfo(activeModalAlt.category).border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <RefreshCw size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                    {activeModalAlt.title}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Category: {activeModalAlt.category} • {activeModalAlt.priority || 'High Suitability'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalAlt(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#ecfdf5', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#047857', fontWeight: 700 }}>
                    Est. CO₂ Reduction (Demo Estimate)
                  </span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#065f46' }}>
                    ~{activeModalAlt.estimatedCO2Reduction}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    Estimated Implementation Cost
                  </span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {activeModalAlt.estimatedCost}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  Alternative Overview
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  {activeModalAlt.description}
                </p>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  Circular Economy Benefit
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#047857', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                  {activeModalAlt.circularBenefit}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-main)' }}>
                  Recommended Implementation Steps:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.84rem', color: 'var(--text-main)' }}>
                    <CheckCircle2 size={16} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
                    <span>Conduct engineering feasibility study and baseline audit for {activeModalAlt.category.toLowerCase()} systems.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.84rem', color: 'var(--text-main)' }}>
                    <CheckCircle2 size={16} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
                    <span>Engage circular equipment suppliers and certified secondary material vendors.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.84rem', color: 'var(--text-main)' }}>
                    <CheckCircle2 size={16} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
                    <span>Run scenario projections in the EcoLoop What-If Simulator before commissioning.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setActiveModalAlt(null);
                  navigate('/what-if');
                }}
              >
                <span>Test in What-If Simulator</span>
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveModalAlt(null)}
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
