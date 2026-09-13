import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { MONTHLY_EMISSIONS_TREND } from '../../data/mockData';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <div className="tooltip-label">Month: {label}</div>
        <div className="tooltip-val" style={{ color: '#38bdf8' }}>
          Emissions: {payload[0]?.value} tons CO2
        </div>
        {payload[1] && (
          <div style={{ color: '#10b981', fontSize: '0.78rem', marginTop: '3px' }}>
            Target: {payload[1]?.value} tons CO2
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function MonthlyEmissionChart({ data = MONTHLY_EMISSIONS_TREND }) {
  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} />
          <Area
            type="monotone"
            dataKey="emissions"
            name="Actual Emissions (tons)"
            stroke="#0284c7"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorEmissions)"
          />
          <Area
            type="monotone"
            dataKey="target"
            name="Reduction Target (tons)"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#colorTarget)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
