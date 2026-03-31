import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Phone, Loader2, ChevronRight, Check, Building2, MessageCircle, ExternalLink, Gift, MoreHorizontal } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

import { useAdminStore } from '../store/useAdminStore';

export default function Rewards({
    rewardFormData,
    setRewardFormData,
    generateReward: parentGenerateReward,
    rewardLoading,
    rewardMessage,
    generatedCouponId,
    generatedQrCode
}) {
    const { challenges } = useAdminStore();
    const [todaysRewards, setTodaysRewards] = useState([]);
    const [loadingRewards, setLoadingRewards] = useState(true);

    // Only show active (non-expired) challenges
    const activeChallenges = (challenges || []).filter(c => c.isActive !== false);

    const fetchTodaysRewards = async () => {
        try {
            setLoadingRewards(true);
            const res = await axios.get(`${API_BASE}/coupons/today`);
            setTodaysRewards(res.data);
        } catch (err) {
            console.error('Error fetching today\'s rewards:', err);
        } finally {
            setLoadingRewards(false);
        }
    };

    useEffect(() => {
        fetchTodaysRewards();
    }, []);

    // Refresh list after generating a new reward
    useEffect(() => {
        if (generatedCouponId) {
            fetchTodaysRewards();
        }
    }, [generatedCouponId]);

    // Build WhatsApp URL
    const getWhatsAppUrl = () => {
        const phone = rewardFormData.phoneNumber.replace(/[\s\-()]/g, '');
        const rewardLink = `${window.location.origin}/reward/${generatedCouponId}`;
        const message = `🎉 Congratulations! You've earned a reward!\n\nClick below to view your exclusive coupon:\n${rewardLink}\n\nShow this QR code at the store to redeem your discount. 🛍️`;
        return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    };

    return (
        <div className="w-full mt-4 space-y-6 pb-12 animate-in fade-in duration-300">
            <div className="mb-8">
                <div className="text-slate-500 text-xs font-semibold mb-2 flex items-center gap-1 uppercase tracking-widest">
                    <span>DASHBOARD</span> <ChevronRight className="w-3 h-3" /> <span className="text-white">REWARD</span>
                </div>
                <h2 className="text-white text-3xl font-bold mb-2">Reward</h2>
                <p className="text-slate-400 text-sm">Select an active challenge and provide the customer's WhatsApp number to send them a reward link.</p>
            </div>
            
            <form onSubmit={parentGenerateReward} className="space-y-6">
                
                {/* Challenge Selection Card */}
                <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-[1rem] p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#0E62E4]/10 rounded-lg flex items-center justify-center">
                            <Target className="w-5 h-5 text-blue-500" />
                        </div>
                        <h3 className="text-white font-bold text-lg">Challenge Selection</h3>
                    </div>
                    
                    <div>
                        <label className="block text-slate-500 text-[10px] font-black tracking-widest uppercase mb-3">Select Challenge</label>
                        <div className="relative">
                            <Target className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                            <select 
                                required 
                                value={rewardFormData.challengeId}
                                onChange={e => setRewardFormData({...rewardFormData, challengeId: e.target.value})}
                                className="appearance-none w-full bg-[#182136] border border-[#1E293B] rounded-xl pl-11 pr-10 py-4 text-sm font-medium text-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="">Select an active challenge...</option>
                                {activeChallenges.map(ch => (
                                    <option key={ch._id} value={ch._id}>
                                        {ch.title} — {typeof ch.partner === 'object' ? ch.partner?.name : 'Business'}
                                    </option>
                                ))}
                            </select>
                            <ChevronRight className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 rotate-90" />
                        </div>
                    </div>

                    {/* Show selected challenge's business */}
                    {rewardFormData.challengeId && (() => {
                        const selected = activeChallenges.find(c => c._id === rewardFormData.challengeId);
                        if (!selected) return null;
                        return (
                            <div className="bg-[#0E62E4]/10 border border-[#0E62E4]/20 rounded-xl p-4 flex items-center gap-3">
                                <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                                <p className="text-slate-300 text-sm">
                                    QR will be redeemable only at: <span className="text-white font-bold">{typeof selected.partner === 'object' ? selected.partner?.name : 'Selected Business'}</span>
                                </p>
                            </div>
                        );
                    })()}
                </div>

                {/* WhatsApp Number Card */}
                <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-[1rem] p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h3 className="text-white font-bold text-lg">WhatsApp Number</h3>
                    </div>
                    
                    <div>
                        <label className="block text-slate-500 text-[10px] font-black tracking-widest uppercase mb-3">Mobile Number (with country code)</label>
                        <div className="relative">
                            <Phone className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input 
                                required 
                                type="tel" 
                                placeholder="919876543210" 
                                value={rewardFormData.phoneNumber} 
                                onChange={e => setRewardFormData({...rewardFormData, phoneNumber: e.target.value})} 
                                className="w-full bg-[#182136] border border-[#1E293B] rounded-xl pl-11 pr-4 py-4 text-sm font-medium text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500" 
                            />
                        </div>
                        <p className="text-slate-600 text-[10px] italic mt-3">Enter number with country code, no + or spaces (e.g. 919876543210)</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-4">
                    <button type="submit" disabled={rewardLoading} className="flex-1 max-w-xs bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm flex items-center justify-center gap-2">
                        {rewardLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <MessageCircle className="w-4 h-4" />}
                        {rewardLoading ? 'Generating...' : 'Send via WhatsApp'}
                    </button>
                    <button type="button" onClick={() => setRewardFormData({ phoneNumber: '', challengeId: '' })} className="flex-1 max-w-xs bg-[#182136] border border-[#1E293B] hover:bg-[#1E293B] text-white font-bold py-4 rounded-xl transition-all text-sm">
                        Cancel
                    </button>
                </div>
                
                {rewardMessage && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl flex items-center gap-3 max-w-2xl">
                        <Check className="w-5 h-5" />
                        <span className="text-sm font-bold">{rewardMessage}</span>
                    </div>
                )}

                {/* WHATSAPP SEND SECTION */}
                {generatedCouponId && (
                    <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-[#141E33]/60 border border-emerald-500/30 rounded-[1.25rem] p-8 mt-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <MessageCircle className="w-64 h-64 rotate-12" />
                            </div>
                            
                            <div className="w-16 h-16 bg-[#25D366]/10 rounded-2xl flex items-center justify-center mb-4">
                                <MessageCircle className="w-8 h-8 text-[#25D366]" />
                            </div>
                            
                            <h3 className="text-white text-xl font-black uppercase tracking-widest mb-2 relative z-10">Reward Ready!</h3>
                            <p className="text-emerald-400 text-sm mb-8 relative z-10 max-w-md">The coupon has been generated. Click below to open WhatsApp and send it to <span className="text-white font-bold">{rewardFormData.phoneNumber}</span></p>
                            
                            {generatedQrCode && (
                                <div className="bg-white p-3 rounded-2xl shadow-[0_0_40px_rgba(37,211,102,0.1)] mb-6 relative z-10">
                                    <img src={generatedQrCode} alt="Generated QR" className="w-[140px] h-[140px] object-contain mix-blend-multiply" />
                                </div>
                            )}
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full relative z-10">
                                <a 
                                    href={getWhatsAppUrl()} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-10 py-4 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 text-sm flex items-center gap-3 hover:scale-105 active:scale-95"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Open WhatsApp
                                </a>
                                <a 
                                    href={`${window.location.origin}/reward/${generatedCouponId}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-8 py-4 bg-[#0B1120] hover:bg-[#182136] text-white font-bold rounded-xl transition-all text-sm flex items-center gap-2 border border-[#1E293B]"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Preview Reward Page
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </form>

            {/* TODAY'S REWARDS TABLE */}
            <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-2xl overflow-hidden mt-10">
                <div className="px-6 py-4 flex items-center justify-between border-b border-[#1E293B]/50 gap-4">
                    <div className="flex items-center gap-3">
                        <Gift className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-white font-bold text-sm">Today's Generated Rewards</h3>
                        <span className="text-[10px] font-black text-slate-500 bg-[#0B1120] px-2.5 py-1 rounded-full border border-[#1E293B]">{todaysRewards.length}</span>
                    </div>
                    <button onClick={fetchTodaysRewards} className="text-slate-500 hover:text-white transition-colors text-xs font-bold">Refresh</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#1E293B]/50 bg-[#0B1120]/50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <th className="px-6 py-4">Mobile No.</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Challenge</th>
                                <th className="px-6 py-4 hidden md:table-cell">Partner</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingRewards ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center">
                                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : todaysRewards.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-500 text-sm font-medium">No rewards generated today yet.</td>
                                </tr>
                            ) : (
                                todaysRewards.map((r, i) => (
                                    <tr key={r._id || i} className="border-b border-[#1E293B]/30 hover:bg-[#1E293B]/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                <span className="text-white font-bold text-sm">{r.phoneNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm hidden sm:table-cell font-medium">{r.challenge}</td>
                                        <td className="px-6 py-4 text-slate-400 text-sm hidden md:table-cell">
                                            <div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-slate-500" /> {r.partner}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm font-medium whitespace-nowrap">
                                            {new Date(r.issuedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {r.status === 'Used' ? (
                                                <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black tracking-widest uppercase">Redeemed</span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black tracking-widest uppercase">Active</span>
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
