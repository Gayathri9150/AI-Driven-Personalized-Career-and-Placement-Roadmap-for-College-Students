import React from 'react';
import { Target, Award, Menu, RefreshCw, UserCheck } from 'lucide-react';

export default function Navbar({ targetRole, readinessScore, onRefresh, onOpenAuth, onToggleMobileSidebar, student }) {
  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          className="btn btn-secondary mobile-menu-btn" 
          onClick={onToggleMobileSidebar}
          style={{ display: 'none', padding: '8px' }}
        >
          <Menu size={20} />
        </button>

        {targetRole ? (
          <div className="nav-goal-pill">
            <Target size={15} style={{ color: '#60a5fa' }} />
            <span>Target Goal:</span>
            <strong style={{ color: '#fff' }}>{targetRole.title}</strong>
          </div>
        ) : (
          <div className="nav-goal-pill" style={{ borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fcd34d' }}>
            <span>Target Goal: Not selected</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {readinessScore !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '6px 14px', borderRadius: '100px', fontSize: '13px' }}>
            <Award size={16} style={{ color: '#34d399' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Placement Readiness:</span>
            <strong style={{ color: '#34d399' }}>{readinessScore}%</strong>
          </div>
        )}

        <button 
          className="btn btn-secondary btn-sm" 
          onClick={onRefresh}
          title="Refresh real-time data"
        >
          <RefreshCw size={14} />
          <span>Sync</span>
        </button>

        <button 
          className="btn btn-outline btn-sm"
          onClick={onOpenAuth}
        >
          <UserCheck size={14} />
          <span>{student ? student.full_name.split(' ')[0] : 'Sign In'}</span>
        </button>
      </div>
    </header>
  );
}
