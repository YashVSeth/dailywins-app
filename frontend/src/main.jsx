import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Admin from './components/Admin.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RewardPage from './components/RewardPage.jsx'
import Login from './components/Login.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/scanner" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/scanner" element={<App />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/reward/:id" element={<RewardPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
