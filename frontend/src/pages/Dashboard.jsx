import React from 'react';
import {
  Sparkles,
  Target,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  BookOpen,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import RadarChart from '../components/RadarChart';

export default function Dashboard({ data, setActiveTab, onRefresh }) {
  if (!data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const {
    student,
    target_role,
    holistic_readiness_score,
    roadmap_progress,
    placement_stats,
    skill_gap_summary,
    top_recommendations,
    recent_activities
  } = data;

  return (
    <div className="content-page">
      {/* Header Banner */}
      <div className="page-header">
        <div>
          <h2>
            Welcome back, {student?.full_name || 'Student'}! 👋
          </h2>
          <p>
            {student?.department} • {student?.year_of_study} • CGPA: {student?.cgpa} • {student?.college_name}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setActiveTab('profile')}>
            Edit Profile
          </button>
          <button className="btn btn-primary" onClick={() => setActiveTab('placement')}>
            Practice Placement Tests
          </button>
        </div>
      </div>

      {/* Target Goal Announcement Card */}
      {target_role && (
        <div className="card card-glow" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <BrainCircuit size={28} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-blue">Active Career Goal</span>
                  <span className="badge badge-emerald">{target_role.industry_demand}</span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>
                  {target_role.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '650px', marginTop: '2px' }}>
                  {target_role.description}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('skill-gap')}>
                View Skill Gaps
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('roadmap')}>
                Continue Learning Roadmap <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4 Metric Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <Award size={26} />
          </div>
          <div>
            <div className="stat-value">{holistic_readiness_score}%</div>
            <div className="stat-label">Placement Readiness</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Target size={26} />
          </div>
          <div>
            <div className="stat-value">
              {skill_gap_summary?.priority_counts?.High || 0}
            </div>
            <div className="stat-label">Priority Skill Gaps</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div className="stat-value">
              {roadmap_progress?.completed_items || 0} / {roadmap_progress?.total_items || 0}
            </div>
            <div className="stat-label">Roadmap Modules Done</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
            <TrendingUp size={26} />
          </div>
          <div>
            <div className="stat-value">
              {placement_stats?.average_score ? `${placement_stats.average_score}%` : 'N/A'}
            </div>
            <div className="stat-label">Avg Quiz Score ({placement_stats?.total_tests || 0} tests)</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Radar Chart vs Top AI Career Recommendations */}
      <div className="grid-2" style={{ marginBottom: '28px' }}>
        {/* Left: Skill Gap Radar Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Target Skill Profile vs Benchmark</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Comparing current skills vs industry standards for {target_role?.title || 'Selected Role'}
              </p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('skill-gap')}>
              Full Matrix <ChevronRight size={13} />
            </button>
          </div>

          {skill_gap_summary?.radar_chart?.labels ? (
            <RadarChart
              labels={skill_gap_summary.radar_chart.labels}
              benchmarkData={skill_gap_summary.radar_chart.benchmark_dataset}
              studentData={skill_gap_summary.radar_chart.student_dataset}
              size={360}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No skill data available
            </div>
          )}
        </div>

        {/* Right: AI Career Recommendations */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: '#60a5fa' }} />
                AI Career Matches
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Calculated by multi-factor ML algorithm matching your profile
              </p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('recommendations')}>
              View All Roles <ChevronRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {top_recommendations?.map((rec) => (
              <div
                key={rec.role_id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  transition: 'border-color 0.2s'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '14.5px', fontWeight: 700 }}>{rec.title}</h4>
                    {rec.role_id === target_role?.id && (
                      <span className="badge badge-emerald" style={{ fontSize: '10px' }}>Active Goal</span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {rec.explanation?.substring(0, 110)}...
                  </p>
                </div>

                <div style={{ textAlign: 'right', minWidth: '85px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: rec.match_score > 60 ? '#34d399' : '#60a5fa' }}>
                    {rec.match_score}%
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Match Score</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Roadmap Progress & Activity Log */}
      <div className="grid-2">
        {/* Current Roadmap Progress */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} style={{ color: '#a78bfa' }} />
              Personalized Learning Roadmap
            </h3>
            <span className="badge badge-purple">{roadmap_progress?.percentage || 0}% Completed</span>
          </div>

          <div className="progress-bar-bg" style={{ marginBottom: '18px' }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${roadmap_progress?.percentage || 0}%`, background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)' }}
            ></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            <span>{roadmap_progress?.completed_items || 0} topics completed</span>
            <span>{roadmap_progress?.in_progress_items || 0} in progress</span>
            <span>{(roadmap_progress?.total_items || 0) - (roadmap_progress?.completed_items || 0)} pending</span>
          </div>

          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setActiveTab('roadmap')}>
            Open Roadmap & Study Resources <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Recent Activities Log */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} style={{ color: '#34d399' }} />
              Recent Progress Activity
            </h3>
            <span className="badge badge-neutral">Real-time Log</span>
          </div>

          {recent_activities?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recent_activities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12.5px'
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: act.activity_type === 'roadmap_completed' ? '#34d399' : '#60a5fa',
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{act.activity_title}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '11px' }}>{act.details}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {act.timestamp?.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
              No activities logged yet. Take a placement test or complete a roadmap milestone to see logs here!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
