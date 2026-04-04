import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, QrCode, LogOut, TrendingUp, Users, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import Scanner from './Scanner';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PartnerDashboard() {
   const [partner, setPartner] = useState(null);
   const [stats, setStats] = useState(null);
   const [loading, setLoading] = useState(true);
   const navigate = useNavigate();

   const handleLogout = () => {
      localStorage.removeItem('partnerAuth');
      navigate('/login');
   };

   useEffect(() => {
      // Treat hardware 'Back' button as an explicit logout action for security
      window.history.pushState(null, '', window.location.href);
      const handlePopState = () => {
         handleLogout();
      };
      window.addEventListener('popstate', handlePopState);

      const auth = localStorage.getItem('partnerAuth');
      if (!auth) {
         navigate('/login');
         return;
      }

      const parsed = JSON.parse(auth);
      setPartner(parsed);

      const fetchStats = async () => {
         try {
            const res = await axios.get(`${API_BASE}/partners/${parsed.id}/stats`);
            setStats(res.data);
         } catch (err) {
            console.error('Error fetching partner stats:', err);
         } finally {
            setLoading(false);
         }
      };

      fetchStats();

      return () => window.removeEventListener('popstate', handlePopState);
   }, [navigate]);

   if (loading) {
      return (
         <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-slate-900 text-slate-200">

         {/* Header */}
         <header className="bg-slate-800/50 border-b border-white/5 sticky top-0 z-40 backdrop-blur-md">
            <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="h-9 w-9 flex items-center justify-center overflow-hidden shrink-0">
                     <img src={logo} alt="DailyWins" className="w-[170%] h-[170%] max-w-none object-contain" />
                  </div>
                  <div>
                     <h1 className="font-bold text-white text-lg leading-tight">{partner?.name}</h1>
                     <p className="text-xs text-emerald-400 font-medium tracking-wide uppercase">Partner Portal</p>
                  </div>
               </div>

               <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
               >
                  <LogOut className="w-5 h-5" />
               </button>
            </div>
         </header>

         <main className="max-w-4xl mx-auto p-4 py-8 space-y-6">

            {/* Welcome & Primary Action */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-500/10 relative overflow-hidden text-center sm:text-left">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

               <div className="relative z-10">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Ready to scan?</h2>
                  <p className="text-indigo-100 max-w-sm">Scan customer QR codes to instantly issue rewards and track visits.</p>
               </div>

               <button
                  onClick={() => navigate('/scanner')}
                  className="relative z-10 flex items-center justify-center gap-3 bg-white text-indigo-600 hover:bg-slate-50 w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg active:scale-95 group"
               >
                  <QrCode className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  Open Scanner
               </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="bg-slate-800/40 border border-white/5 p-5 rounded-2xl">
                  <div className="text-emerald-400 mb-2">
                     <Users className="w-6 h-6" />
                  </div>
                  <p className="text-3xl font-black text-white">{stats?.todaysScans || 0}</p>
                  <p className="text-sm text-slate-400 mt-1 font-medium">Scans Today</p>
               </div>
               <div className="bg-slate-800/40 border border-white/5 p-5 rounded-2xl">
                  <div className="text-purple-400 mb-2">
                     <TrendingUp className="w-6 h-6" />
                  </div>
                  <p className="text-3xl font-black text-white">{stats?.totalScans || 0}</p>
                  <p className="text-sm text-slate-400 mt-1 font-medium">Total Lifetime Scans</p>
               </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/40 border border-white/5 rounded-3xl overflow-hidden">
               <div className="p-6 border-b border-white/5">
                  <h3 className="text-lg font-bold text-white">Recent Scans</h3>
               </div>

               <div className="divide-y divide-white/5">
                  {stats?.recentScans?.length === 0 ? (
                     <div className="p-8 text-center text-slate-500">
                        No scans recorded yet.
                     </div>
                  ) : (
                     stats?.recentScans?.map((scan, i) => (
                        <div key={i} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 hover:bg-slate-800/60 transition-colors">
                           <div>
                              <p className="font-medium text-white text-lg">{scan.user.phoneNumber}</p>
                              <p className="text-sm text-slate-400">Awarded: <span className="text-slate-300 font-medium">{scan.challenge?.title}</span></p>
                           </div>
                           <div className="text-sm text-slate-500 font-mono">
                              {new Date(scan.redeemedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>

         </main>
      </div>
   );
}
