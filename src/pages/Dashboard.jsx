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
  const factoryName = FACTORY_INFO?.name || 'Industrial Facility';
  const auditDate = FACTORY_INFO?.lastAudit || 'Current Period';

  return (
    <div className="dashboard-grid">
      {/* Welcome Banner / Overview intro */}
      <div className="page-intro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-intro-title">Facility Emission Intelligence</h2>
          <p className="page-intro-desc">
            Continuous carbon accounting and circular material optimization for {factoryName}.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/emission-analysis')}
            title="Analyze Factory Data and view emissions"
          >
            <Sparkles size={16} />
            <span>Analyze Factory Data</span>
          </button>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: '#ffffff', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
            Audited Cycle: <strong>{auditDate}</strong>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="kpi-grid">
        <StatCard
          title="Total Estimated Emissions"
          value={DASHBOARD_STATS?.totalEmissions?.display || "1,248"}
          unit={DASHBOARD_STATS?.totalEmissions?.unit || "tons CO2"}
          trend={DASHBOARD_STATS?.totalEmissions?.trend || "-8.4%"}
          isPositiveTrend={DASHBOARD_STATS?.totalEmissions?.isPositiveTrend ?? true}
          period={DASHBOARD_STATS?.totalEmissions?.period || "vs last month"}
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
          value={DASHBOARD_STATS?.production?.display || "10,000"}
          unit={DASHBOARD_STATS?.production?.unit || "units"}
          trend={DASHBOARD_STATS?.production?.trend || "+4.2%"}
          isPositiveTrend={DASHBOARD_STATS?.production?.isPositiveTrend ?? true}
          period={DASHBOARD_STATS?.production?.period || "Standard output"}
          icon={Boxes}
          colorVariant="amber"
        />

        <StatCard
          title="Potential Reduction"
          value={DASHBOARD_STATS?.potentialReduction?.display || "268"}
          unit={DASHBOARD_STATS?.potentialReduction?.unit || "tons CO2"}
          trend={DASHBOARD_STATS?.potentialReduction?.trend || "21.5% of total"}
          isPositiveTrend={DASHBOARD_STATS?.potentialReduction?.isPositiveTrend ?? true}
          period={DASHBOARD_STATS?.potentialReduction?.period || "Actionable target"}
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
          <EmissionBreakdownChart />
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
        <HotspotCard />
        <RecommendationPreviewCard />
      </div>
    </div>
  );
}
