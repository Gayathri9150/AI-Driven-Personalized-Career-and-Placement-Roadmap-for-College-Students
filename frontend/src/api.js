const API_BASE = '/api';

export const getAuthToken = () => {
  return localStorage.getItem('career_app_token') || '1'; // defaults to demo student 1
};

export const setAuthToken = (token) => {
  localStorage.setItem('career_app_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('career_app_token');
  localStorage.removeItem('career_app_user');
};

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (studentData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(studentData)
  }),

  // Profile
  getProfile: () => request('/profile'),
  updateProfile: (data) => request('/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Career Roles & Recommendations
  getAllRoles: () => request('/career-roles'),
  getRecommendations: () => request('/recommendations'),
  selectGoalRole: (roleId) => request(`/career-roles/${roleId}/select-goal`, {
    method: 'POST'
  }),

  // Skill-Gap Analysis
  getSkillGap: (roleId) => request(`/skill-gap/${roleId}`),

  // Personalized Roadmap
  getRoadmap: (roleId) => request(`/roadmap/${roleId}`),
  updateRoadmapItemStatus: (itemId, status) => request(`/roadmap/item/${itemId}/status`, {
    method: 'POST',
    body: JSON.stringify({ status })
  }),

  // Projects & Certifications
  getProjectsAndCerts: (roleId) => request(`/projects-certs/${roleId}`),

  // Placement Preparation
  getPlacementCategories: () => request('/placement/categories'),
  getPlacementQuestions: (category) => request(`/placement/questions?category=${encodeURIComponent(category)}`),
  submitPlacementQuiz: (category, answers) => request('/placement/submit', {
    method: 'POST',
    body: JSON.stringify({ category, answers })
  }),
  getHrQuestions: () => request('/placement/hr-questions'),

  // Dashboard Summary
  getDashboard: () => request('/dashboard')
};
