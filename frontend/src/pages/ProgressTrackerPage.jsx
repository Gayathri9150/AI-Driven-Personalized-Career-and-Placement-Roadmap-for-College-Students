import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
  Database,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { api } from '../api';

export default function ProgressTrackerPage({ setActiveTab }) {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [placementCategories, setPlacementCategories] = useState([]);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const [dash, cats] = await Promise.all([
        api.getDashboard(),
        api.getPlacementCategories()
      ]);
      setDashboardData(dash);
      setPlacementCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const {
    student,
    target_role,
    holistic_readiness_score = 0,
    roadmap_progress = {},
    placement_stats = {},
    skill_gap_summary = {},
    recent_activities = []
  } = dashboardData || {};

  return (
    <div className="content-page">
      <div className="page-header">
        <div>
          <h2>
            <TrendingUp size={24} style={{ color: '#34d399' }} />
            Holistic Placement Progress & Analytics
          </h2>
          <p>
            Module 7: Persistent tracking of completed activities, diagnostic scores, skill acquisition, and career milestones
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '6px 14px', borderRadius: '100px', fontSize: '12px' }}>
          <Database size={14} style={{ color: '#34d399' }} />
          <span style={{ color: '#6ee7b7' }}>SQLite Persistent Storage Active</span>
        </div>
      </div>

      {/* Hero Readiness Overview Card */}
      <div className="card card-glow" style={{ marginBottom: '28px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 800,
              color: '#fff',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
            }}>
              {holistic_readiness_score}%
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-emerald">Comprehensive Index</span>
                <span className="badge badge-blue">{target_role?.title || 'Target Role'}</span>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>
                Campus Placement Readiness Index
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px', maxWidth: '600px' }}>
                Aggregated in real-time from skill gap closures (35%), roadmap curriculum (30%), placement quizzes (20%), and academic performance (15%).
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('roadmap')}>
              View Roadmap
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('placement')}>
              Take Practice Quiz
            </button>
          </div>
        </div>

        <div className="progress-bar-bg" style={{ marginTop: '20px', height: '10px' }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${holistic_readiness_score}%`, background: 'linear-gradient(90deg, #3b82f6, #10b981)' }}
          />
        </div>
      </div>

      {/* 3 Analytics Pillars */}
      <div className="grid-3" style={{ marginBottom: '28px' }}>
        {/* Pillar 1: Roadmap Completion */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: '#60a5fa' }} />
              Curriculum Roadmap
            </h3>
            <span className="badge badge-blue">{roadmap_progress.percentage || 0}%</span>
          </div>

          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {roadmap_progress.completed_items || 0} / {roadmap_progress.total_items || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Modules verified & completed
          </div>

          <div className="progress-bar-bg" style={{ marginBottom: '16px' }}>
            <div className="progress-bar-fill" style={{ width: `${roadmap_progress.percentage || 0}%` }} />
          </div>

          <button className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={() => setActiveTab('roadmap')}>
            Update Roadmap Items <ArrowRight size={13} />
          </button>
        </div>

        {/* Pillar 2: Placement Diagnostic Quizzes */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} style={{ color: '#fbbf24' }} />
              Placement Tests
            </h3>
            <span className="badge badge-amber">{placement_stats.total_tests || 0} Taken</span>
          </div>

          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {placement_stats.average_score ? `${placement_stats.average_score}%` : 'N/A'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Average assessment accuracy (Highest: {placement_stats.highest_score || 0}%)
          </div>

          <div className="progress-bar-bg" style={{ marginBottom: '16px' }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${placement_stats.average_score || 0}%`, background: 'linear-gradient(90deg, #f59e0b, #10b981)' }}
            />
          </div>

          <button className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={() => setActiveTab('placement')}>
            Practice Next Section <ArrowRight size={13} />
          </button>
        </div>

        {/* Pillar 3: Skill Gap Reductions */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: '#34d399' }} />
              Skill Benchmark Fit
            </h3>
            <span className="badge badge-emerald">{skill_gap_summary.readiness_pct || 0}% Fit</span>
          </div>

          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {skill_gap_summary.priority_counts?.Met || 0} Met
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            {skill_gap_summary.priority_counts?.High || 0} high-priority gaps remaining
          </div>

          <div className="progress-bar-bg" style={{ marginBottom: '16px' }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${skill_gap_summary.readiness_pct || 0}%`, background: 'linear-gradient(90deg, #8b5cf6, #34d399)' }}
            />
          </div>

          <button className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={() => setActiveTab('skill-gap')}>
            Check Priority Gaps <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Two Column Bottom: Category Breakdown vs Audit Feed */}
      <div className="grid-2">
        {/* Topic-Wise Placement Diagnostics */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            Diagnostic Performance by Topic Track
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {placementCategories.map((c) => {
              const score = c.best_score;
              return (
                <div key={c.category} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '13.5px' }}>{c.category}</strong>
                    <span style={{ fontSize: '12px', color: score !== null ? (score >= 70 ? '#34d399' : '#fbbf24') : 'var(--text-muted)', fontWeight: 600 }}>
                      {score !== null ? `Best: ${score}%` : 'Not Attempted'}
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${score || 0}%`,
                        background: score >= 70 ? '#10b981' : score >= 50 ? '#3b82f6' : '#f59e0b'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>{c.question_count} Questions</span>
                    <span>{c.attempts_count} Tests Completed</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity & Verification Audit Feed */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} style={{ color: '#60a5fa' }} />
            Persistent Activity & Audit Trail
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recent_activities.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: `3px solid ${act.activity_type === 'roadmap_completed' ? '#34d399' : '#60a5fa'}`
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{act.activity_title}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{act.timestamp}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {act.details}
                  </p>
                </div>
              </div>
            ))}
            {recent_activities.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '30px' }}>
                No persistent logs recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
