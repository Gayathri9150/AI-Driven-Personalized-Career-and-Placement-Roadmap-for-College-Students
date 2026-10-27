import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  Sparkles,
  ShieldCheck,
  PlayCircle,
  Circle,
  ArrowRight,
  Filter
} from 'lucide-react';
import { api } from '../api';

export default function RoadmapPage({ activeGoalId, setActiveTab }) {
  const [loading, setLoading] = useState(true);
  const [allRoles, setAllRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(activeGoalId || 'ai_ml_engineer');
  const [roadmapData, setRoadmapData] = useState(null);
  const [activePhaseFilter, setActivePhaseFilter] = useState('All');
  const [statusUpdating, setStatusUpdating] = useState({});

  useEffect(() => {
    loadRolesAndRoadmap();
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      loadRoadmap(selectedRoleId);
    }
  }, [selectedRoleId]);

  const loadRolesAndRoadmap = async () => {
    try {
      setLoading(true);
      const roles = await api.getAllRoles();
      setAllRoles(roles);
      const target = activeGoalId || (roles[0] && roles[0].id) || 'ai_ml_engineer';
      setSelectedRoleId(target);
      const res = await api.getRoadmap(target);
      setRoadmapData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRoadmap = async (roleId) => {
    try {
      const res = await api.getRoadmap(roleId);
      setRoadmapData(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.user_status === 'completed' 
      ? 'not_started' 
      : item.user_status === 'in_progress' 
      ? 'completed' 
      : 'in_progress';

    try {
      setStatusUpdating({ ...statusUpdating, [item.id]: true });
      await api.updateRoadmapItemStatus(item.id, nextStatus);
      // Reload roadmap data to reflect updated counts and state
      const res = await api.getRoadmap(selectedRoleId);
      setRoadmapData(res);
    } catch (err) {
      alert(err.message || 'Failed to update progress');
    } finally {
      setStatusUpdating({ ...statusUpdating, [item.id]: false });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const phases = roadmapData?.phases || [];
  const currentRole = allRoles.find(r => r.id === selectedRoleId);

  return (
    <div className="content-page">
      <div className="page-header">
        <div>
          <h2>
            <Compass size={24} style={{ color: '#38bdf8' }} />
            Personalized Sequential Learning Roadmap
          </h2>
          <p>
            Module 4: Structured multi-phase curriculum designed to systematically close identified skill gaps
          </p>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Roadmap Target:</label>
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

      {/* Progress Banner */}
      <div className="card card-glow" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                {currentRole?.title || 'Selected Role'} Progression
              </h3>
              <span className="badge badge-emerald">
                {roadmapData?.roadmap_progress_pct || 0}% Completed
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {roadmapData?.completed_items || 0} of {roadmapData?.total_items || 0} modules completed • {roadmapData?.in_progress_items || 0} in progress
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn btn-sm ${activePhaseFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActivePhaseFilter('All')}
            >
              All Phases
            </button>
            {phases.map((p) => (
              <button
                key={p.phase_num}
                className={`btn btn-sm ${activePhaseFilter === p.phase_num ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActivePhaseFilter(p.phase_num)}
              >
                Phase {p.phase_num}
              </button>
            ))}
          </div>
        </div>

        <div className="progress-bar-bg" style={{ marginTop: '16px' }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${roadmapData?.roadmap_progress_pct || 0}%` }}
          />
        </div>
      </div>

      {/* Phases Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {phases
          .filter(p => activePhaseFilter === 'All' || activePhaseFilter === p.phase_num)
          .map((phase) => (
            <div key={phase.phase_num} style={{ position: 'relative' }}>
              {/* Phase Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px'
                }}>
                  {phase.phase_num}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{phase.phase_title}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {phase.items.length} learning modules in this phase
                  </span>
                </div>
              </div>

              {/* Items Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {phase.items.map((item) => {
                  const isCompleted = item.user_status === 'completed';
                  const isInProgress = item.user_status === 'in_progress';
                  const isUpdating = statusUpdating[item.id];

                  return (
                    <div
                      key={item.id}
                      className="card"
                      style={{
                        borderColor: isCompleted ? 'rgba(16, 185, 129, 0.4)' : isInProgress ? 'rgba(59, 130, 246, 0.4)' : undefined,
                        background: isCompleted ? 'rgba(16, 185, 129, 0.04)' : undefined
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                            <span className="badge badge-purple">{item.skill_name}</span>
                            <span className="badge badge-blue">{item.difficulty}</span>
                            <span className="badge badge-neutral" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} /> {item.duration_hours} Hours
                            </span>
                            {item.is_verified && (
                              <span className="badge badge-emerald" title="Verified high-quality curriculum link">
                                <ShieldCheck size={12} /> Verified Resource
                              </span>
                            )}
                          </div>

                          <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {item.topic_title}
                          </h4>

                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                            {item.description}
                          </p>

                          {/* Learning Objectives */}
                          {item.learning_objectives?.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                                Learning Objectives:
                              </div>
                              <ul style={{ paddingLeft: '18px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {item.learning_objectives.map((obj, oidx) => (
                                  <li key={oidx}>{obj}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Right: Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                          {/* Toggle Completion Button */}
                          <button
                            className={`btn btn-sm ${
                              isCompleted ? 'btn-success' : isInProgress ? 'btn-primary' : 'btn-secondary'
                            }`}
                            onClick={() => handleToggleStatus(item)}
                            disabled={isUpdating}
                            style={{ minWidth: '130px' }}
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle2 size={15} /> Completed
                              </>
                            ) : isInProgress ? (
                              <>
                                <PlayCircle size={15} /> In Progress
                              </>
                            ) : (
                              <>
                                <Circle size={15} /> Not Started
                              </>
                            )}
                          </button>

                          {/* External Study Resource Link */}
                          <a
                            href={item.resource_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm"
                            style={{ minWidth: '130px' }}
                          >
                            <ExternalLink size={13} /> Open Course
                          </a>

                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Provider: {item.provider}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
