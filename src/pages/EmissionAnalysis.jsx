import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart as PieIcon,
  BarChart3,
  Flame,
  Zap,
  Layers,
  Trash2,
  ShieldAlert,
  Info,
  Factory,
  Sparkles,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import SectionCard from '../components/common/SectionCard';
import EmissionBreakdownChart from '../components/dashboard/EmissionBreakdownChart';
import Badge from '../components/common/Badge';
import { calculateEmissions } from '../utils/emissionCalculator';
import { detectHotspot } from '../utils/hotspotDetector';

const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case 'electricity':
      return Zap;
    case 'fuel':
      return Flame;
    case 'material':
    case 'raw materials':
      return Layers;
    case 'waste':
      return Trash2;
    default:
      return Flame;
  }
};

const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-chart-tooltip">
        <div className="tooltip-label">{data.category}</div>
        <div className="tooltip-val">
          {data.kg?.toLocaleString()} kg CO2e ({data.tons} tons)
        </div>
        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '3px' }}>
          {data.percentage}% of facility total • {data.scope}
        </div>
      </div>
    );
  }
  return null;
};

export default function EmissionAnalysis() {
  const navigate = useNavigate();

  // Load calculated emission results from localStorage (or recalculate from stored factory inputs)
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

  // TEST 1 & Requirement 9: Handle missing factory data
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
            No Factory Data Available
          </h3>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '440px', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            No factory data available. Please enter and analyze factory data first.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/factory-data')}
            style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
          >
            <Sparkles size={16} />
            <span>Go to Factory Data</span>
          </button>
        </div>
      </div>
    );
  }

  // Detect dynamic hotspot and sorted contributors using hotspotDetector utility
  const hotspot = detectHotspot(emissionData);
  const isZero = hotspot?.isZero || (Number(emissionData.totalCO2) === 0);

  const HotspotIcon = getCategoryIcon(hotspot?.category);
  const breakdownList = emissionData.breakdown || [];

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
          gap: '0.65rem',
          color: '#1e40af',
          fontSize: '0.86rem',
          fontWeight: 500
        }}
      >
        <Info size={18} style={{ flexShrink: 0, color: '#3b82f6' }} />
        <span>Demo emission factors are used for this prototype. Final factors will be configured in the backend.</span>
      </div>

      {/* Requirement 3: Top Header displaying "Emission Analysis" clearly */}
      <div className="page-intro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-intro-title">Emission Analysis</h2>
          <p className="page-intro-desc">
            Continuous emission auditing, dynamic leak-point detection, and contributor ranking for <strong>{emissionData.factoryName}</strong> ({emissionData.location}) • Date: {emissionData.date}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/factory-data')}
          >
            Update Factory Data
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/recommendations')}
          >
            <span>View Recommendations</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Requirement 10: Safe Zero-Emissions State */}
      {isZero ? (
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <AlertCircle size={28} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            No emissions have been calculated yet.
          </h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '500px' }}>
            The current factory parameters indicate zero consumption across electricity, fuels, materials, and waste streams. Total estimated emissions are 0 kg CO2e.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/factory-data')}
          >
            Edit Factory Data
          </button>
        </div>
      ) : (
        <>
          {/* Requirement 3: Prominent Summary Section (Total CO2e, Main Hotspot, Hotspot %, Hotspot Value) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem'
            }}
          >
            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-title">Total Estimated Emissions</span>
                <div className="stat-icon-wrapper stat-icon-green">
                  <Factory size={20} />
                </div>
              </div>
              <div className="stat-value">
                {emissionData.totalCO2.toLocaleString()} <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-muted)' }}>kg CO2e</span>
              </div>
              <div className="stat-subtext">
                <span style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>
                  {emissionData.totalCO2Tons} metric tons CO2e
                </span>
              </div>
            </div>

            <div className="stat-card" style={{ borderColor: '#fecaca', background: 'linear-gradient(135deg, #fffafa 0%, #ffffff 100%)' }}>
              <div className="stat-card-top">
                <span className="stat-title" style={{ color: '#dc2626' }}>Main Emission Hotspot</span>
                <div className="stat-icon-wrapper" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                  <HotspotIcon size={20} />
                </div>
              </div>
              <div className="stat-value" style={{ color: '#b91c1c' }}>
                {hotspot.category}
              </div>
              <div className="stat-subtext">
                <span className="badge badge-high">
                  Primary Leak Point
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {hotspot.scope}
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-title">Hotspot Share</span>
                <div className="stat-icon-wrapper stat-icon-amber">
                  <PieIcon size={20} />
                </div>
              </div>
              <div className="stat-value">
                {hotspot.percentage}%
              </div>
              <div className="stat-subtext">
                <span>Proportion of plant carbon footprint</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-title">Hotspot Emission Value</span>
                <div className="stat-icon-wrapper stat-icon-purple">
                  <TrendingDown size={20} />
                </div>
              </div>
              <div className="stat-value">
                {hotspot.value.toLocaleString()} <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-muted)' }}>kg CO2e</span>
              </div>
              <div className="stat-subtext">
                <span>{(hotspot.value / 1000).toFixed(2)} metric tons CO2e</span>
              </div>
            </div>
          </div>

          {/* Requirement 4: Visually Noticeable Hotspot Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)',
              border: '1px solid #fecaca',
              borderLeft: '5px solid #ef4444',
              borderRadius: 'var(--radius-lg)',
              padding: '1.35rem 1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
              <div
                style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)'
                }}
              >
                <HotspotIcon size={26} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ color: '#dc2626', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    🔥 Main Emission Hotspot
                  </span>
                  <span className="category-leak-badge">{hotspot.percentage}% of total emissions</span>
                </div>

                <h3 style={{ margin: '0.15rem 0', fontSize: '1.35rem', fontWeight: 800, color: '#1e293b' }}>
                  {hotspot.category} — {hotspot.value.toLocaleString()} kg CO2e
                </h3>

                <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
                  {hotspot.reason}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/recommendations')}
            >
              <span>Reduce {hotspot.category} Emissions</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Recharts Charts Row: Donut Percentage + Bar Comparison (Requirement 5 & 6) */}
          <div className="dashboard-charts-row">
            <SectionCard
              title="Emission Percentage Share"
              subtitle="Proportional breakdown across operational boundaries"
              icon={PieIcon}
            >
              <EmissionBreakdownChart data={breakdownList} />
            </SectionCard>

            <SectionCard
              title="Direct Emissions Comparison"
              subtitle="kg CO2e emissions by operational category"
              icon={BarChart3}
            >
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={breakdownList}
                    margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="kg" name="Emissions (kg CO2e)" radius={[6, 6, 0, 0]}>
                      {breakdownList.map((entry, index) => (
                        <Cell key={`bar-cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          {/* Requirement 7: Top Contributors Section (Sorted highest to lowest) */}
          <SectionCard
            title="Top Contributors"
            subtitle="Emission categories ranked dynamically from highest to lowest impact"
            icon={TrendingDown}
          >
            <div className="top-contributors-list">
              {hotspot.topContributors.map((item, index) => {
                const ItemIcon = getCategoryIcon(item.category);
                const isPrimary = index === 0;

                return (
                  <div
                    key={item.category}
                    className={`contributor-row ${isPrimary ? 'is-primary' : ''}`}
                  >
                    <div className="contributor-rank">
                      {index + 1}
                    </div>

                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isPrimary ? '#fee2e2' : 'var(--bg-card-alt)',
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <ItemIcon size={18} />
                    </div>

                    <div className="contributor-main-info">
                      <div className="contributor-top-line">
                        <span className="contributor-title">
                          {item.category}
                          {isPrimary && (
                            <span className="category-leak-badge">Hotspot</span>
                          )}
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                            ({item.scope})
                          </span>
                        </span>

                        <span className="contributor-val">
                          {item.percentage}% &nbsp;•&nbsp; <span style={{ color: item.color }}>{item.value.toLocaleString()} kg CO2e</span>
                        </span>
                      </div>

                      <div className="contributor-bar-wrapper">
                        <div
                          className="contributor-bar-fill"
                          style={{
                            width: `${Math.max(item.percentage, 3)}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Requirement 8: "What this means" Section */}
          <div className="what-means-box">
            <div className="what-means-title">
              <Lightbulb size={18} />
              <span>What This Means</span>
            </div>
            <p className="what-means-text">
              {hotspot.whatThisMeans}
            </p>
          </div>

          {/* Detailed Category Breakdown Table / Cards */}
          <SectionCard
            title="Emission Sources & Inventory Details"
            subtitle="Activity metrics based on latest submitted operational data"
          >
            <div className="category-breakdown-list">
              {breakdownList.map((item) => {
                const Icon = getCategoryIcon(item.category);
                const isPrimary = item.category === hotspot.category;

                return (
                  <div
                    key={item.category}
                    className={`category-row-card ${isPrimary ? 'primary-leak' : ''}`}
                  >
                    <div className="category-info">
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isPrimary ? '#fee2e2' : 'var(--bg-card-alt)',
                          color: item.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Icon size={20} />
                      </div>

                      <div className="category-meta">
                        <div className="category-name">
                          {item.category}
                          {isPrimary && (
                            <span className="category-leak-badge">Hotspot</span>
                          )}
                        </div>
                        <span className="category-scope">
                          {item.scope} • {item.description}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Input: {item.inputQuantity?.toLocaleString()} {item.inputUnit} × {item.factor} kg CO2e/{item.inputUnit}
                        </span>
                      </div>
                    </div>

                    <div className="category-stats">
                      <span className="category-val">{item.kg?.toLocaleString()} kg CO2e</span>
                      <span className="category-percentage">
                        <strong>{item.percentage}%</strong> ({item.tons} tons)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Waste Sub-breakdown Details if Waste exists */}
            {emissionData.breakdown?.find(b => b.category === 'Waste')?.subBreakdown && (
              <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.75rem' }}>
                  Waste Sub-Category Inventory (Disposal Impact):
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Plastic Waste (2.50 kg CO2e/kg)</span>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      {emissionData.breakdown.find(b => b.category === 'Waste').subBreakdown.plastic.kg.toLocaleString()} kg CO2e
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Metal Waste (1.80 kg CO2e/kg)</span>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      {emissionData.breakdown.find(b => b.category === 'Waste').subBreakdown.metal.kg.toLocaleString()} kg CO2e
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Paper Waste (1.00 kg CO2e/kg)</span>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      {emissionData.breakdown.find(b => b.category === 'Waste').subBreakdown.paper.kg.toLocaleString()} kg CO2e
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Other Waste (1.20 kg CO2e/kg)</span>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      {emissionData.breakdown.find(b => b.category === 'Waste').subBreakdown.other.kg.toLocaleString()} kg CO2e
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
