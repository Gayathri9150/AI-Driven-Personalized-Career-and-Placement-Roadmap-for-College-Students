import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { api } from '../api';
import RadarChart from '../components/RadarChart';

export default function SkillGapPage({ activeGoalId, setActiveTab }) {
  const [loading, setLoading] = useState(true);
  const [allRoles, setAllRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(activeGoalId || 'ai_ml_engineer');
  const [analysis, setAnalysis] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => {
    loadRolesAndAnalysis();
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      loadAnalysis(selectedRoleId);
    }
  }, [selectedRoleId]);

  const loadRolesAndAnalysis = async () => {
    try {
      setLoading(true);
      const roles = await api.getAllRoles();
      setAllRoles(roles);
      const target = activeGoalId || (roles[0] && roles[0].id) || 'ai_ml_engineer';
      setSelectedRoleId(target);
      const res = await api.getSkillGap(target);
      setAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalysis = async (roleId) => {
    try {
      const res = await api.getSkillGap(roleId);
      setAnalysis(res);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const priorityCounts = analysis?.priority_counts || {};
  const gapMatrix = analysis?.gap_matrix || [];

  const filteredGaps = gapMatrix.filter(item => {
    if (priorityFilter === 'All') return true;
    if (priorityFilter === 'High') return item.priority === 'High';
    if (priorityFilter === 'Medium') return item.priority === 'Medium';
    if (priorityFilter === 'Low') return item.priority === 'Low';
    if (priorityFilter === 'Met') return item.status.includes('Met');
    return true;
  });

  return (
    <div className="content-page">
      <div className="page-header">
        <div>
          <h2>
            <GitCompare size={24} style={{ color: '#fbbf24' }} />
            Skill-Gap Analysis & Proficiency Matrix
          </h2>
          <p>
            Module 3: Benchmark role requirements vs your acquired skills, prioritizing critical gaps for immediate closure
          </p>
        </div>

        {/* Role Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Select Role to Analyze:</label>
          <select
            className="form-select"
            style={{ width: '240px', padding: '8px 12px' }}
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
          >
            {allRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Priority Summary Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div
          className="stat-card"
          onClick={() => setPriorityFilter(priorityFilter === 'High' ? 'All' : 'High')}
          style={{ cursor: 'pointer', borderColor: priorityFilter === 'High' ? '#f43f5e' : undefined }}
        >
          <div className="stat-icon-wrapper" style={{ background: 'var(--accent-rose-bg)', color: '#f43f5e' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#f43f5e' }}>{priorityCounts.High || 0}</div>
            <div className="stat-label">High Priority Gaps</div>
          </div>
        </div>

        <div
          className="stat-card"
          onClick={() => setPriorityFilter(priorityFilter === 'Medium' ? 'All' : 'Medium')}
          style={{ cursor: 'pointer', borderColor: priorityFilter === 'Medium' ? '#f59e0b' : undefined }}
        >
          <div className="stat-icon-wrapper" style={{ background: 'var(--accent-amber-bg)', color: '#fbbf24' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#fbbf24' }}>{priorityCounts.Medium || 0}</div>
            <div className="stat-label">Medium Priority Gaps</div>
          </div>
        </div>

        <div
          className="stat-card"
          onClick={() => setPriorityFilter(priorityFilter === 'Low' ? 'All' : 'Low')}
          style={{ cursor: 'pointer', borderColor: priorityFilter === 'Low' ? '#3b82f6' : undefined }}
        >
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <HelpCircle size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#60a5fa' }}>{priorityCounts.Low || 0}</div>
            <div className="stat-label">Low Priority Gaps</div>
          </div>
        </div>

        <div
          className="stat-card"
          onClick={() => setPriorityFilter(priorityFilter === 'Met' ? 'All' : 'Met')}
          style={{ cursor: 'pointer', borderColor: priorityFilter === 'Met' ? '#10b981' : undefined }}
        >
          <div className="stat-icon-wrapper" style={{ background: 'var(--accent-emerald-bg)', color: '#34d399' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#34d399' }}>{priorityCounts.Met || 0}</div>
            <div className="stat-label">Skills Met / Exceeded</div>
          </div>
        </div>
      </div>

      {/* Visual Chart + Action Panel */}
      <div className="grid-2" style={{ marginBottom: '28px' }}>
        {/* Radar Chart */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
            Skill Proficiency Comparison Radar
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Multi-axis radar contrasting your skill levels (purple) against industry benchmarks (cyan).
          </p>

          {analysis?.radar_chart?.labels ? (
            <RadarChart
              labels={analysis.radar_chart.labels}
              benchmarkData={analysis.radar_chart.benchmark_dataset}
              studentData={analysis.radar_chart.student_dataset}
              size={360}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>No radar data available</div>
          )}
        </div>

        {/* Readiness Overview & Recommendation Action */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
              Overall Role Readiness for {analysis?.role_title}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Calculated based on cumulative proficiency ratio across all core and secondary competencies.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
                border: '2px solid #3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 800,
                color: '#60a5fa'
              }}>
                {analysis?.overall_readiness_pct || 0}%
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700 }}>
                  {analysis?.overall_readiness_pct > 70 ? 'High Placement Readiness' : analysis?.overall_readiness_pct > 40 ? 'Moderate Preparation Needed' : 'Early Stage Foundation'}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {priorityCounts.High || 0} critical competencies must be acquired before technical interviews.
                </div>
              </div>
            </div>

            <div className="progress-bar-bg" style={{ marginBottom: '24px' }}>
              <div
                className="progress-bar-fill"
                style={{ width: `${analysis?.overall_readiness_pct || 0}%` }}
              />
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#fcd34d', marginBottom: '4px' }}>
                Recommended Strategy:
              </h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Focus your next 2-3 weeks exclusively on the <strong>High Priority</strong> missing core skills. Once completed, your match score for {analysis?.role_title} will surge significantly.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => setActiveTab('roadmap')}
            >
              <Compass size={16} /> Open Tailored Learning Roadmap
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Skill Comparison Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Detailed Skill Gap Matrix</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Showing {filteredGaps.length} skills (Filter: {priorityFilter})
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['All', 'High', 'Medium', 'Low', 'Met'].map((f) => (
              <button
                key={f}
                className={`btn btn-sm ${priorityFilter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPriorityFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Skill Name</th>
                <th>Role Type</th>
                <th>Required Benchmark</th>
                <th>Your Current Level</th>
                <th>Gap Status</th>
                <th>Priority</th>
                <th>Action Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {filteredGaps.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{item.skill_name}</td>
                  <td>
                    {item.is_core ? (
                      <span className="badge badge-rose" style={{ fontSize: '10.5px' }}>Core Must-Have</span>
                    ) : (
                      <span className="badge badge-neutral" style={{ fontSize: '10.5px' }}>Good to have</span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-blue">{item.required_level}</span>
                  </td>
                  <td>
                    <span className={`badge ${item.student_level === 'Not Acquired' ? 'badge-neutral' : item.student_level === 'Advanced' ? 'badge-emerald' : 'badge-purple'}`}>
                      {item.student_level}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      item.status.includes('Met')
                        ? 'badge-emerald'
                        : item.status.includes('Critical')
                        ? 'badge-rose'
                        : 'badge-amber'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    {item.priority === 'High' && <span className="badge badge-rose">High</span>}
                    {item.priority === 'Medium' && <span className="badge badge-amber">Medium</span>}
                    {item.priority === 'Low' && <span className="badge badge-blue">Low</span>}
                    {item.priority === 'None' && <span className="badge badge-emerald">None (Met)</span>}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                    {item.action_advice}
                  </td>
                </tr>
              ))}
              {filteredGaps.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No skills found for filter "{priorityFilter}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
