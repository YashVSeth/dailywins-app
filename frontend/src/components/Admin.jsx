import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis } from 'recharts';
import {
   Loader2, LogOut, LayoutDashboard, Store, Ticket, Gift, Settings,
   Search, Bell, HelpCircle, Users, DollarSign, ChevronRight, BarChart,
   Building2, Info, Tag, Calendar, Target, Award, Medal, CheckCircle2, PlusCircle,
   Download, Plus, MapPin, X, Filter, MoreHorizontal, ChevronLeft, FileDown
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import Businesses from './Businesses';
import Coupons from './Coupons';
import Rewards from './Rewards';
import Reports from './Reports';
import SettingsPanel from './Settings';
import logo from '../assets/logo.png';
import { useAdminStore } from '../store/useAdminStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Admin = () => {
   const [activeTab, setActiveTab] = useState('dashboard');

   // AUTH CHECK
   const [auth, setAuth] = useState(null);
   const [authChecking, setAuthChecking] = useState(true);

   const handleLogout = () => {
      localStorage.removeItem('adminAuth');
      setAuth(null);
   };

   // 20-minute inactivity timer
   useEffect(() => {
      let timeoutId;
      const resetTimer = () => {
         clearTimeout(timeoutId);
         timeoutId = setTimeout(() => {
            handleLogout();
         }, 20 * 60 * 1000); // 20 minutes
      };

      const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
      events.forEach(event => window.addEventListener(event, resetTimer));
      resetTimer();

      return () => {
         clearTimeout(timeoutId);
         events.forEach(event => window.removeEventListener(event, resetTimer));
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   useEffect(() => {
      const stored = localStorage.getItem('adminAuth');
      if (stored) setAuth(JSON.parse(stored));
      setAuthChecking(false);

      // Treat hardware 'Back' button as an explicit logout action for security
      window.history.pushState(null, '', window.location.href);
      const handlePopState = () => {
         handleLogout();
      };
      window.addEventListener('popstate', handlePopState);

      return () => window.removeEventListener('popstate', handlePopState);
   }, []);

   // -- GLOBAL DATA (from Zustand) --
   const {
      stats, chartData, recentActivity, partners, challenges, promos,
      fetchAllData
   } = useAdminStore();

   useEffect(() => {
      if (auth) fetchAllData();
   }, [auth]);

   // -- FORM STATES --
   const [rewardFormData, setRewardFormData] = useState({ phoneNumber: '', challengeId: '' });
   const [rewardLoading, setRewardLoading] = useState(false);
   const [generatedCouponId, setGeneratedCouponId] = useState('');
   const [generatedQrCode, setGeneratedQrCode] = useState('');
   const [rewardMessage, setRewardMessage] = useState('');

   const [partnerFormData, setPartnerFormData] = useState({ name: '', description: '', location: '', category: '', registrationNo: '', email: '', phoneNumber: '', username: '', password: '' });
   const [partnerLoading, setPartnerLoading] = useState(false);
   const [partnerMessage, setPartnerMessage] = useState('');
   const [isAddingBusiness, setIsAddingBusiness] = useState(false);

   const [challengeFormData, setChallengeFormData] = useState({ title: '', description: '', category: 'ENGAGEMENT', difficulty: 'MEDIUM', targetMetric: '', durationDays: '', rewardPromoId: '', partnerId: '' });
   const [challengeLoading, setChallengeLoading] = useState(false);
   const [challengeMessage, setChallengeMessage] = useState('');

   const [promoFormData, setPromoFormData] = useState({ title: '', description: '', partnerId: '', discountType: 'PERCENTAGE', discountValue: '', minSpend: '', validUntil: '', usageLimit: '' });
   const [promoLoading, setPromoLoading] = useState(false);
   const [promoMessage, setPromoMessage] = useState('');

   useEffect(() => {
      // Pre-select first active challenge if none selected
      const activeChallenges = challenges.filter(c => c.isActive !== false);
      if (!rewardFormData.challengeId && activeChallenges.length > 0) {
         setRewardFormData(prev => ({ ...prev, challengeId: activeChallenges[0]._id }));
      }
   }, [challenges, rewardFormData.challengeId]);

   if (authChecking) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>;
   if (!auth) return <Navigate to="/login" replace />;

   const generateReward = async (e) => {
      e.preventDefault();
      setRewardLoading(true); setRewardMessage(''); setGeneratedCouponId(''); setGeneratedQrCode('');
      try {
         const response = await axios.post(`${API_BASE}/coupons/generate`, rewardFormData);
         setGeneratedCouponId(response.data.couponId);
         setGeneratedQrCode(response.data.qrCodeDataUrl);
         setRewardMessage('Reward generated successfully!');
         fetchAllData();
      } catch (error) { setRewardMessage(error.response?.data?.message || 'Error'); }
      finally { setRewardLoading(false); }
   };

   const registerPartner = async (e) => {
      e.preventDefault();
      setPartnerLoading(true); setPartnerMessage('');
      try {
         await axios.post(`${API_BASE}/partners/register`, partnerFormData);
         setPartnerMessage('Business registered successfully!');
         setPartnerFormData({ name: '', description: '', location: '', email: '', phoneNumber: '', username: '', password: '' });
         fetchAllData();
      } catch (error) { setPartnerMessage(error.response?.data?.message || 'Error'); }
      finally { setPartnerLoading(false); }
   };

   const updatePartnerStatus = async (partnerId, status, credentials = {}) => {
      try {
         await axios.patch(`${API_BASE}/partners/${partnerId}/status`, {
            status,
            ...credentials
         });
         fetchAllData();
      } catch (error) {
         console.error('Error updating status:', error);
         alert(error.response?.data?.message || 'Error updating status');
      }
   };

   const deletePartner = async (partnerId) => {
      if (!window.confirm('Are you sure you want to permanently delete this partner? This action cannot be undone.')) return;
      try {
         await axios.delete(`${API_BASE}/partners/${partnerId}`);
         fetchAllData();
      } catch (error) {
         console.error('Error deleting partner:', error);
         alert(error.response?.data?.message || 'Error deleting partner');
      }
   };

   const registerChallenge = async (e) => {
      e.preventDefault();
      setChallengeLoading(true); setChallengeMessage('');
      try {
         await axios.post(`${API_BASE}/challenges/register`, challengeFormData);
         setChallengeMessage('Challenge created successfully!');
         setChallengeFormData({ title: '', description: '', category: 'ENGAGEMENT', difficulty: 'MEDIUM', targetMetric: '', durationDays: '', rewardPromoId: '', partnerId: '' });
         fetchAllData();
      } catch (error) { setChallengeMessage(error.response?.data?.message || 'Error'); }
      finally { setChallengeLoading(false); }
   };

   const deleteChallenge = async (challengeId) => {
      if (!window.confirm('Are you sure you want to permanently delete this challenge? This action cannot be undone.')) return;
      try {
         await axios.delete(`${API_BASE}/challenges/${challengeId}`);
         fetchAllData();
      } catch (error) {
         console.error('Error deleting challenge:', error);
         alert(error.response?.data?.message || 'Error deleting challenge');
      }
   };

   const downloadReport = async () => {
      try {
         const res = await axios.get(`${API_BASE}/stats/report`, { responseType: 'blob' });
         const url = window.URL.createObjectURL(new Blob([res.data]));
         const a = document.createElement('a');
         a.href = url;
         a.download = `DailyWins_Report_${new Date().toISOString().split('T')[0]}.csv`;
         document.body.appendChild(a);
         a.click();
         a.remove();
         window.URL.revokeObjectURL(url);
      } catch (err) {
         console.error('Error downloading report:', err);
         alert('Failed to generate report. Please try again.');
      }
   };

   const createPromo = async (e) => {
      e.preventDefault();
      setPromoLoading(true); setPromoMessage('');
      try {
         await axios.post(`${API_BASE}/promos/create`, promoFormData);
         setPromoMessage('Coupon Template created successfully!');
         setPromoFormData({ title: '', description: '', partnerId: '', discountType: 'PERCENTAGE', discountValue: '', minSpend: '', validUntil: '', usageLimit: '' });
         fetchAllData();
      } catch (error) { setPromoMessage(error.response?.data?.message || 'Error'); }
      finally { setPromoLoading(false); }
   };

   const updatePromoStatus = async (promoId, status) => {
      try {
         await axios.patch(`${API_BASE}/promos/${promoId}/status`, { status });
         fetchAllData();
      } catch (error) {
         console.error('Error updating promo status:', error);
         alert(error.response?.data?.message || 'Error updating status');
      }
   };

   const deletePromo = async (promoId) => {
      if (!window.confirm('Are you sure you want to permanently delete this coupon template? This action cannot be undone.')) return;
      try {
         await axios.delete(`${API_BASE}/promos/${promoId}`);
         fetchAllData();
      } catch (error) {
         console.error('Error deleting promo:', error);
         alert(error.response?.data?.message || 'Error deleting promo');
      }
   };



   return (
      <div className="flex h-screen bg-[#0B1120] text-slate-300 font-sans overflow-hidden">

         {/* SIDEBAR */}
         <aside className="w-64 bg-[#0F172A] border-r border-[#1E293B] flex-shrink-0 flex flex-col justify-between hidden md:flex">
            <div className="p-6">
               <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 flex items-center justify-center overflow-hidden shrink-0">
                     <img src={logo} alt="DailyWins Trophy" className="w-[180%] h-[180%] max-w-none object-contain" />
                  </div>
                  <div className="flex flex-col">
                     <h1 className="font-extrabold text-xl leading-tight tracking-tight drop-shadow-md">
                        <span className="text-blue-500">Daily</span><span className="text-yellow-400">Wins</span>
                     </h1>
                     <span className="text-slate-500 text-[10px] tracking-wider font-semibold uppercase">Admin Console</span>
                  </div>
               </div>

               <nav className="flex flex-col gap-2">
                  <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${activeTab === 'dashboard' ? 'bg-[#0E62E4] text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-[#1E293B]/50'}`}>
                     <LayoutDashboard className="w-5 h-5" /> Dashboard
                  </button>
                  <button onClick={() => setActiveTab('businesses')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${activeTab === 'businesses' ? 'bg-[#0E62E4] text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-[#1E293B]/50'}`}>
                     <Store className="w-5 h-5" /> Businesses
                  </button>
                  <button onClick={() => setActiveTab('coupons')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${activeTab === 'coupons' ? 'bg-[#0E62E4] text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-[#1E293B]/50'}`}>
                     <Ticket className="w-5 h-5" /> Coupons
                  </button>
                  <button onClick={() => setActiveTab('challenges')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${activeTab === 'challenges' ? 'bg-[#0E62E4] text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-[#1E293B]/50'}`}>
                     <Target className="w-5 h-5" /> Challenges
                  </button>
                  <button onClick={() => setActiveTab('rewards')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${activeTab === 'rewards' ? 'bg-[#0E62E4] text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-[#1E293B]/50'}`}>
                     <Gift className="w-5 h-5" /> Rewards
                  </button>
                  <button onClick={() => setActiveTab('reports')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${activeTab === 'reports' ? 'bg-[#0E62E4] text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-[#1E293B]/50'}`}>
                     <BarChart className="w-5 h-5" /> Reports
                  </button>
               </nav>

               <div className="mt-8 mb-3 px-4 text-[10px] font-bold text-slate-600 tracking-widest uppercase">SYSTEM</div>
               <nav className="flex flex-col gap-2">
                  <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${activeTab === 'settings' ? 'bg-[#0E62E4] text-white' : 'text-slate-400 hover:text-white hover:bg-[#1E293B]/50'}`}>
                     <Settings className="w-5 h-5" /> Settings
                  </button>
               </nav>
            </div>

            {/* User Profile */}
            <div className="p-4 bg-[#141E33]/30 border-t border-[#1E293B] m-4 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#fed0b5] rounded-full flex items-center justify-center text-orange-900 font-bold uppercase shrink-0">
                     {auth?.username?.charAt(0) || 'A'}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                     <span className="text-white text-sm font-bold capitalize truncate">{auth?.username || 'Admin'}</span>
                     <span className="text-slate-500 text-[10px] font-semibold tracking-wide text-left truncate">Super Admin</span>
                  </div>
               </div>
               <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white hover:bg-[#1E293B] rounded-xl transition-colors">
                  <LogOut className="w-5 h-5" />
               </button>
            </div>
         </aside>

         {/* MAIN CONTENT */}
         <main className="flex-1 flex flex-col h-screen overflow-hidden">

            {/* TOP NAV */}
            <header className="lg:hidden h-20 px-4 md:px-8 flex items-center justify-between border-b border-[#1E293B] bg-[#0B1120] flex-shrink-0">

               <div className="flex items-center gap-2">
                  <div className="w-9 h-9 flex items-center justify-center overflow-hidden shrink-0">
                     <img src={logo} alt="DailyWins Trophy" className="w-[170%] h-[170%] max-w-none object-contain" />
                  </div>
                  <h1 className="font-extrabold text-xl leading-tight tracking-tight drop-shadow-md">
                     <span className="text-blue-500">Daily</span><span className="text-yellow-400">Wins</span>
                  </h1>
               </div>

               <div className="flex items-center gap-4 text-slate-400">
                  <button onClick={handleLogout} className="lg:hidden p-2.5 rounded-full hover:bg-[#1E293B] hover:text-white bg-red-500/10 text-red-500 transition-colors flex items-center justify-center">
                     <LogOut className="w-5 h-5" />
                  </button>
               </div>
            </header>

            {/* MOBILE NAVIGATION */}
            <div className="lg:hidden border-b border-[#1E293B] bg-[#0B1120]/95 backdrop-blur-xl sticky top-20 z-10 px-4 py-3 overflow-x-auto [&::-webkit-scrollbar]:hidden flex items-center gap-2">
               <button onClick={() => setActiveTab('dashboard')} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'dashboard' ? 'bg-[#0E62E4] text-white shadow-lg shadow-blue-500/20' : 'bg-[#141E33]/50 text-slate-400 border border-[#1E293B]'}`}>Dashboard</button>
               <button onClick={() => setActiveTab('businesses')} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'businesses' ? 'bg-[#FACC15] text-yellow-950 shadow-lg shadow-yellow-500/20' : 'bg-[#141E33]/50 text-slate-400 border border-[#1E293B]'}`}>Businesses</button>
               <button onClick={() => setActiveTab('coupons')} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'coupons' ? 'bg-[#0E62E4] text-white shadow-lg shadow-blue-500/20' : 'bg-[#141E33]/50 text-slate-400 border border-[#1E293B]'}`}>Coupons</button>
               <button onClick={() => setActiveTab('challenges')} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'challenges' ? 'bg-[#0E62E4] text-white shadow-lg shadow-blue-500/20' : 'bg-[#141E33]/50 text-slate-400 border border-[#1E293B]'}`}>Challenges</button>
               <button onClick={() => setActiveTab('rewards')} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'rewards' ? 'bg-[#0E62E4] text-white shadow-lg shadow-blue-500/20' : 'bg-[#141E33]/50 text-slate-400 border border-[#1E293B]'}`}>Rewards</button>
               <button onClick={() => setActiveTab('reports')} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'reports' ? 'bg-[#0E62E4] text-white shadow-lg shadow-blue-500/20' : 'bg-[#141E33]/50 text-slate-400 border border-[#1E293B]'}`}>Reports</button>
               <button onClick={() => setActiveTab('settings')} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'settings' ? 'bg-[#0E62E4] text-white shadow-lg shadow-blue-500/20' : 'bg-[#141E33]/50 text-slate-400 border border-[#1E293B]'}`}>Settings</button>
            </div>

            {/* SCROLLABLE VIEWPORT */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#0B1120] [&::-webkit-scrollbar-thumb]:bg-[#1E293B] [&::-webkit-scrollbar-thumb]:rounded-full">

               {activeTab === 'dashboard' && (
                  <div className="w-full space-y-6">

                     {/* Dashboard Header with Generate Report */}
                     <div className="flex items-center justify-between">
                        <div>
                           <h2 className="text-white text-2xl font-black tracking-tight">Overview</h2>
                           <p className="text-slate-500 text-sm">Real-time platform analytics</p>
                        </div>
                     </div>

                     {/* 4 STAT CARDS */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                        <div className="bg-[#141E33]/20 border border-[#1E293B] p-6 rounded-[1.25rem] flex flex-col justify-between">
                           <div className="flex items-center justify-between mb-4">
                              <span className="text-slate-400 font-semibold text-sm">Total Partners</span>
                              <div className="w-8 h-8 bg-[#0E62E4]/10 rounded-lg flex items-center justify-center"><Users className="w-4 h-4 text-[#0E62E4]" /></div>
                           </div>
                           <div className="flex items-baseline gap-3">
                              <h2 className="text-[2rem] font-bold text-white tracking-tight leading-none">{stats?.totalPartners ?? '0'}</h2>
                           </div>
                        </div>

                        <div className="bg-[#141E33]/20 border border-[#1E293B] p-6 rounded-[1.25rem] flex flex-col justify-between">
                           <div className="flex items-center justify-between mb-4">
                              <span className="text-slate-400 font-semibold text-sm">Active Rewards</span>
                              <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center"><Ticket className="w-4 h-4 text-orange-500" /></div>
                           </div>
                           <div className="flex items-baseline gap-3">
                              <h2 className="text-[2rem] font-bold text-white tracking-tight leading-none">{stats?.activeCoupons ?? '0'}</h2>
                           </div>
                        </div>

                        <div className="bg-[#141E33]/20 border border-[#1E293B] p-6 rounded-[1.25rem] flex flex-col justify-between">
                           <div className="flex items-center justify-between mb-4">
                              <span className="text-slate-400 font-semibold text-sm">Total Redemptions</span>
                              <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center"><Gift className="w-4 h-4 text-yellow-500" /></div>
                           </div>
                           <div className="flex items-baseline gap-3">
                              <h2 className="text-[2rem] font-bold text-white tracking-tight leading-none">{stats?.redeemedCoupons ?? '0'}</h2>
                           </div>
                        </div>

                        <div className="bg-[#141E33]/20 border border-[#1E293B] p-6 rounded-[1.25rem] flex flex-col justify-between">
                           <div className="flex items-center justify-between mb-4">
                              <span className="text-slate-400 font-semibold text-sm">Active Challenges</span>
                              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center"><Target className="w-4 h-4 text-blue-500" /></div>
                           </div>
                           <div className="flex items-baseline gap-3">
                              <h2 className="text-[2rem] font-bold text-white tracking-tight leading-none">{stats?.totalChallenges ?? '0'}</h2>
                           </div>
                        </div>
                     </div>

                     {/* MIDDLE ROW: Chart & Actions */}
                     <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Platform Growth Chart */}
                        <div className="xl:col-span-2 bg-[#141E33]/20 border border-[#1E293B] rounded-[1.25rem] p-6">
                           <div className="flex items-start justify-between mb-8">
                              <div>
                                 <h2 className="text-white text-lg font-bold">Platform Growth</h2>
                                 <p className="text-slate-400 text-sm mt-1">Weekly activity trends across all sectors</p>
                              </div>
                              <button className="text-xs font-bold text-slate-300 bg-[#141E33] hover:bg-[#1E293B] border border-[#1E293B] px-4 py-2 rounded-full transition-colors flex items-center gap-1">
                                 Last 30 Days <ChevronRight className="w-3 h-3" />
                              </button>
                           </div>

                           <div className="h-[280px] w-full -ml-3">
                              <ResponsiveContainer width="100%" height="100%">
                                 <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                       <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#0E62E4" stopOpacity={0.4} />
                                          <stop offset="95%" stopColor="#0E62E4" stopOpacity={0} />
                                       </linearGradient>
                                       <linearGradient id="colorRedeemed" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                       </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} dy={15} minTickGap={30} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }} itemStyle={{ color: '#fff' }} cursor={{ stroke: '#1E293B', strokeWidth: 1 }} />
                                    <Area type="monotone" dataKey="issued" name="Coupons Issued" stroke="#0E62E4" strokeWidth={3} fillOpacity={1} fill="url(#colorIssued)" />
                                    <Area type="monotone" dataKey="redeemed" name="Coupons Redeemed" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorRedeemed)" />
                                 </AreaChart>
                              </ResponsiveContainer>
                           </div>
                        </div>

                        {/* Quick Actions & System Health */}
                        <div className="xl:col-span-1 flex flex-col gap-6">




                           <div className="bg-[#141E33]/20 border border-[#1E293B] rounded-[1.25rem] p-6 lg:mb-auto">
                              <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-3">SYSTEM HEALTH</div>
                              <div className="flex items-center justify-between mb-3">
                                 <span className="text-slate-300 font-bold text-xs uppercase tracking-wider">Server Load</span>
                                 <span className="text-emerald-500 font-bold text-xs">Optimized</span>
                              </div>
                              <div className="w-full h-2 bg-[#0B1120] rounded-full overflow-hidden border border-[#1E293B]">
                                 <div className="h-full bg-yellow-500 w-[75%] rounded-full shadow-[0_0_12px_rgba(234,179,8,0.6)]"></div>
                              </div>
                           </div>

                        </div>
                     </div>

                     {/* RECENT ACTIVITY */}
                     <div className="bg-[#141E33]/20 border border-[#1E293B] rounded-[1.25rem] p-6">
                        <div className="flex items-center justify-between mb-8">
                           <h2 className="text-white text-lg font-bold">Recent Activity</h2>
                           <button className="text-[#0E62E4] hover:text-[#0E62E4]/80 font-bold text-sm transition-colors">View All Transactions</button>
                        </div>

                        <div className="overflow-x-auto">
                           <table className="w-full text-left text-sm whitespace-nowrap">
                              <thead>
                                 <tr className="text-slate-500 border-b-2 border-[#1E293B]/80 tracking-widest text-[10px] font-bold uppercase">
                                    <th className="pb-4 font-bold col-span-2">BUSINESS / PARTNER</th>
                                    <th className="pb-4 font-bold">ACTIVITY ID</th>
                                    <th className="pb-4 font-bold">ACTION DETAIL</th>
                                    <th className="pb-4 font-bold">STATUS</th>
                                    <th className="pb-4 font-bold text-right">DATE</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {recentActivity.length === 0 ? (
                                    <tr>
                                       <td colSpan="5" className="py-12 text-center text-slate-500 text-sm font-medium">No recent activity to show yet.</td>
                                    </tr>
                                 ) : (
                                    recentActivity.map((act, i) => (
                                       <tr key={i} className="border-b border-[#1E293B]/40 hover:bg-[#141E33]/40 transition-colors group">
                                          <td className="py-5">
                                             <div className="flex items-center gap-4 w-60">
                                                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white ${act.iconColor} shadow-lg shrink-0`}>
                                                   <Store className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                   <span className="text-white font-bold">{act.business}</span>
                                                   <span className="text-slate-500 text-xs mt-0.5">{act.category}</span>
                                                </div>
                                             </div>
                                          </td>
                                          <td className="py-5 text-slate-400 font-medium">{act.id}</td>
                                          <td className="py-5 font-black text-[#0E62E4]">{act.detail}</td>
                                          <td className="py-5">
                                             <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${act.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : act.status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                                {act.status}
                                             </span>
                                          </td>
                                          <td className="py-5 text-slate-400 text-right font-medium">{act.date}</td>
                                       </tr>
                                    ))
                                 )}
                              </tbody>
                           </table>
                        </div>
                     </div>

                  </div>
               )}

               {activeTab === 'businesses' && <Businesses isAddingBusiness={isAddingBusiness} setIsAddingBusiness={setIsAddingBusiness} partnerFormData={partnerFormData} setPartnerFormData={setPartnerFormData} registerPartner={registerPartner} partnerLoading={partnerLoading} partnerMessage={partnerMessage} updatePartnerStatus={updatePartnerStatus} deletePartner={deletePartner} />}
               {activeTab === 'coupons' && <Coupons promoFormData={promoFormData} setPromoFormData={setPromoFormData} createPromo={createPromo} promoLoading={promoLoading} promoMessage={promoMessage} updatePromoStatus={updatePromoStatus} deletePromo={deletePromo} />}
               {activeTab === 'challenges' && <Challenges challengeFormData={challengeFormData} setChallengeFormData={setChallengeFormData} registerChallenge={registerChallenge} challengeLoading={challengeLoading} challengeMessage={challengeMessage} deleteChallenge={deleteChallenge} />}
               {activeTab === 'rewards' && <Rewards rewardFormData={rewardFormData} setRewardFormData={setRewardFormData} generateReward={generateReward} rewardLoading={rewardLoading} rewardMessage={rewardMessage} generatedCouponId={generatedCouponId} generatedQrCode={generatedQrCode} />}
               {activeTab === 'reports' && <Reports downloadReport={downloadReport} />}
               {activeTab === 'settings' && <SettingsPanel />}

            </div>
         </main>

      </div>
   );
};

export default Admin;
