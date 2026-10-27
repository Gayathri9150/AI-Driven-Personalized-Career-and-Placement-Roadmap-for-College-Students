import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Target,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  Code2,
  BarChart3,
  Layers,
  ShieldAlert,
  CloudCog,
  AlertTriangle,
  ArrowRight,
  Info
} from 'lucide-react';
import { api } from '../api';

const ICONS = {
  BrainCircuit,
  Code2,
  BarChart3,
  Layers,
  ShieldAlert,
  CloudCog
};

export default function RecommendationsPage({ activeGoalId, onGoalSelected, setActiveTab }) {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.getRecommendations();
      setRecommendations(res.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGoal = async (roleId, roleTitle) => {
    try {
      await api.selectGoalRole(roleId);
      setActionMsg(`Active career goal set to ${roleTitle}!`);
      if (onGoalSelected) onGoalSelected(roleId);
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update goal');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="content-page">
      <div className="page-header">
        <div>
          <h2>
            <Sparkles size={24} style={{ color: '#60a5fa' }} />
            AI Career Recommendations
          </h2>
          <p>
            Module 2: Real-time ML matching engine comparing your technical profile, projects & coursework against industry benchmarks
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchRecommendations}>
          Recalculate Matches
        </button>
      </div>

      {actionMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Explanatory Banner on Algorithmic Transparency */}
      <div className="alert alert-info" style={{ marginBottom: '24px' }}>
        <Info size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>Transparent AI Matching Formula:</strong> Match scores (0 - 100%) are calculated dynamically using:
          40% Technical Skill Overlap & Proficiency Matrix + 25% TF-IDF Cosine Similarity on Project Abstracts + 15% Domain Interest Alignment + 10% Soft Skills + 10% Academic CGPA Eligibility.
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {recommendations.map((rec, index) => {
          const IconComponent = ICONS[rec.icon_name] || Sparkles;
          const isCurrentGoal = rec.role_id === activeGoalId;

          return (
            <div
              key={rec.role_id}
              className={`card ${isCurrentGoal ? 'card-glow' : ''}`}
              style={{
                borderColor: isCurrentGoal ? 'rgba(59, 130, 246, 0.4)' : undefined,
                background: isCurrentGoal ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(17, 24, 39, 0.9))' : undefined
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                {/* Left: Role identity & Description */}
                <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '320px' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: 'var(--radius-md)',
                      background: isCurrentGoal ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isCurrentGoal ? '#fff' : '#60a5fa',
                      flexShrink: 0
                    }}
                  >
                    <IconComponent size={26} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="badge badge-purple" style={{ fontSize: '11px' }}>#{index + 1} Match</span>
                      <span className="badge badge-blue">{rec.category}</span>
                      {isCurrentGoal && (
                        <span className="badge badge-emerald">Current Target Goal</span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '19px', fontWeight: 700, marginTop: '6px' }}>
                      {rec.title}
                    </h3>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '4px', maxWidth: '780px', lineHeight: 1.4 }}>
                      {rec.description}
                    </p>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      <span>Demand: <strong style={{ color: 'var(--text-primary)' }}>{rec.industry_demand}</strong></span>
                      <span>Salary: <strong style={{ color: 'var(--text-primary)' }}>{rec.avg_salary_range}</strong></span>
                      <span>Target CGPA: <strong style={{ color: 'var(--text-primary)' }}>{rec.target_cgpa}+</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right: Calculated Match Score */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '150px' }}>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 800,
                    color: rec.match_score >= 60 ? '#34d399' : rec.match_score >= 45 ? '#60a5fa' : '#fbbf24',
                    lineHeight: 1
                  }}>
                    {rec.match_score}%
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Match Confidence
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    {!isCurrentGoal ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSelectGoal(rec.role_id, rec.title)}
                      >
                        <Target size={14} /> Set as Goal
                      </button>
                    ) : (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setActiveTab('skill-gap')}
                      >
                        Analyze Gaps <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Explainability Section */}
              <div
                style={{
                  marginTop: '18px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-subtle)',
                  background: 'rgba(0, 0, 0, 0.15)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#93c5fd', marginBottom: '6px' }}>
                  💡 Why is this role recommended?
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {rec.explanation}
                </p>

                {/* Breakdown Subscores */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '10px',
                  marginTop: '12px'
                }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px', fontSize: '11.5px' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Tech Skill Overlap</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#60a5fa' }}>{rec.score_breakdown.technical_skills_score}%</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px', fontSize: '11.5px' }}>
                    <div style={{ color: 'var(--text-muted)' }}>TF-IDF Project Fit</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#a78bfa' }}>{rec.score_breakdown.semantic_similarity_score}%</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px', fontSize: '11.5px' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Domain Interests</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#34d399' }}>{rec.score_breakdown.domain_interest_score}%</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px', fontSize: '11.5px' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Soft Skills Match</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#fbbf24' }}>{rec.score_breakdown.soft_skills_score}%</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px', fontSize: '11.5px' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Academic Eligibility</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#f43f5e' }}>{rec.score_breakdown.academic_score}%</div>
                  </div>
                </div>

                {/* Key Strengths & Gaps tags */}
                <div style={{ display: 'flex', gap: '20px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {rec.strengths?.length > 0 && (
                    <div style={{ fontSize: '12px' }}>
                      <span style={{ color: '#34d399', fontWeight: 600 }}>Strengths: </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{rec.strengths.join(', ')}</span>
                    </div>
                  )}
                  {rec.critical_missing?.length > 0 && (
                    <div style={{ fontSize: '12px' }}>
                      <span style={{ color: '#f43f5e', fontWeight: 600 }}>Critical Missing: </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{rec.critical_missing.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
