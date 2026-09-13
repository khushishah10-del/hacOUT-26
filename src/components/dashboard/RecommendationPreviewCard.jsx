import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, ArrowRight, TrendingDown } from 'lucide-react';
import Badge from '../common/Badge';
import { AI_RECOMMENDATION_PREVIEW } from '../../data/mockData';

export default function RecommendationPreviewCard() {
  const navigate = useNavigate();

  // Read latest emission results from localStorage for dynamic recommendation preview
  const activeRec = (() => {
    try {
      const saved = localStorage.getItem('ecoloop_emission_results');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.hotspot?.category && parsed.hotspot.category !== 'No hotspot') {
          const cat = parsed.hotspot.category.toLowerCase();
          let summary = 'Prioritize energy efficiency and operational scheduling to cut carbon intensity.';
          if (cat.includes('elect')) {
            summary = 'Transition grid supply to rooftop solar and captive renewable PPAs to eliminate Scope 2 emissions.';
          } else if (cat.includes('fuel')) {
            summary = 'Install flue gas heat recovery economizers and optimize burner air-fuel ratio to reduce Scope 1 fuel consumption.';
          } else if (cat.includes('material')) {
            summary = 'Substitute virgin feedstock with certified post-industrial recycled resins and secondary alloy scrap.';
          } else if (cat.includes('waste')) {
            summary = 'Establish closed-loop scrap take-back loops and byproduct upcycling partnerships to divert landfill discards.';
          }

          const reductionTons = parsed.hotspot.value
            ? Number((parsed.hotspot.value * 0.35 / 1000).toFixed(1))
            : 268;

          return {
            summary,
            potentialReduction: `${reductionTons} tons CO2`,
            priority: 'High',
            estimatedAnnualSavings: '₹34,80,000 (~$42,000)',
            hotspot: parsed.hotspot.category
          };
        }
      }
    } catch (e) {
      // Fallback
    }
    return AI_RECOMMENDATION_PREVIEW;
  })();

  return (
    <div className="card ai-recommendation-card">
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="ai-header">
            <Bot size={18} />
            <span>🤖 AI Decarbonization Recommendation</span>
          </div>

          <p className="ai-quote">
            "{activeRec?.summary || 'Consider increasing renewable electricity usage to reduce electricity-related emissions.'}"
          </p>

          <div className="ai-meta">
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                Potential Reduction
              </span>
              <strong style={{ fontSize: '1.05rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingDown size={16} />
                {activeRec?.potentialReduction || '268 tons CO2'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                Priority
              </span>
              <Badge variant={activeRec?.priority || 'High'}>
                {activeRec?.priority || 'High'}
              </Badge>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                Est. Savings
              </span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                {activeRec?.estimatedAnnualSavings || '₹34.8L/yr'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/recommendations')}
          >
            <span>View Recommendations</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
