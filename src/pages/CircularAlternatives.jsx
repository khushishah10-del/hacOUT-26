import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  RefreshCw,
  Sparkles,
  TrendingDown,
  Layers,
  Zap,
  Trash2,
  Factory,
  AlertCircle,
  Info,
  CheckCircle2,
  BarChart3,
  Flame,
  ChevronRight,
  X,
  Target,
  Clock,
  Loader2,
  Recycle
} from 'lucide-react';
import Badge from '../components/common/Badge';
import { getFactoryRecommendations, getFactories } from '../services/api';

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
  return { icon: Recycle, bg: '#ecfdf5', color: '#10b981', border: '#a7f3d0' };
};

/**
 * Currency formatter for Indian rupee standard
 */
const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  return `₹${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

/**
 * CO2e mass formatter
 */
const formatCO2 = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0 kg CO2e';
  return `${Number(val).toLocaleString(undefined, { maximumFractionDigits: 0 })} kg CO2e`;
};

/**
 * Timestamp formatter
 */
const formatDate = (isoString) => {
  if (!isoString) return 'Recent';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
};

export default function CircularAlternatives() {
  const navigate = useNavigate();

  // Active factory state
  const [factoryId, setFactoryId] = useState(null);
  const [factoryName, setFactoryName] = useState('');
  const [isResolvingFactory, setIsResolvingFactory] = useState(true);

  // Recommendations state from backend
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal inspection state
  const [activeModalAlt, setActiveModalAlt] = useState(null);

  /**
   * STEP 1: Determine the active factory_id using the application flow
   */
  useEffect(() => {
    let isMounted = true;

    async function resolveFactory() {
      setIsResolvingFactory(true);
      try {
        // 1. Check ecoloop_emission_results
        const savedResults = localStorage.getItem('ecoloop_emission_results');
        if (savedResults) {
          const parsed = JSON.parse(savedResults);
          if (parsed.factoryId) {
            if (isMounted) {
              setFactoryId(parsed.factoryId);
              setFactoryName(parsed.factoryName || 'Selected Facility');
              setIsResolvingFactory(false);
              return;
            }
          }
        }

        // 2. Check ecoloop_current_factory_id
        const savedCurrentId = localStorage.getItem('ecoloop_current_factory_id');
        if (savedCurrentId && Number(savedCurrentId) > 0) {
          if (isMounted) {
            setFactoryId(Number(savedCurrentId));
            setFactoryName('Selected Facility');
            setIsResolvingFactory(false);
            return;
          }
        }

        // 3. Check ecoloop_factory_data
        const savedFactory = localStorage.getItem('ecoloop_factory_data');
        if (savedFactory) {
          const parsed = JSON.parse(savedFactory);
          if (parsed.factoryId) {
            if (isMounted) {
              setFactoryId(parsed.factoryId);
              setFactoryName(parsed.factoryName || 'Selected Facility');
              setIsResolvingFactory(false);
              return;
            }
          }

          if (parsed.factoryName) {
            try {
              const factories = await getFactories();
              const matched = factories.find(
                (f) => f.name && f.name.toLowerCase().trim() === parsed.factoryName.toLowerCase().trim()
              );
              if (matched && matched.id && isMounted) {
                setFactoryId(matched.id);
                setFactoryName(matched.name);
                setIsResolvingFactory(false);
                return;
              }
            } catch (apiErr) {
              console.warn('Could not query factories list:', apiErr);
            }
          }
        }

        // 4. Fallback: If no factory in localStorage, check database factories list
        // and match active default factory from application (e.g. ABC Manufacturing)
        try {
          const factories = await getFactories();
          if (factories && factories.length > 0) {
            const defaultMatched = factories.find(
              (f) => f.name && f.name.toLowerCase().trim() === 'greentech manufacturing'
            ) || factories.find(
              (f) => f.name && f.name.toLowerCase().trim() === 'abc manufacturing'
            );
            const chosen = defaultMatched || factories[0];
            if (chosen && chosen.id && isMounted) {
              setFactoryId(chosen.id);
              setFactoryName(chosen.name);
              setIsResolvingFactory(false);
              return;
            }
          }
        } catch (apiErr) {
          console.warn('Could not query fallback factories list:', apiErr);
        }

        // No factory found
        if (isMounted) {
          setFactoryId(null);
          setFactoryName('');
          setIsResolvingFactory(false);
        }
      } catch (err) {
        console.error('Error resolving factory for circular alternatives:', err);
        if (isMounted) {
          setFactoryId(null);
          setIsResolvingFactory(false);
        }
      }
    }

    resolveFactory();
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * STEP 2: Fetch recommendations from FastAPI backend for the resolved factory
   */
  const fetchRecommendations = useCallback(async () => {
    if (!factoryId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getFactoryRecommendations(factoryId);
      if (Array.isArray(data)) {
        // Sort recommendations: High > Medium > Low, then newest first
        const priorityRank = { high: 1, medium: 2, low: 3 };
        const sorted = [...data].sort((a, b) => {
          const pA = priorityRank[a.priority?.toLowerCase()] || 4;
          const pB = priorityRank[b.priority?.toLowerCase()] || 4;
          if (pA !== pB) return pA - pB;
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          if (dateA !== dateB) return dateB - dateA;
          return (b.id || 0) - (a.id || 0);
        });
        setRecommendations(sorted);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error('Failed to load factory circular alternatives:', err);
      const errMsg = err.message || '';
      if (errMsg.includes('connect') || errMsg.includes('Failed to fetch')) {
        setError('Unable to connect to EcoLoop API. Please verify that the backend server is running on port 8000.');
      } else {
        setError(errMsg || 'Unable to load circular alternatives.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [factoryId]);

  useEffect(() => {
    if (factoryId) {
      fetchRecommendations();
    }
  }, [factoryId, fetchRecommendations]);

  // -------------------------------------------------------------
  // RENDER: Resolving Factory Spinner
  // -------------------------------------------------------------
  if (isResolvingFactory) {
    return (
      <div style={{ maxWidth: '640px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3.5rem 2rem', alignItems: 'center' }}>
          <Loader2 size={36} className="spinning" style={{ color: 'var(--primary)', marginBottom: '1.25rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Verifying factory profile...
          </h3>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: No Factory Selected State
  // -------------------------------------------------------------
  if (!factoryId) {
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
            No factory selected
          </h3>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '440px', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            Submit factory operational data to discover practical circular economy alternatives and resource recovery pathways.
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Disclaimer Banner */}
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
          <span>
            Persisted circular alternatives: Resource recovery and CO₂ reduction values are illustrative demo estimates based on operational hotspot profiles.
          </span>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            background: '#dbeafe',
            color: '#1e40af',
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            fontWeight: 600
          }}
        >
          FastAPI + MySQL (ecoloop_db)
        </span>
      </div>

      {/* Header */}
      <div className="page-intro" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="page-intro-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Recycle size={24} style={{ color: 'var(--primary)' }} />
              <span>Circular Economy Alternatives</span>
            </h2>
            <p className="page-intro-desc">
              Practical circular economy, material recovery, and closed-loop pathways tailored to your emission hotspots.
              {factoryName && (
                <span style={{ fontWeight: 600, color: 'var(--text-main)', marginLeft: '0.4rem' }}>
                  • Facility: {factoryName} (ID: #{factoryId})
                </span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={fetchRecommendations}
              disabled={isLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              title="Fetch latest circular alternatives from MySQL"
            >
              <RefreshCw size={14} className={isLoading ? 'spinning' : ''} />
              <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/recommendations')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Sparkles size={15} />
              <span>AI Recommendations</span>
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/factory-data')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Factory size={15} />
              <span>Factory Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          RENDER: Error State
          ------------------------------------------------------------- */}
      {error && (
        <div
          className="card"
          style={{
            padding: '1.5rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem'
          }}
        >
          <AlertCircle size={22} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 0.35rem', color: '#991b1b', fontSize: '1rem', fontWeight: 700 }}>
              Unable to load circular alternatives
            </h4>
            <p style={{ margin: '0 0 1rem', color: '#b91c1c', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {error}
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={fetchRecommendations}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} />
              <span>Retry Request</span>
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          RENDER: Loading State
          ------------------------------------------------------------- */}
      {isLoading && recommendations.length === 0 && (
        <div style={{ maxWidth: '640px', margin: '3rem auto', textAlign: 'center' }}>
          <div className="card" style={{ padding: '3.5rem 2rem', alignItems: 'center' }}>
            <Loader2 size={40} className="spinning" style={{ color: 'var(--primary)', marginBottom: '1.25rem' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Loading circular alternatives...
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
              Retrieving persisted circular economy pathways from EcoLoop backend.
            </p>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          RENDER: Empty State (0 Recommendations in Database)
          ------------------------------------------------------------- */}
      {!isLoading && !error && recommendations.length === 0 && (
        <div style={{ maxWidth: '640px', margin: '3rem auto', textAlign: 'center' }}>
          <div className="card" style={{ padding: '3.5rem 2rem', alignItems: 'center' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                marginBottom: '1.25rem'
              }}
            >
              <Recycle size={34} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              No circular alternatives available yet
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '460px', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Submit factory operational data to detect primary emission hotspots and generate personalized circular economy alternatives.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/factory-data')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Sparkles size={16} />
                <span>Go to Factory Data</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/emission-analysis')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <BarChart3 size={16} />
                <span>View Emission Analysis</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          RENDER: Circular Alternatives List (Separate Cards)
          ------------------------------------------------------------- */}
      {!isLoading && recommendations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {recommendations.map((rec, index) => {
            const iconInfo = getCategoryIconInfo(rec.hotspot);
            const CategoryIcon = iconInfo.icon;
            const isFeatured = index === 0;

            return (
              <div
                key={rec.id}
                className={isFeatured ? 'rec-primary-card' : 'card'}
                style={
                  !isFeatured
                    ? {
                        padding: '1.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)'
                      }
                    : {}
                }
              >
                {/* Top Bar: Hotspot, Title, Badges & Timestamp */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      className="rec-icon"
                      style={{
                        backgroundColor: iconInfo.bg,
                        color: iconInfo.color,
                        border: `1px solid ${iconInfo.border}`
                      }}
                    >
                      <CategoryIcon size={24} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: iconInfo.color, fontWeight: 700 }}>
                          🔥 Emission Hotspot: {rec.hotspot}
                        </span>
                        {isFeatured && (
                          <span
                            style={{
                              backgroundColor: '#dcfce7',
                              color: '#166534',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '0.1rem 0.45rem',
                              borderRadius: '999px',
                              border: '1px solid #86efac'
                            }}
                          >
                            Primary Alternative
                          </span>
                        )}
                      </div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {rec.hotspot} Circular Substitution Pathway #{rec.id}
                      </h3>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <Badge variant={rec.hotspot}>{rec.hotspot}</Badge>
                    <Badge variant={rec.priority}>{rec.priority} Priority</Badge>
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        marginLeft: '0.25rem'
                      }}
                    >
                      <Clock size={13} />
                      <span>{formatDate(rec.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Callout Boxes: Circular Alternative (Featured) & Related Recommendation */}
                <div className="rec-callout-grid">
                  {/* Circular Alternative Box */}
                  <div className="rec-callout-box" style={{ borderLeft: '3px solid #3b82f6', backgroundColor: '#f0fdf4' }}>
                    <div className="rec-callout-title" style={{ color: '#2563eb' }}>
                      <Recycle size={16} />
                      <span>♻️ Circular Alternative Pathway</span>
                    </div>
                    <p className="rec-callout-content" style={{ color: 'var(--text-main)', lineHeight: 1.55, fontWeight: 500 }}>
                      {rec.circular_alternative || 'Transition to circular material loops and renewable energy procurement.'}
                    </p>
                  </div>

                  {/* Related Recommendation Box */}
                  <div className="rec-callout-box" style={{ borderLeft: '3px solid #10b981' }}>
                    <div className="rec-callout-title" style={{ color: '#059669' }}>
                      <Target size={15} />
                      <span>🤖 Related Recommendation</span>
                    </div>
                    <p className="rec-callout-content" style={{ color: 'var(--text-main)', lineHeight: 1.55 }}>
                      {rec.recommendation || 'Continuous equipment optimization and process efficiency.'}
                    </p>
                  </div>
                </div>

                {/* Metrics / Impact Section */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.25rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    {/* Estimated Cost */}
                    <div
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.65rem 1rem',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
                        💰 Estimated Cost
                      </span>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.15rem' }}>
                        {formatCurrency(rec.estimated_cost)}
                      </span>
                    </div>

                    {/* Estimated CO2 Reduction */}
                    <div
                      style={{
                        backgroundColor: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.65rem 1rem',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#047857', fontWeight: 700, letterSpacing: '0.04em' }}>
                        🌱 Estimated CO2 Reduction
                      </span>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#065f46', marginTop: '0.15rem' }}>
                        {formatCO2(rec.estimated_co2_reduction)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() =>
                        setActiveModalAlt({
                          id: rec.id,
                          hotspot: rec.hotspot,
                          priority: rec.priority,
                          estimatedCost: formatCurrency(rec.estimated_cost),
                          estimatedReduction: formatCO2(rec.estimated_co2_reduction),
                          recommendation: rec.recommendation,
                          circularAlternative: rec.circular_alternative,
                          createdAt: formatDate(rec.created_at),
                          steps: [
                            rec.circular_alternative,
                            rec.recommendation,
                            'Perform technical feasibility and material specification audit.',
                            'Partner with certified closed-loop suppliers and scrap valorization recyclers.',
                            'Track circularity transition index in monthly sustainability reports.'
                          ]
                        })
                      }
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <span>View Circular Details</span>
                      <ChevronRight size={15} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate('/what-if')}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <span>Simulate in What-If</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: Circular Alternative Details Modal
          ------------------------------------------------------------- */}
      {activeModalAlt && (
        <div className="modal-overlay" onClick={() => setActiveModalAlt(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-app)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    background: getCategoryIconInfo(activeModalAlt.hotspot).bg,
                    color: getCategoryIconInfo(activeModalAlt.hotspot).color,
                    border: `1px solid ${getCategoryIconInfo(activeModalAlt.hotspot).border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Recycle size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                    {activeModalAlt.hotspot} Circular Action Plan #{activeModalAlt.id}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Priority: {activeModalAlt.priority} • Created: {activeModalAlt.createdAt}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalAlt(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#ecfdf5', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#047857', fontWeight: 700 }}>
                    🌱 Est. CO2 Reduction
                  </span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#065f46', marginTop: '0.2rem' }}>
                    {activeModalAlt.estimatedReduction}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    💰 Estimated Cost
                  </span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {activeModalAlt.estimatedCost}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  ♻️ Circular Alternative Pathway:
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.55 }}>
                  {activeModalAlt.circularAlternative}
                </p>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  🤖 Related Recommendation:
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.55 }}>
                  {activeModalAlt.recommendation}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-main)' }}>
                  Circular Implementation Steps:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activeModalAlt.steps.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      <CheckCircle2 size={16} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
                      <span>{step}</span>
                    </div>
                  ))}
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
                <span>Simulate in What-If</span>
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
