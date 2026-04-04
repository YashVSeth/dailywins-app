import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Admin from './components/Admin.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RewardPage from './components/RewardPage.jsx'
import Login from './components/Login.jsx'
import PartnerDashboard from './components/PartnerDashboard.jsx'
import axios from 'axios'

// Global Axios Interceptor for JWT Tokens
axios.interceptors.request.use((config) => {
  // Try admin auth first, then partner auth
  let token = null;
  const adminAuth = localStorage.getItem('adminAuth');
  if (adminAuth) {
    try {
      const parsed = JSON.parse(adminAuth);
      if (parsed.token) token = parsed.token;
    } catch (e) { console.warn('Failed admin parse', e); }
  }

  if (!token) {
    const partnerAuth = localStorage.getItem('partnerAuth');
    if (partnerAuth) {
      try {
        const parsed = JSON.parse(partnerAuth);
        if (parsed.token) token = parsed.token;
      } catch (e) { console.warn('Failed admin parse', e); }
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Global Interceptor to catch 401s and redirect to login
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid tokens
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('partnerAuth');
      // Only redirect if we are not already going to the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/partner/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/scanner" element={<App />} />
        <Route path="/partner/dashboard" element={<PartnerDashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/reward/:id" element={<RewardPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
