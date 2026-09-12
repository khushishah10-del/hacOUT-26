import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, ArrowRight, TrendingDown } from 'lucide-react';
import Badge from '../common/Badge';
import { AI_RECOMMENDATION_PREVIEW } from '../../data/mockData';

export default function RecommendationPreviewCard() {
  const navigate = useNavigate();

  return (
    <div className="card ai-recommendation-card">
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="ai-header">
            <Bot size={18} />
            <span>🤖 AI Recommendation</span>
          </div>

          <p className="ai-quote">
            "{AI_RECOMMENDATION_PREVIEW?.summary || 'Consider increasing renewable electricity usage to reduce electricity-related emissions.'}"
          </p>

          <div className="ai-meta">
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                Potential Reduction
              </span>
              <strong style={{ fontSize: '1.05rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingDown size={16} />
                {AI_RECOMMENDATION_PREVIEW?.potentialReduction || '268 tons CO2'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                Priority
              </span>
              <Badge variant={AI_RECOMMENDATION_PREVIEW?.priority || 'High'}>
                {AI_RECOMMENDATION_PREVIEW?.priority || 'High'}
              </Badge>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                Est. Savings
              </span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                {AI_RECOMMENDATION_PREVIEW?.estimatedAnnualSavings || '$42,000'}/yr
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
