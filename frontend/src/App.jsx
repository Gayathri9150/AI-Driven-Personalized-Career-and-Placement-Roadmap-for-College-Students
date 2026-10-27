import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import RecommendationsPage from './pages/RecommendationsPage';
import SkillGapPage from './pages/SkillGapPage';
import RoadmapPage from './pages/RoadmapPage';
import ProjectsCertsPage from './pages/ProjectsCertsPage';
import PlacementPrepPage from './pages/PlacementPrepPage';
import ProgressTrackerPage from './pages/ProgressTrackerPage';
import { api } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setErrorBanner('');
      const data = await api.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
      setErrorBanner('Could not connect to backend server. Ensure Flask backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoalSelected = async (newRoleId) => {
    await loadDashboard();
  };

  const handleProfileUpdated = async () => {
    await loadDashboard();
  };

  const handleQuizCompleted = async () => {
    await loadDashboard();
  };

  const handleAuthSuccess = async (studentUser) => {
    await loadDashboard();
  };

  const student = dashboardData?.student;
  const targetRole = dashboardData?.target_role;
  const readinessScore = dashboardData?.holistic_readiness_score;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setMobileSidebarOpen(false);
        }}
        student={student}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Content Wrapper */}
      <div className="main-wrapper">
        <Navbar
          targetRole={targetRole}
          readinessScore={readinessScore}
          onRefresh={loadDashboard}
          onOpenAuth={() => setAuthModalOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          student={student}
        />

        {errorBanner && (
          <div style={{ padding: '16px 32px 0' }}>
            <div className="alert alert-warning">
              <span>{errorBanner}</span>
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: 'auto' }}
                onClick={loadDashboard}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Tab Pages */}
        <main style={{ flex: 1 }}>
          {activeTab === 'dashboard' && (
            <Dashboard
              data={dashboardData}
              setActiveTab={setActiveTab}
              onRefresh={loadDashboard}
            />
          )}

          {activeTab === 'profile' && (
            <ProfilePage
              onProfileUpdated={handleProfileUpdated}
            />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsPage
              activeGoalId={targetRole?.id}
              onGoalSelected={handleGoalSelected}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'skill-gap' && (
            <SkillGapPage
              activeGoalId={targetRole?.id}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'roadmap' && (
            <RoadmapPage
              activeGoalId={targetRole?.id}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'projects-certs' && (
            <ProjectsCertsPage
              activeGoalId={targetRole?.id}
            />
          )}

          {activeTab === 'placement' && (
            <PlacementPrepPage
              onQuizCompleted={handleQuizCompleted}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressTrackerPage
              setActiveTab={setActiveTab}
            />
          )}
        </main>
      </div>

      {/* Authentication & User Switcher Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
