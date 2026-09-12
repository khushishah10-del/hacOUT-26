import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  TrendingDown,
  RotateCcw,
  Sparkles,
  Zap,
  Layers,
  Trash2,
  DollarSign,
  BarChart2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import SectionCard from '../components/common/SectionCard';
import { calculateSimulatedEmissions } from '../data/mockData';

export default function WhatIfSimulator() {
  // Slider state: 0 - 100%
  const [renewableEnergy, setRenewableEnergy] = useState(15);
  const [recycledMaterial, setRecycledMaterial] = useState(10);
  const [wasteRecovery, setWasteRecovery] = useState(20);

  // Calculate simulation outcomes dynamically
  // Note: calculateSimulatedEmissions is structured so it can be swapped with an API call or backend engine
  const simulation = useMemo(() => {
    return calculateSimulatedEmissions(renewableEnergy, recycledMaterial, wasteRecovery);
  }, [renewableEnergy, recycledMaterial, wasteRecovery]);

  // Presets for quick hackathon presentation / testing
  const applyPreset = (preset) => {
    switch (preset) {
      case 'baseline':
        setRenewableEnergy(15);
        setRecycledMaterial(10);
        setWasteRecovery(20);
        break;
      case 'renewable':
        setRenewableEnergy(80);
        setRecycledMaterial(25);
        setWasteRecovery(35);
        break;
      case 'circular':
        setRenewableEnergy(35);
        setRecycledMaterial(75);
        setWasteRecovery(85);
        break;
      case 'netzero':
        setRenewableEnergy(95);
        setRecycledMaterial(90);
        setWasteRecovery(90);
        break;
      default:
        break;
    }
  };

  const chartData = [
    {
      name: 'Baseline Emissions',
      emissions: simulation.baselineTotal,
      fill: '#94a3b8'
    },
    {
      name: 'Projected Emissions',
      emissions: simulation.projectedTotal,
      fill: '#10b981'
    }
  ];

  return (
    <div>
      <div className="page-intro">
        <h2 className="page-intro-title">What-If Decarbonization Simulator</h2>
        <p className="page-intro-desc">
          Dynamically simulate plant-wide carbon reduction by tuning renewable energy adoption, circular material substitution, and industrial scrap recovery.
        </p>
      </div>

      <div className="simulator-layout">
        {/* Left Controls Pane: Sliders & Presets */}
        <div className="sim-controls-pane">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <SlidersHorizontal size={18} className="text-success" />
                <span>Simulation Parameters</span>
              </h3>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => applyPreset('baseline')}
                title="Reset sliders to facility baseline"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                  Quick Scenario Presets:
                </span>
                <div className="preset-pills">
                  <button type="button" className="preset-btn" onClick={() => applyPreset('baseline')}>
                    Baseline (15%)
                  </button>
                  <button type="button" className="preset-btn" onClick={() => applyPreset('renewable')}>
                    ⚡ Clean Power (80%)
                  </button>
                  <button type="button" className="preset-btn" onClick={() => applyPreset('circular')}>
                    🔄 Circular (75%)
                  </button>
                  <button type="button" className="preset-btn" onClick={() => applyPreset('netzero')}>
                    🌱 Aggressive Sprint
                  </button>
                </div>
              </div>

              {/* Slider 1: Renewable Energy */}
              <div className="slider-group">
                <div className="slider-top">
                  <span className="slider-label">
                    <Zap size={16} style={{ color: '#d97706' }} />
                    Renewable Energy
                  </span>
                  <span className="slider-badge">{renewableEnergy}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={renewableEnergy}
                  onChange={(e) => setRenewableEnergy(Number(e.target.value))}
                  className="slider-input"
                />
                <div className="slider-bounds">
                  <span>0% (Fossil Grid)</span>
                  <span>100% (Full Clean)</span>
                </div>
              </div>

              {/* Slider 2: Recycled Material */}
              <div className="slider-group">
                <div className="slider-top">
                  <span className="slider-label">
                    <Layers size={16} style={{ color: '#7c3aed' }} />
                    Recycled Material Content
                  </span>
                  <span className="slider-badge">{recycledMaterial}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={recycledMaterial}
                  onChange={(e) => setRecycledMaterial(Number(e.target.value))}
                  className="slider-input"
                />
                <div className="slider-bounds">
                  <span>0% (Virgin Only)</span>
                  <span>100% (Circular Feedstock)</span>
                </div>
              </div>

              {/* Slider 3: Waste Recovery */}
              <div className="slider-group">
                <div className="slider-top">
                  <span className="slider-label">
                    <Trash2 size={16} style={{ color: '#0284c7' }} />
                    Waste Recovery & Upcycling
                  </span>
                  <span className="slider-badge">{wasteRecovery}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={wasteRecovery}
                  onChange={(e) => setWasteRecovery(Number(e.target.value))}
                  className="slider-input"
                />
                <div className="slider-bounds">
                  <span>0% (Landfill)</span>
                  <span>100% (Zero Scrap Waste)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Results Pane: Live Projected Emissions & Visual Comparison */}
        <div className="sim-results-pane">
          {/* Main Projected Emissions Banner */}
          <div className="sim-banner">
            <div>
              <div className="sim-banner-label">Projected Annual Emissions</div>
              <div className="sim-banner-val">
                {simulation.projectedTotal} <span style={{ fontSize: '1.25rem', fontWeight: 500 }}>tons CO2</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#93c5fd' }}>
                Baseline: {simulation.baselineTotal} tons CO2
              </span>
            </div>

            <div className="sim-banner-diff">
              <span className="sim-saved-badge">
                ↓ {simulation.tonsSaved} tons CO2 saved (-{simulation.percentageReduced}%)
              </span>
              <span style={{ fontSize: '0.85rem', color: '#6ee7b7', marginTop: '0.25rem' }}>
                Est. Financial Savings: ~${simulation.financialSavings.toLocaleString()} / year
              </span>
            </div>
          </div>

          {/* Recharts Visual Comparison */}
          <SectionCard
            title="Emission Impact Comparison"
            subtitle="Current plant footprint vs simulated scenario"
            icon={BarChart2}
          >
            <div className="chart-wrapper" style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 15, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" domain={[0, 1400]} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" tickLine={false} width={130} />
                  <Tooltip
                    formatter={(val) => [`${val} tons CO2`, 'Emissions']}
                  />
                  <Bar dataKey="emissions" radius={[0, 6, 6, 0]} barSize={28}>
                    {chartData.map((entry, index) => (
                      <Cell key={`sim-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          {/* Breakdown by Category Under Simulation */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Electricity</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{simulation.breakdown.electricity} tons</strong>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Fuel</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{simulation.breakdown.fuel} tons</strong>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Materials</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{simulation.breakdown.materials} tons</strong>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Waste</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{simulation.breakdown.waste} tons</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
