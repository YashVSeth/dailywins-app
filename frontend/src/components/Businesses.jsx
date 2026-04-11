import React, { useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis } from 'recharts';
import { Store, Download, Plus, MapPin, Building2, X, ChevronRight, ChevronLeft, Filter, MoreHorizontal, Loader2, Key, User, Trash2, BarChart } from 'lucide-react';

import { useAdminStore } from '../store/useAdminStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Businesses({ 
    isAddingBusiness, 
    setIsAddingBusiness, 
    partnerFormData, 
    setPartnerFormData, 
    registerPartner, 
    partnerLoading,
    partnerMessage,
    updatePartnerStatus,
    deletePartner
}) {
    const { stats, partners, promos } = useAdminStore();
    const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
    const [activateModalOpenFor, setActivateModalOpenFor] = useState(null);
    const [portalCreds, setPortalCreds] = useState({ id: '', password: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    
    // Analytics Drawer State
    const [analyticsDrawerOpenFor, setAnalyticsDrawerOpenFor] = useState(null);
    const [partnerStats, setPartnerStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);

    const fetchAnalytics = async (partner) => {
        setActionMenuOpenId(null);
        setAnalyticsDrawerOpenFor(partner);
        setLoadingStats(true);
        try {
            const res = await axios.get(`${API_BASE}/partners/${partner._id}/analytics`, {
                headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('adminAuth'))?.token}` }
            });
            setPartnerStats(res.data);
        } catch (e) {
            console.error('Error fetching partner analytics', e);
        } finally {
            setLoadingStats(false);
        }
    };

    const pendingCount = (partners || []).filter(p => p.status === 'PENDING').length;
    const totalPages = Math.max(1, Math.ceil((partners || []).length / ITEMS_PER_PAGE));
    const paginatedPartners = (partners || []).slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="w-full mt-4 pb-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-white text-3xl font-black mb-1.5 tracking-tight">Partner Businesses</h2>
                    <p className="text-slate-400 text-sm">Manage, verify, and monitor all business activities across the platform.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[#141E33]/80 hover:bg-[#1E293B] border border-[#1E293B] text-white rounded-xl text-sm font-bold transition-colors">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button onClick={() => setIsAddingBusiness(!isAddingBusiness)} className="flex items-center gap-2 px-5 py-2.5 bg-[#FACC15] hover:bg-yellow-500 text-yellow-950 rounded-xl text-sm font-black transition-colors shadow-lg shadow-yellow-500/20">
                        <Plus className="w-4 h-4" /> Add New Business
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-2xl p-6">
                    <h3 className="text-slate-400 text-xs font-bold mb-3">Total Partners</h3>
                    <div className="flex items-end gap-3">
                        <span className="text-white text-3xl font-black">{stats?.totalPartners || partners?.length || '0'}</span>
                    </div>
                </div>
                <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-2xl p-6">
                    <h3 className="text-slate-400 text-xs font-bold mb-3">Verification Pending</h3>
                    <div className="flex items-end gap-3">
                        <span className="text-white text-3xl font-black">{pendingCount}</span>
                    </div>
                </div>
            </div>

            {/* Onboard New Business Form */}
            {isAddingBusiness && (
                <div className="bg-[#0B1120] border-2 border-[#1E293B] hover:border-yellow-500/50 transition-colors rounded-2xl p-8 mb-10 relative overflow-hidden group shadow-[0_0_30px_rgba(250,204,21,0.03)] focus-within:shadow-[0_0_30px_rgba(250,204,21,0.05)] focus-within:border-yellow-500/50">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent"></div>
                    
                    <button onClick={() => setIsAddingBusiness(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                            <h3 className="text-white text-xl font-bold">Onboard New Business</h3>
                            <p className="text-slate-400 text-sm">Enter the official details to register a new partner entity.</p>
                        </div>
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        registerPartner(e);
                    }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-slate-300 text-xs font-bold mb-3">Business Legal Name</label>
                                <input required type="text" placeholder="e.g. Acme Corporation LLC" value={partnerFormData.name} onChange={e=>setPartnerFormData({...partnerFormData, name: e.target.value})} className="w-full bg-[#141E33]/50 border border-[#1E293B] rounded-xl px-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-yellow-500/50 transition-colors placeholder-[#334155]" />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-xs font-bold mb-3">Physical Location</label>
                                <div className="relative">
                                    <MapPin className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input type="text" placeholder="San Francisco, CA" value={partnerFormData.location} onChange={e=>setPartnerFormData({...partnerFormData, location: e.target.value})} className="w-full bg-[#141E33]/50 border border-[#1E293B] rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-yellow-500/50 transition-colors placeholder-[#334155]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-300 text-xs font-bold mb-3">Category</label>
                                <div className="relative">
                                    <button type="button" onClick={() => setCategoryOpen(!categoryOpen)} className="appearance-none w-full bg-[#141E33]/50 border border-[#1E293B] rounded-xl pl-4 pr-10 py-3.5 text-sm font-medium text-left focus:outline-none focus:border-yellow-500/50 transition-colors cursor-pointer" style={{color: partnerFormData.category ? '#cbd5e1' : '#334155'}}>
                                        {partnerFormData.category || 'Select Category'}
                                    </button>
                                    <ChevronRight className={`w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 transition-transform duration-200 ${categoryOpen ? 'rotate-[270deg]' : 'rotate-90'}`} />
                                    {categoryOpen && (
                                        <>
                                            <div className="fixed inset-0 z-30" onClick={() => setCategoryOpen(false)} />
                                            <div className="absolute left-0 right-0 top-full mt-2 bg-[#0B1120] border border-[#1E293B] rounded-xl shadow-2xl shadow-black/40 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                {['Retail & Wholesale','Food & Beverage','Health & Fitness','Software','E-commerce','Marketing','Other'].map(cat => (
                                                    <button key={cat} type="button" onClick={() => { setPartnerFormData({...partnerFormData, category: cat}); setCategoryOpen(false); }} className={`w-full px-4 py-3 text-sm font-medium text-left transition-colors ${partnerFormData.category === cat ? 'bg-yellow-500/10 text-yellow-400' : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'}`}>
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-300 text-xs font-bold mb-3">Primary Email</label>
                                <input required type="email" placeholder="contact@business.com" value={partnerFormData.email} onChange={e=>setPartnerFormData({...partnerFormData, email: e.target.value})} className="w-full bg-[#141E33]/50 border border-[#1E293B] rounded-xl px-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-yellow-500/50 transition-colors placeholder-[#334155]" />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-xs font-bold mb-3">Business Registration No.</label>
                                <input type="text" placeholder="ID-993882-X" value={partnerFormData.registrationNo} onChange={e=>setPartnerFormData({...partnerFormData, registrationNo: e.target.value})} className="w-full bg-[#141E33]/50 border border-[#1E293B] rounded-xl px-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-yellow-500/50 transition-colors placeholder-[#334155]" />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-xs font-bold mb-3">Phone Number</label>
                                <input required type="tel" placeholder="+1 (555) 000-0000" value={partnerFormData.phoneNumber} onChange={e=>setPartnerFormData({...partnerFormData, phoneNumber: e.target.value})} className="w-full bg-[#141E33]/50 border border-[#1E293B] rounded-xl px-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-yellow-500/50 transition-colors placeholder-[#334155]" />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-6 pt-6">
                            <button type="button" onClick={() => setIsAddingBusiness(false)} className="text-slate-400 hover:text-white font-bold text-sm transition-colors">Discard</button>
                            <button type="submit" disabled={partnerLoading} className="px-8 py-3.5 bg-[#FACC15] hover:bg-yellow-500 text-yellow-950 font-black rounded-xl transition-all shadow-lg shadow-yellow-500/20 text-sm">{partnerLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : 'Complete Registration'}</button>
                        </div>
                        {partnerMessage && <div className="text-emerald-500 mt-2 text-sm text-right font-bold">{partnerMessage}</div>}
                    </form>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between border-b border-[#1E293B]/50 gap-4 flex-wrap">
                    <div className="flex items-center gap-8">
                        <button className="text-[#FACC15] font-bold text-sm border-b-2 border-[#FACC15] pb-4 -mb-[17px]">All Businesses</button>
                        <button className="text-slate-400 hover:text-white font-bold text-sm pb-4 -mb-[17px] transition-colors">Verified</button>
                        <button className="text-slate-400 hover:text-white font-bold text-sm pb-4 -mb-[17px] transition-colors">Pending</button>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="text-slate-500 hover:text-white transition-colors"><Filter className="w-4 h-4" /></button>
                        <button className="text-slate-500 hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#1E293B]/50 bg-[#0B1120]/50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <th className="px-6 py-4">Business</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Category</th>
                                <th className="px-6 py-4 hidden md:table-cell">Location</th>
                                <th className="px-6 py-4 hidden lg:table-cell">Contact</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPartners.map((p, i) => (
                                <tr key={p._id || i} className="border-b border-[#1E293B]/30 hover:bg-[#1E293B]/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs ${p.color || 'bg-emerald-500/10 text-emerald-500'}`}>
                                                {p.initials || (p.name ? p.name.substring(0, 2).toUpperCase() : 'NA')}
                                            </div>
                                            <div>
                                                <div className="text-white font-bold text-sm mb-0.5 whitespace-nowrap">{p.name || 'Unnamed Business'}</div>
                                                <div className="text-slate-500 text-[11px]">ID: B-0012{9+i}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm hidden sm:table-cell">{p.category || 'Retail'}</td>
                                    <td className="px-6 py-4 text-slate-400 text-sm hidden md:table-cell">
                                        <div className="flex items-center gap-1.5 whitespace-nowrap"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {p.location || 'Remote'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm hidden lg:table-cell whitespace-nowrap">{p.email}</td>
                                    <td className="px-6 py-4">
                                        {p.status === 'PENDING' ? (
                                            <span className="px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[9px] font-black tracking-widest uppercase">Pending</span>
                                        ) : p.status === 'INACTIVE' ? (
                                            <span className="px-2.5 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 text-[9px] font-black tracking-widest uppercase">Inactive</span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black tracking-widest uppercase">Active</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button onClick={() => setActionMenuOpenId(actionMenuOpenId === p._id ? null : p._id)} className="text-slate-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#1E293B]">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                        
                                        {actionMenuOpenId === p._id && (
                                            <div className="absolute right-6 top-10 w-36 bg-[#0B1120] border border-[#1E293B] rounded-xl shadow-xl z-10 overflow-hidden text-left animate-in slide-in-from-top-2 duration-200">
                                                <button 
                                                    onClick={() => fetchAnalytics(p)}
                                                    className="w-full px-4 py-2.5 text-xs font-bold text-blue-400 hover:bg-[#1E293B] transition-colors flex items-center gap-2"
                                                >
                                                    <BarChart className="w-3.5 h-3.5" /> View Analytics
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setActionMenuOpenId(null);
                                                        setActivateModalOpenFor(p);
                                                    }}
                                                    className="w-full px-4 py-2.5 text-xs font-bold text-emerald-400 hover:bg-[#1E293B] transition-colors flex items-center gap-2"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Set Active
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setActionMenuOpenId(null);
                                                        updatePartnerStatus(p._id, 'INACTIVE');
                                                    }}
                                                    className="w-full px-4 py-2.5 text-xs font-bold text-orange-400 hover:bg-[#1E293B] transition-colors flex items-center gap-2"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> Set Inactive
                                                </button>
                                                <div className="h-px w-full bg-[#1E293B]"></div>
                                                <button 
                                                    onClick={() => {
                                                        setActionMenuOpenId(null);
                                                        deletePartner(p._id);
                                                    }}
                                                    className="w-full px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-[#1E293B] hover:text-red-300 transition-colors flex items-center gap-2"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 text-red-500" /> Delete Business
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-[#1E293B]/50 flex items-center justify-between bg-[#0B1120]/30 flex-wrap gap-4">
                    <div className="text-slate-500 text-xs">
                        Showing <span className="font-bold text-white">{(partners || []).length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} - {Math.min(currentPage * ITEMS_PER_PAGE, (partners || []).length)}</span> of {(partners || []).length} results
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-[#1E293B] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs transition-colors ${currentPage === page ? 'bg-[#FACC15] text-yellow-950' : 'text-slate-400 hover:text-white hover:bg-[#1E293B]'}`}>{page}</button>
                        ))}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-[#1E293B] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* Activation Modal */}
            {activateModalOpenFor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1120]/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#141E33] border-2 border-[#1E293B] rounded-[1.5rem] p-8 max-w-sm w-full shadow-2xl relative shadow-yellow-500/10">
                        <button onClick={() => setActivateModalOpenFor(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="mb-6 flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
                                <Key className="w-7 h-7 text-emerald-500" />
                            </div>
                            <h3 className="text-white text-xl font-bold mb-1">Activate Business</h3>
                            <p className="text-slate-400 text-xs">Enter partner portal credentials for<br/><span className="text-emerald-400 font-bold">{activateModalOpenFor.name}</span></p>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-300 text-xs font-bold mb-2">Portal ID</label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input type="text" placeholder="Partner ID" value={portalCreds.id} onChange={e=>setPortalCreds({...portalCreds, id: e.target.value})} className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-emerald-500/50 transition-colors" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-300 text-xs font-bold mb-2">Password</label>
                                <div className="relative">
                                    <Key className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input type="password" placeholder="••••••••" value={portalCreds.password} onChange={e=>setPortalCreds({...portalCreds, password: e.target.value})} className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-emerald-500/50 transition-colors" />
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => {
                                    updatePartnerStatus(activateModalOpenFor._id, 'ACTIVE', {
                                        username: portalCreds.id,
                                        password: portalCreds.password
                                    });
                                    setActivateModalOpenFor(null);
                                    setPortalCreds({ id: '', password: '' });
                                }}
                                className="w-full mt-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm"
                            >
                                Confirm Activation
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Analytics Sliding Drawer */}
            {analyticsDrawerOpenFor && (
                <>
                    <div className="fixed inset-0 bg-[#0B1120]/80 backdrop-blur-sm z-40 animate-in fade-in duration-200" onClick={() => setAnalyticsDrawerOpenFor(null)} />
                    <div className="fixed top-0 right-0 h-screen w-full md:w-[600px] bg-[#0B1120] border-l border-[#1E293B] z-50 animate-in slide-in-from-right duration-300 shadow-2xl overflow-y-auto">
                        <div className="p-6 sm:p-8 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8 flex-shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                                        <BarChart className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-white text-xl font-bold">{analyticsDrawerOpenFor.name}</h3>
                                        <p className="text-slate-400 text-sm">Performance Drill-down</p>
                                    </div>
                                </div>
                                <button onClick={() => setAnalyticsDrawerOpenFor(null)} className="text-slate-500 hover:text-white transition-colors bg-[#141E33] p-2 rounded-xl">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {loadingStats ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                </div>
                            ) : partnerStats ? (
                                <div className="space-y-6 flex-1">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-[1rem] p-5">
                                            <p className="text-slate-500 text-xs font-bold tracking-wider uppercase mb-2">Lifetime Scans</p>
                                            <p className="text-white text-3xl font-black">{partnerStats.totalScans || 0}</p>
                                        </div>
                                        <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-[1rem] p-5">
                                            <p className="text-slate-500 text-xs font-bold tracking-wider uppercase mb-2">Active Promos</p>
                                            <p className="text-white text-3xl font-black">{partnerStats.activeChallenges || 0}</p>
                                        </div>
                                    </div>

                                    <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-[1rem] p-6">
                                        <h4 className="text-white font-bold text-sm mb-6">30-Day Conversion Funnel</h4>
                                        <div className="h-[200px] w-full -ml-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={partnerStats.chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorIssuedDrawer" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#0E62E4" stopOpacity={0.4}/>
                                                            <stop offset="95%" stopColor="#0E62E4" stopOpacity={0}/>
                                                        </linearGradient>
                                                        <linearGradient id="colorRedeemedDrawer" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} dy={10} minTickGap={30} />
                                                    <RechartsTooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }} itemStyle={{ color: '#fff' }} cursor={{ stroke: '#1E293B', strokeWidth: 1 }} />
                                                    <Area type="monotone" dataKey="issued" name="Coupons Issued" stroke="#0E62E4" strokeWidth={3} fillOpacity={1} fill="url(#colorIssuedDrawer)" />
                                                    <Area type="monotone" dataKey="redeemed" name="Coupons Redeemed" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorRedeemedDrawer)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-[1rem] p-6 flex-1">
                                        <h4 className="text-white font-bold text-sm mb-4">Recent Customers</h4>
                                        {(!partnerStats.recentScans || partnerStats.recentScans.length === 0) ? (
                                            <div className="text-center py-8 text-slate-500 text-sm">No recent scans to show.</div>
                                        ) : (
                                            <div className="space-y-3">
                                                {partnerStats.recentScans.map((scan, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#0B1120] border border-[#1E293B]">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center text-xs">{(() => scan.user?.name?.charAt(0) || 'U')()}</div>
                                                            <div>
                                                                <p className="text-white text-sm font-bold">{scan.user?.phoneNumber || 'Unknown User'}</p>
                                                                <p className="text-slate-500 text-[10px]">{scan.challenge?.title || 'General Reward'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-emerald-500 text-xs font-black">SCAN</p>
                                                            <p className="text-slate-500 text-[10px]">{new Date(scan.redeemedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
