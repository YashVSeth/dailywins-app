import React, { useState } from 'react';
import axios from 'axios';
import { User, KeyRound, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. First, attempt to log in as a System Administrator
      const adminRes = await axios.post(`${API_BASE}/admin/login`, formData);
      localStorage.setItem('adminAuth', JSON.stringify(adminRes.data.admin));
      navigate('/admin');
      return; // Exit successful admin block
    } catch (adminErr) {
      console.log(adminErr);
      // Admin login failed. It was either a 401 (not an admin) or a server error.
      // 2. Fallback: attempt to log in as a Local Partner
      try {
         const partnerRes = await axios.post(`${API_BASE}/partners/login`, formData);
         localStorage.setItem('partnerAuth', JSON.stringify(partnerRes.data.partner));
         navigate('/scanner');
         return; // Exit successful partner block
      } catch (partnerErr) {
         // Both logins failed. Display an explicit error.
         setError('Invalid Username or Password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="bg-slate-800/80 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl max-w-md w-full z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex flex-col items-center justify-center mb-8">
           <div className="-mb-4 z-10 relative h-24 w-24 md:h-28 md:w-28 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Trophy Logo" className="w-[200%] h-[200%] max-w-none object-contain" />
           </div>
           <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 drop-shadow-md">
             <span className="text-blue-500">Daily</span>
             <span className="text-yellow-400">Wins</span>
           </h1>
           <p className="text-slate-400 text-sm mt-2 text-center">Sign in to manage your rewards or access the admin dashboard.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
           <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium flex items-center gap-2">
                 <User className="w-4 h-4 text-emerald-400"/> Username / ID
              </label>
              <input 
                 required 
                 type="text" 
                 value={formData.username} 
                 onChange={e => setFormData({...formData, username: e.target.value})} 
                 placeholder="Enter your ID" 
                 className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
              />
           </div>

           <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium flex items-center gap-2">
                 <KeyRound className="w-4 h-4 text-orange-400"/> Password
              </label>
              <input 
                 required 
                 type="password" 
                 value={formData.password} 
                 onChange={e => setFormData({...formData, password: e.target.value})} 
                 placeholder="••••••••" 
                 className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono tracking-widest" 
              />
           </div>

           {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium text-center animate-in fade-in">
                 {error}
              </div>
           )}

           <button 
              type="submit" 
              disabled={loading} 
              className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
           >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                 <>Secure Login <ArrowRight className="w-5 h-5" /></>
              )}
           </button>
        </form>
        
      </div>
    </div>
  );
};

export default Login;
