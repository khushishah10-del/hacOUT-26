import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { EMISSION_BREAKDOWN } from '../../data/mockData';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const amountLabel = data.kg
      ? `${data.kg.toLocaleString()} kg CO2e (${data.tons} tons)`
      : `${data.tons} tons CO2`;

    return (
      <div className="custom-chart-tooltip">
        <div className="tooltip-label">{data.category}</div>
        <div className="tooltip-val">{data.percentage}% ({amountLabel})</div>
        <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '4px' }}>
          {data.scope}
        </div>
      </div>
    );
  }
  return null;
};

export default function EmissionBreakdownChart({ data = EMISSION_BREAKDOWN }) {
  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={4}
            dataKey="percentage"
            nameKey="category"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => {
              const item = data.find((d) => d.category === value);
              return (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>
                  {value}: <strong>{item?.percentage}%</strong>
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
