import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Award,
  Clock,
  Layers,
  ExternalLink,
  Code2,
  CheckCircle2,
  FileText,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { api } from '../api';

export default function ProjectsCertsPage({ activeGoalId }) {
  const [loading, setLoading] = useState(true);
  const [allRoles, setAllRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(activeGoalId || 'ai_ml_engineer');
  const [activeTab, setActiveTabState] = useState('projects'); // 'projects' or 'certifications'
  const [data, setData] = useState({ projects: [], certifications: [] });

  useEffect(() => {
    loadRolesAndData();
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      loadData(selectedRoleId);
    }
  }, [selectedRoleId]);

  const loadRolesAndData = async () => {
    try {
      setLoading(true);
      const roles = await api.getAllRoles();
      setAllRoles(roles);
      const target = activeGoalId || (roles[0] && roles[0].id) || 'ai_ml_engineer';
      setSelectedRoleId(target);
      const res = await api.getProjectsAndCerts(target);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async (roleId) => {
    try {
      const res = await api.getProjectsAndCerts(roleId);
      setData(res);
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

  const { projects = [], certifications = [] } = data;
  const currentRole = allRoles.find(r => r.id === selectedRoleId);

  return (
    <div className="content-page">
      <div className="page-header">
        <div>
          <h2>
            <FolderGit2 size={24} style={{ color: '#34d399' }} />
            Industry Projects & Certifications
          </h2>
          <p>
            Module 5: Portfolio-grade projects and globally recognized credentials tailored to prove your readiness to hiring managers
          </p>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Target Role:</label>
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <button
          className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTabState('projects')}
        >
          <Code2 size={16} /> Recommended Projects ({projects.length})
        </button>
        <button
          className={`btn ${activeTab === 'certifications' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTabState('certifications')}
        >
          <Award size={16} /> Verified Certifications ({certifications.length})
        </button>
      </div>

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {projects.map((proj) => (
            <div key={proj.id} className="card card-glow">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className="badge badge-emerald">{proj.difficulty}</span>
                    <span className="badge badge-neutral" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {proj.estimated_duration}
                    </span>
                    <span className="badge badge-purple">{currentRole?.title}</span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {proj.title}
                  </h3>
                </div>

                <a
                  href={proj.repo_starter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  <ExternalLink size={14} /> Starter Template / Repo
                </a>
              </div>

              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                {proj.description}
              </p>

              {/* Architecture Summary */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#93c5fd', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} /> System Architecture Overview:
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {proj.architecture_summary}
                </div>
              </div>

              {/* Skills Developed */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Competencies & Skills Developed:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {proj.skills_developed.map((s, sidx) => (
                    <span key={sidx} className="badge badge-blue">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Deliverables */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Key Deliverables for Placement Portfolio:
                </div>
                <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {proj.key_deliverables.map((del, didx) => (
                    <li key={didx}>{del}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              No suggested projects cataloged for this role yet.
            </div>
          )}
        </div>
      )}

      {/* Certifications Tab */}
      {activeTab === 'certifications' && (
        <div className="grid-2">
          {certifications.map((cert) => (
            <div key={cert.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span className="badge badge-amber">{cert.provider}</span>
                  {cert.exam_code && (
                    <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                      {cert.exam_code}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {cert.title}
                </h3>

                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  <span>Prep Time: <strong style={{ color: 'var(--text-primary)' }}>{cert.prep_time_weeks} Weeks</strong></span>
                  <span>Cost: <strong style={{ color: '#34d399' }}>{cert.cost_type}</strong></span>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Validated Competencies:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {cert.skills_covered.map((sc, scidx) => (
                      <span key={scidx} className="badge badge-neutral" style={{ fontSize: '11px' }}>
                        {sc}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '6px', marginBottom: '16px' }}>
                  Recognition: <strong>{cert.industry_recognition}</strong>
                </div>
              </div>

              <a
                href={cert.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{ width: '100%' }}
              >
                <ExternalLink size={14} /> Official Certification Portal
              </a>
            </div>
          ))}

          {certifications.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              No certifications cataloged for this role yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
