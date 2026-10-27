import React from 'react';
import {
  LayoutDashboard,
  UserCircle,
  Sparkles,
  GitCompare,
  Compass,
  FolderGit2,
  GraduationCap,
  TrendingUp,
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, student, onOpenAuth }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview' },
    { id: 'profile', label: 'Student Profile', icon: UserCircle, section: 'Modules' },
    { id: 'recommendations', label: 'Career Recommendation', icon: Sparkles, section: 'Modules' },
    { id: 'skill-gap', label: 'Skill-Gap Analysis', icon: GitCompare, section: 'Modules' },
    { id: 'roadmap', label: 'Personalized Roadmap', icon: Compass, section: 'Modules' },
    { id: 'projects-certs', label: 'Projects & Certifications', icon: FolderGit2, section: 'Modules' },
    { id: 'placement', label: 'Placement Preparation', icon: GraduationCap, section: 'Modules' },
    { id: 'progress', label: 'Progress Tracking', icon: TrendingUp, section: 'Modules' },
  ];

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <aside className="sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="logo-badge">
          <Compass size={24} />
        </div>
        <div className="brand-text">
          <h1>AI Career Roadmap</h1>
          <span>College Placement Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Overview</div>
        {navItems.filter(item => item.section === 'Overview').map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
            </button>
          );
        })}

        <div className="nav-section-label" style={{ marginTop: '10px' }}>Platform Modules</div>
        {navItems.filter(item => item.section === 'Modules').map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
            </button>
          );
        })}
      </nav>

      {/* Footer Student Card */}
      <div className="sidebar-footer">
        {student ? (
          <div className="student-card-mini" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div className="student-avatar">
                {getInitials(student.full_name)}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {student.full_name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {student.year_of_study || 'Student'}
                </div>
              </div>
            </div>
            <button 
              onClick={onOpenAuth}
              title="Switch Account / Login"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={onOpenAuth}>
            Sign In / Register
          </button>
        )}
      </div>
    </aside>
  );
}
