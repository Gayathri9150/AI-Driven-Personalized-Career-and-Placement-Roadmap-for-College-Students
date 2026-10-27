import React, { useState, useEffect } from 'react';
import {
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Briefcase,
  Award,
  Layers,
  AlertCircle
} from 'lucide-react';
import { api } from '../api';

export default function ProfilePage({ onProfileUpdated }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [student, setStudent] = useState({
    full_name: '',
    department: '',
    year_of_study: '3rd Year',
    roll_no: '',
    cgpa: 7.5,
    tenth_marks: 85.0,
    twelfth_marks: 85.0,
    college_name: 'Engineering College'
  });

  const [technicalSkills, setTechnicalSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');

  const [softSkills, setSoftSkills] = useState([]);
  const [newSoftSkill, setNewSoftSkill] = useState('');

  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState('');

  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ title: '', description: '', tech_stack: '', github_url: '' });
  const [showAddProject, setShowAddProject] = useState(false);

  const [certifications, setCertifications] = useState([]);
  const [newCert, setNewCert] = useState({ title: '', provider: '', year: '2024' });
  const [showAddCert, setShowAddCert] = useState(false);

  const [careerPreferences, setCareerPreferences] = useState({
    preferred_role: 'AI / ML Engineer',
    work_mode: 'Hybrid',
    company_type: 'Product Companies',
    preferred_locations: ['Bangalore', 'Hyderabad']
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const res = await api.getProfile();
      if (res.student) {
        setStudent(res.student);
      }
      if (res.profile) {
        setTechnicalSkills(res.profile.technical_skills || []);
        setSoftSkills(res.profile.soft_skills || []);
        setInterests(res.profile.interests || []);
        setProjects(res.profile.projects || []);
        setCertifications(res.profile.certifications || []);
        if (res.profile.career_preferences) {
          setCareerPreferences(res.profile.career_preferences);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const exists = technicalSkills.find(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase());
    if (exists) {
      alert('Skill already added!');
      return;
    }
    setTechnicalSkills([...technicalSkills, { name: newSkillName.trim(), level: newSkillLevel, years: 1 }]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (name) => {
    setTechnicalSkills(technicalSkills.filter(s => s.name !== name));
  };

  const handleAddSoftSkill = (e) => {
    e.preventDefault();
    if (!newSoftSkill.trim()) return;
    if (softSkills.includes(newSoftSkill.trim())) return;
    setSoftSkills([...softSkills, newSoftSkill.trim()]);
    setNewSoftSkill('');
  };

  const handleRemoveSoftSkill = (skill) => {
    setSoftSkills(softSkills.filter(s => s !== skill));
  };

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (!newInterest.trim()) return;
    if (interests.includes(newInterest.trim())) return;
    setInterests([...interests, newInterest.trim()]);
    setNewInterest('');
  };

  const handleRemoveInterest = (item) => {
    setInterests(interests.filter(i => i !== item));
  };

  const handleAddProjectSubmit = (e) => {
    e.preventDefault();
    if (!newProject.title.trim() || !newProject.description.trim()) {
      alert('Project title and description are required.');
      return;
    }
    const stackList = newProject.tech_stack.split(',').map(s => s.trim()).filter(Boolean);
    setProjects([...projects, { ...newProject, tech_stack: stackList }]);
    setNewProject({ title: '', description: '', tech_stack: '', github_url: '' });
    setShowAddProject(false);
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleAddCertSubmit = (e) => {
    e.preventDefault();
    if (!newCert.title.trim()) return;
    setCertifications([...certifications, newCert]);
    setNewCert({ title: '', provider: '', year: '2024' });
    setShowAddCert(false);
  };

  const handleRemoveCert = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async () => {
    // Validation
    if (!student.full_name.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (!student.department.trim()) {
      setErrorMsg('Department is required.');
      return;
    }
    if (student.cgpa < 0 || student.cgpa > 10) {
      setErrorMsg('CGPA must be between 0 and 10.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      await api.updateProfile({
        student,
        profile: {
          technical_skills: technicalSkills,
          soft_skills: softSkills,
          interests,
          projects,
          certifications,
          career_preferences: careerPreferences
        }
      });

      setSuccessMsg('Profile updated and saved persistently to database!');
      if (onProfileUpdated) onProfileUpdated();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
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
          <h2>Student Profile Management</h2>
          <p>Module 1: Maintain your academic details, skills, projects, and career preferences</p>
        </div>
        <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>
          {saving ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <Save size={16} />}
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-warning">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Section 1: Academic & Personal Info */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={18} style={{ color: '#60a5fa' }} />
          Academic & Personal Information
        </h3>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              value={student.full_name}
              onChange={(e) => setStudent({ ...student, full_name: e.target.value })}
              placeholder="e.g. Gayathri R."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department / Branch *</label>
            <input
              type="text"
              className="form-input"
              value={student.department}
              onChange={(e) => setStudent({ ...student, department: e.target.value })}
              placeholder="e.g. Computer Science & Engineering"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Year of Study *</label>
            <select
              className="form-select"
              value={student.year_of_study}
              onChange={(e) => setStudent({ ...student, year_of_study: e.target.value })}
            >
              <option value="1st Year">1st Year (Freshman)</option>
              <option value="2nd Year">2nd Year (Sophomore)</option>
              <option value="3rd Year">3rd Year (Junior)</option>
              <option value="4th Year">4th Year (Senior / Placement)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">College / Institute Name</label>
            <input
              type="text"
              className="form-input"
              value={student.college_name || ''}
              onChange={(e) => setStudent({ ...student, college_name: e.target.value })}
              placeholder="College Name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Roll / Register Number</label>
            <input
              type="text"
              className="form-input"
              value={student.roll_no || ''}
              onChange={(e) => setStudent({ ...student, roll_no: e.target.value })}
              placeholder="e.g. CS2023-042"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Current CGPA (0.0 - 10.0) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              className="form-input"
              value={student.cgpa}
              onChange={(e) => setStudent({ ...student, cgpa: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">10th Grade Percentage (%)</label>
            <input
              type="number"
              step="0.1"
              className="form-input"
              value={student.tenth_marks || ''}
              onChange={(e) => setStudent({ ...student, tenth_marks: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">12th / Diploma Percentage (%)</label>
            <input
              type="number"
              step="0.1"
              className="form-input"
              value={student.twelfth_marks || ''}
              onChange={(e) => setStudent({ ...student, twelfth_marks: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Technical Skills with Proficiency Level */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: '#a78bfa' }} />
              Technical Skills & Proficiency Levels
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Accurate proficiency levels feed directly into the AI recommendation and skill-gap algorithm.
            </p>
          </div>
        </div>

        {/* Add Skill Form */}
        <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-input"
            style={{ flex: 2, minWidth: '200px' }}
            placeholder="Skill name (e.g. Python, Docker, React, SQL)"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
          />
          <select
            className="form-select"
            style={{ flex: 1, minWidth: '150px' }}
            value={newSkillLevel}
            onChange={(e) => setNewSkillLevel(e.target.value)}
          >
            <option value="Beginner">Beginner (Level 1)</option>
            <option value="Intermediate">Intermediate (Level 2)</option>
            <option value="Advanced">Advanced (Level 3)</option>
          </select>
          <button type="submit" className="btn btn-secondary">
            <Plus size={16} /> Add Skill
          </button>
        </form>

        {/* Skills Tag Cloud / Table */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {technicalSkills.map((s) => (
            <div
              key={s.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{s.name}</span>
              <span className={`badge ${s.level === 'Advanced' ? 'badge-emerald' : s.level === 'Intermediate' ? 'badge-blue' : 'badge-amber'}`} style={{ fontSize: '10px' }}>
                {s.level}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(s.name)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                title="Remove Skill"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {technicalSkills.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No technical skills added yet.</p>
          )}
        </div>
      </div>

      {/* Section 3: Soft Skills & Domains of Interest */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Soft Skills */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Soft Skills</h3>
          <form onSubmit={handleAddSoftSkill} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Communication, Problem Solving"
              value={newSoftSkill}
              onChange={(e) => setNewSoftSkill(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary btn-sm">Add</button>
          </form>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {softSkills.map((sk) => (
              <span key={sk} className="badge badge-purple" style={{ padding: '6px 10px', fontSize: '12px' }}>
                {sk}
                <button
                  type="button"
                  onClick={() => handleRemoveSoftSkill(sk)}
                  style={{ background: 'transparent', border: 'none', color: 'inherit', marginLeft: '6px', cursor: 'pointer' }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Areas of Interest */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Interests & Domains</h3>
          <form onSubmit={handleAddInterest} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Artificial Intelligence, Cloud"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary btn-sm">Add</button>
          </form>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {interests.map((it) => (
              <span key={it} className="badge badge-blue" style={{ padding: '6px 10px', fontSize: '12px' }}>
                {it}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(it)}
                  style={{ background: 'transparent', border: 'none', color: 'inherit', marginLeft: '6px', cursor: 'pointer' }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4: Projects Portfolio */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} style={{ color: '#34d399' }} />
              Academic & Personal Projects
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Projects are analyzed by our TF-IDF engine to match industry domain terminology.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAddProject(!showAddProject)}>
            <Plus size={14} /> Add Project
          </button>
        </div>

        {showAddProject && (
          <form onSubmit={handleAddProjectSubmit} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '18px' }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Project Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Automated Crop Disease Detection using CNN"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tech Stack (comma separated) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Python, PyTorch, FastAPI, OpenCV"
                  value={newProject.tech_stack}
                  onChange={(e) => setNewProject({ ...newProject, tech_stack: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-textarea"
                placeholder="Explain the problem statement, implementation details, and impact..."
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">GitHub Repository URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://github.com/..."
                value={newProject.github_url}
                onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddProject(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm">Save Project</button>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {projects.map((p, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#f3f4f6' }}>{p.title}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                    {p.description}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {(p.tech_stack || []).map((t, tidx) => (
                      <span key={tidx} className="badge badge-neutral" style={{ fontSize: '11px' }}>{t}</span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(idx)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No projects added yet.</p>
          )}
        </div>
      </div>

      {/* Section 5: Certifications & Career Preferences */}
      <div className="grid-2">
        {/* Certifications */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} style={{ color: '#fbbf24' }} />
              Certifications Completed
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAddCert(!showAddCert)}>
              <Plus size={14} /> Add
            </button>
          </div>

          {showAddCert && (
            <form onSubmit={handleAddCertSubmit} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Certification Name"
                style={{ marginBottom: '8px' }}
                value={newCert.title}
                onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
              />
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Provider (e.g. Coursera, AWS)"
                  value={newCert.provider}
                  onChange={(e) => setNewCert({ ...newCert, provider: e.target.value })}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Year (e.g. 2024)"
                  style={{ width: '90px' }}
                  value={newCert.year}
                  onChange={(e) => setNewCert({ ...newCert, year: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddCert(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Add</button>
              </div>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {certifications.map((c, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                <div>
                  <strong>{c.title}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.provider} • {c.year}</div>
                </div>
                <button onClick={() => handleRemoveCert(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {certifications.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No certifications added yet.</p>}
          </div>
        </div>

        {/* Career Preferences */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: '#06b6d4' }} />
            Career Preferences
          </h3>

          <div className="form-group">
            <label className="form-label">Preferred Work Mode</label>
            <select
              className="form-select"
              value={careerPreferences.work_mode}
              onChange={(e) => setCareerPreferences({ ...careerPreferences, work_mode: e.target.value })}
            >
              <option value="Hybrid">Hybrid (Flexible Office + Remote)</option>
              <option value="Remote">100% Remote</option>
              <option value="Onsite">On-site / Campus Office</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Target Company Tier / Type</label>
            <select
              className="form-select"
              value={careerPreferences.company_type}
              onChange={(e) => setCareerPreferences({ ...careerPreferences, company_type: e.target.value })}
            >
              <option value="Product Companies & AI Labs">Product Companies & AI Research Labs</option>
              <option value="High-Growth Tech Startups">High-Growth Tech Startups</option>
              <option value="IT Services & Consulting MNCs">IT Services & Consulting MNCs</option>
              <option value="Public Sector / Core Engineering">Public Sector / Core Engineering</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
