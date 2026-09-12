import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

/**
 * Reusable StatCard for KPIs and high-level metrics
 */
export default function StatCard({
  title = "Metric",
  value = "0",
  unit = "",
  trend = null,
  isPositiveTrend = true,
  period = "",
  icon: Icon = null,
  colorVariant = "green"
}) {
  const iconClass = `stat-icon-${colorVariant}`;

  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-title">{title}</span>
        {Icon && (
          <div className={`stat-icon-wrapper ${iconClass}`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="stat-value">
        {value} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>{unit}</span>
      </div>

      {(trend || period) && (
        <div className="stat-subtext">
          {trend && (
            <span className={`stat-trend ${isPositiveTrend ? 'positive-good' : 'neutral'}`}>
              {isPositiveTrend ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
              {trend}
            </span>
          )}
          {period && <span>{period}</span>}
        </div>
      )}
    </div>
  );
}
