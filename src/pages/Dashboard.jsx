import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CloudFog,
  TrendingDown,
  Boxes,
  Sparkles,
  PieChart as PieIcon,
  LineChart as LineIcon
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import SectionCard from '../components/common/SectionCard';
import EmissionBreakdownChart from '../components/dashboard/EmissionBreakdownChart';
import MonthlyEmissionChart from '../components/dashboard/MonthlyEmissionChart';
import HotspotCard from '../components/dashboard/HotspotCard';
import RecommendationPreviewCard from '../components/dashboard/RecommendationPreviewCard';
import { DASHBOARD_STATS, FACTORY_INFO } from '../data/mockData';

export default function Dashboard() {
  const navigate = useNavigate();

  // Load latest emission results and factory data from localStorage
  const emissionResults = (() => {
    try {
      const saved = localStorage.getItem('ecoloop_emission_results');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })();

  const savedFactory = (() => {
    try {
      const saved = localStorage.getItem('ecoloop_factory_data');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })();

  const factoryName = savedFactory?.factoryName || FACTORY_INFO?.name || 'Industrial Facility';
  const auditDate = savedFactory?.date || FACTORY_INFO?.lastAudit || 'Current Period';

  const hasTotalCO2 = emissionResults?.totalCO2 !== undefined && emissionResults?.totalCO2 !== null && !isNaN(Number(emissionResults.totalCO2));
  const totalEmissionsDisplay = hasTotalCO2
    ? Number((Number(emissionResults.totalCO2) / 1000).toFixed(1)).toLocaleString()
    : (DASHBOARD_STATS?.totalEmissions?.display || "1,248");

  const totalEmissionsUnit = hasTotalCO2
    ? "tons CO2e"
    : (DASHBOARD_STATS?.totalEmissions?.unit || "tons CO2");

  const productionUnitsDisplay = (savedFactory?.productionUnits !== undefined && savedFactory?.productionUnits !== null && !isNaN(Number(savedFactory.productionUnits)))
    ? Number(savedFactory.productionUnits).toLocaleString()
    : (DASHBOARD_STATS?.production?.display || "10,000");

  const isLive = hasTotalCO2;

  const hasHotspotVal = emissionResults?.hotspot?.value !== undefined && emissionResults?.hotspot?.value !== null && !isNaN(Number(emissionResults.hotspot.value));
  const potentialReductionDisplay = hasHotspotVal
    ? Number((Number(emissionResults.hotspot.value) * 0.35 / 1000).toFixed(1)).toLocaleString()
    : (DASHBOARD_STATS?.potentialReduction?.display || "268");

  const potentialReductionPeriod = emissionResults?.hotspot?.category
    ? `${emissionResults.hotspot.category} Target`
    : (DASHBOARD_STATS?.potentialReduction?.period || "Actionable target");

  return (
    <div className="dashboard-grid">
      {/* Welcome Banner / Overview intro */}
      <div className="page-intro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <h2 className="page-intro-title" style={{ margin: 0 }}>Facility Emission Intelligence</h2>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '999px',
                backgroundColor: isLive ? '#ecfdf5' : '#f1f5f9',
                color: isLive ? '#065f46' : '#64748b',
                border: `1px solid ${isLive ? '#a7f3d0' : '#cbd5e1'}`
              }}
            >
              {isLive ? '● Live Verified Data' : '○ Benchmark Baseline'}
            </span>
          </div>
          <p className="page-intro-desc">
            Continuous carbon accounting and circular material optimization for {factoryName}.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isLive ? (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/emission-analysis')}
                title="View detailed emission breakdown and leak points"
              >
                <Sparkles size={16} />
                <span>View Emission Analysis</span>
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/factory-data')}
                title="Update factory operational data"
              >
                <span>Update Factory Data</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/factory-data')}
              title="Log factory operational data"
            >
              <Sparkles size={16} />
              <span>Log Factory Data</span>
            </button>
          )}

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: '#ffffff', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
            Audited Cycle: <strong>{auditDate}</strong>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="kpi-grid">
        <StatCard
          title="Total Estimated Emissions"
          value={totalEmissionsDisplay}
          unit={totalEmissionsUnit}
          trend={emissionResults ? `${emissionResults.hotspot?.category || 'Active'} hotspot` : (DASHBOARD_STATS?.totalEmissions?.trend || "-8.4%")}
          isPositiveTrend={DASHBOARD_STATS?.totalEmissions?.isPositiveTrend ?? true}
          period={emissionResults ? "Backend verified" : (DASHBOARD_STATS?.totalEmissions?.period || "vs last month")}
          icon={CloudFog}
          colorVariant="green"
        />

        <StatCard
          title="Monthly Change"
          value={DASHBOARD_STATS?.monthlyChange?.display || "-8.4%"}
          unit={DASHBOARD_STATS?.monthlyChange?.unit || "Change"}
          trend={DASHBOARD_STATS?.monthlyChange?.trend || "Improving"}
          isPositiveTrend={DASHBOARD_STATS?.monthlyChange?.isPositiveTrend ?? true}
          period={DASHBOARD_STATS?.monthlyChange?.period || "30-day rolling"}
          icon={TrendingDown}
          colorVariant="blue"
        />

        <StatCard
          title="Production Output"
          value={productionUnitsDisplay}
          unit={DASHBOARD_STATS?.production?.unit || "units"}
          trend={DASHBOARD_STATS?.production?.trend || "+4.2%"}
          isPositiveTrend={DASHBOARD_STATS?.production?.isPositiveTrend ?? true}
          period={DASHBOARD_STATS?.production?.period || "Standard output"}
          icon={Boxes}
          colorVariant="amber"
        />

        <StatCard
          title="Potential Reduction"
          value={potentialReductionDisplay}
          unit="tons CO2"
          trend={emissionResults ? "Actionable" : (DASHBOARD_STATS?.potentialReduction?.trend || "21.5% of total")}
          isPositiveTrend={DASHBOARD_STATS?.potentialReduction?.isPositiveTrend ?? true}
          period={potentialReductionPeriod}
          icon={Sparkles}
          colorVariant="purple"
        />
      </div>

      {/* Charts Row: Emission Breakdown Donut + Monthly Trend Area Chart */}
      <div className="dashboard-charts-row">
        <SectionCard
          title="Emission Breakdown by Category"
          subtitle="Electricity, Fuel, Raw Materials & Waste distribution"
          icon={PieIcon}
        >
          <EmissionBreakdownChart data={emissionResults?.breakdown} />
        </SectionCard>

        <SectionCard
          title="Monthly Emissions Trajectory"
          subtitle="Actual gross CO2 emissions vs 2026 Reduction Target"
          icon={LineIcon}
        >
          <MonthlyEmissionChart />
        </SectionCard>
      </div>

      {/* Prominent Hotspot & AI Recommendation Preview Row */}
      <div className="dashboard-actions-row">
        <HotspotCard hotspotData={emissionResults?.hotspot} />
        <RecommendationPreviewCard />
      </div>
    </div>

  );
}
