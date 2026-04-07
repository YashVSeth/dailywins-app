import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, BarChart, Bar, YAxis } from 'recharts';
import { Loader2, Download, FileDown, Flame, Search, Bell, Activity, Users, Store, CheckCircle } from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const COLORS = ['#0E62E4', '#10B981', '#FACC15', '#F97316', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function Reports({ downloadReport }) {
    const { stats, partners, chartData } = useAdminStore();
    const [liveLogs, setLiveLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);

    const fetchLiveLogs = async () => {
        setLoadingLogs(true);
        try {
            const res = await axios.get(`${API_BASE}/coupons/all`, {
                headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminAuth'))?.token}` }
            });
            setLiveLogs(res.data);
        } catch (e) {
            console.error('Error fetching comprehensive coupon logs', e);
        } finally {
            setLoadingLogs(false);
        }
    };

    useEffect(() => {
        fetchLiveLogs();
        // Optional: Polling can be added here if true "live" feeds are required
        // const interval = setInterval(fetchLiveLogs, 30000);
        // return () => clearInterval(interval);
    }, []);

    // Generate Category Breakdown from Partners
    const categoryData = useMemo(() => {
        if (!partners) return [];
        const counts = partners.reduce((acc, partner) => {
            const cat = partner.category || 'Other';
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [partners]);

    return (
        <div className="w-full mt-4 pb-12 animate-in fade-in duration-300 space-y-6">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-white text-3xl font-black mb-1.5 tracking-tight">System Reports</h2>
                    <p className="text-slate-400 text-sm">Actionable intelligence and live telemetry across all active campaigns.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={downloadReport} 
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#0E62E4] hover:bg-blue-600 border border-blue-500/50 text-white rounded-xl text-sm font-bold transition-colors shadow-[0_0_20px_rgba(14,98,228,0.3)]">
                        <FileDown className="w-4 h-4" /> Export CSV Report
                    </button>
                </div>
            </div>

            {/* Premium Analytics Graphs */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Col: Conversion Funnel */}
                <div className="xl:col-span-2 bg-[#141E33]/30 border border-[#1E293B] rounded-2xl p-6">
                    <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-500" /> Reward Lifecycle
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIssuedReports" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0E62E4" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#0E62E4" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorRedeemedReports" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} dy={10} minTickGap={30} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }} itemStyle={{ color: '#fff' }} cursor={{ stroke: '#1E293B', strokeWidth: 1 }} />
                                <Area type="monotone" dataKey="issued" name="Coupons Issued" stroke="#0E62E4" strokeWidth={3} fillOpacity={1} fill="url(#colorIssuedReports)" />
                                <Area type="monotone" dataKey="redeemed" name="Coupons Redeemed" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorRedeemedReports)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Col: Category Distribution */}
                <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-2xl p-6 flex flex-col">
                    <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                        <Store className="w-5 h-5 text-yellow-500" /> Partner Sectors
                    </h3>
                    <div className="flex-1 flex items-center justify-center relative min-h-[220px]">
                        {categoryData.length === 0 ? (
                            <span className="text-slate-500 text-sm font-medium">No partners available</span>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff', fontWeight: 'bold', border: 'none' }} itemStyle={{ color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                        {/* Center Text overlay for Pie Chart */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">{partners?.length || 0}</span>
                            <span className="text-[10px] text-slate-600 font-semibold">PARTNERS</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* LIVE DASHBOARD LEDGER */}
            <div className="bg-[#0B1120] border-2 border-[#1E293B] rounded-2xl overflow-hidden relative">
                {/* Subtle top decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-yellow-500 opacity-50"></div>
                
                <div className="p-6 border-b border-[#1E293B]/50 flex items-center justify-between bg-[#141E33]/20">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </div>
                        <h3 className="text-white text-lg font-black tracking-tight">Live Reward Ledger</h3>
                    </div>
                    <button onClick={fetchLiveLogs} disabled={loadingLogs} className="text-slate-400 hover:text-white transition-colors">
                       {loadingLogs ? <Loader2 className="w-5 h-5 animate-spin"/> : <Search className="w-5 h-5" />}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#0B1120]/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-[#1E293B]">
                                <th className="px-6 py-4">Participant</th>
                                <th className="px-6 py-4">Assigned Partner</th>
                                <th className="px-6 py-4">Associated Template</th>
                                <th className="px-6 py-4">Generation Time</th>
                                <th className="px-6 py-4">Utilization</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingLogs ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-500 text-sm">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" /> Scanning logs...
                                    </td>
                                </tr>
                            ) : liveLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-500 text-sm font-medium">No rewards have been recorded yet.</td>
                                </tr>
                            ) : (
                                liveLogs.map((log) => (
                                    <tr key={log._id} className="border-b border-[#1E293B]/30 hover:bg-[#141E33]/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-white">
                                                    {log.userName ? log.userName.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold text-sm tracking-wide">{log.phoneNumber}</span>
                                                    <span className="text-slate-500 text-[10px]">{log.userName}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 font-bold text-[11px] rounded-lg border border-yellow-500/20">{log.partner}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300 font-medium text-xs">
                                            {log.challenge}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-xs">
                                            {new Date(log.issuedAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.status === 'Used' ? (
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black tracking-widest uppercase border border-emerald-500/20 flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> REDEEMED
                                                    </span>
                                                    <span className="text-slate-500 text-[10px]">{new Date(log.redeemedAt).toLocaleString()}</span>
                                                </div>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-black tracking-widest uppercase border border-blue-500/20 flex items-center gap-1">
                                                    ACTIVE REWARD
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
