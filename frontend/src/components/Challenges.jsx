import React, { useState } from 'react';
import { Target, ChevronRight, Info, Ticket, CheckCircle2, Loader2, Building2, Search, Download, Plus, Filter, MoreHorizontal, Trash2 } from 'lucide-react';

export default function Challenges({
    challenges,
    partners,
    promos,
    challengeFormData,
    setChallengeFormData,
    registerChallenge,
    challengeLoading,
    challengeMessage,
    deleteChallenge
}) {
    const [isAddingChallenge, setIsAddingChallenge] = useState(false);
    const [actionMenuOpenId, setActionMenuOpenId] = useState(null);

    return (
        <div className="w-full mt-4 pb-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-white text-3xl font-black mb-1.5 tracking-tight">Active Challenges</h2>
                    <p className="text-slate-400 text-sm">Set up engagement goals to motivate users and grow community activity.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[#141E33]/80 hover:bg-[#1E293B] border border-[#1E293B] text-white rounded-xl text-sm font-bold transition-colors">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button onClick={() => setIsAddingChallenge(!isAddingChallenge)} className="flex items-center gap-2 px-5 py-2.5 bg-[#0E62E4] hover:bg-blue-600 text-white rounded-xl text-sm font-black transition-colors shadow-lg shadow-blue-500/20">
                        <Plus className="w-4 h-4" /> Create Challenge
                    </button>
                </div>
            </div>
            
            {isAddingChallenge && (
            <form onSubmit={registerChallenge} className="space-y-10 bg-[#0B1120] border-2 border-[#1E293B] rounded-[1.5rem] p-8 mb-10 shadow-[0_0_30px_rgba(14,98,228,0.03)]">
                {/* Partner Selection */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
                    <div className="lg:col-span-4">
                    <h3 className="text-white font-bold text-lg mb-2">Business Selection</h3>
                    <p className="text-slate-400 text-sm leading-relaxed pr-4">Select the partner business this challenge is linked to. QR codes from this challenge will only be redeemable at this business.</p>
                    </div>
                    <div className="lg:col-span-8 bg-[#141E33]/30 border border-[#1E293B] rounded-[1rem] p-6">
                    <div>
                        <label className="block text-white text-xs font-bold mb-3">Assigned Business</label>
                        <div className="relative">
                            <Building2 className="w-4 h-4 text-orange-500 absolute left-4 top-1/2 -translate-y-1/2" />
                            <select required value={challengeFormData.partnerId} onChange={e=>setChallengeFormData({...challengeFormData, partnerId: e.target.value})} className="appearance-none w-full bg-[#182136] border border-[#1E293B] rounded-xl pl-11 pr-10 py-3.5 text-sm font-medium text-slate-300 focus:outline-none focus:border-blue-500 transition-colors">
                                <option value="">Select a business...</option>
                                {partners?.filter(p => p.status === 'ACTIVE').map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </select>
                            <ChevronRight className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 rotate-90" />
                        </div>
                    </div>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-[#1E293B]/60 pt-8">
                    <div className="lg:col-span-4">
                    <h3 className="text-white font-bold text-lg mb-2">Basic Information</h3>
                    <p className="text-slate-400 text-sm leading-relaxed pr-4">Provide the core details that users will see first.</p>
                    </div>
                    <div className="lg:col-span-8 bg-[#141E33]/30 border border-[#1E293B] rounded-[1rem] p-6 space-y-6">
                    <div>
                        <label className="block text-white text-xs font-bold mb-3">Challenge Name</label>
                        <input required type="text" placeholder="e.g. Summer Fitness Marathon" value={challengeFormData.title} onChange={e=>setChallengeFormData({...challengeFormData, title: e.target.value})} className="w-full bg-[#182136] border border-[#1E293B] rounded-xl px-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-[#334155]" />
                    </div>
                    <div>
                        <label className="block text-white text-xs font-bold mb-3">Description</label>
                        <textarea required placeholder="What is this challenge about and how can users participate?" value={challengeFormData.description} onChange={e=>setChallengeFormData({...challengeFormData, description: e.target.value})} rows="4" className="w-full bg-[#182136] border border-[#1E293B] rounded-xl px-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-[#334155] resize-none"></textarea>
                    </div>

                    </div>
                </div>

                {/* Duration & Timing */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-[#1E293B]/60 pt-8">
                    <div className="lg:col-span-4">
                    <h3 className="text-white font-bold text-lg mb-2">Duration & Timing</h3>
                    <p className="text-slate-400 text-sm leading-relaxed pr-4">Set how long the challenge will run for users to complete.</p>
                    </div>
                    <div className="lg:col-span-8 bg-[#141E33]/30 border border-[#1E293B] rounded-[1rem] p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-white text-xs font-bold mb-3">Duration (Days)</label>
                            <div className="relative">
                                <input required type="number" placeholder="14" value={challengeFormData.durationDays} onChange={e=>setChallengeFormData({...challengeFormData, durationDays: e.target.value})} className="w-full bg-[#182136] border border-[#1E293B] rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-[#0E62E4]/10 border border-[#0E62E4]/20 rounded-xl p-4 flex items-start gap-3">
                        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-slate-300 text-sm">
                            This challenge will run for <span className="text-white font-bold">{challengeFormData.durationDays || '14'} days</span> based on your selection.
                        </p>
                    </div>
                    </div>
                </div>

                {/* Linked Reward */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-[#1E293B]/60 pt-8">
                    <div className="lg:col-span-4">
                    <h3 className="text-white font-bold text-lg mb-2">Linked Reward</h3>
                    <p className="text-slate-400 text-sm leading-relaxed pr-4">Select the promotional coupon users will unlock upon completing this challenge.</p>
                    </div>
                    <div className="lg:col-span-8 bg-[#141E33]/30 border border-[#1E293B] rounded-[1rem] p-6">
                    <div>
                        <label className="block text-white text-xs font-bold mb-3">Reward Coupon</label>
                        <div className="relative">
                            <Ticket className="w-4 h-4 text-orange-500 absolute left-4 top-1/2 -translate-y-1/2" />
                            <select value={challengeFormData.rewardPromoId} onChange={e=>setChallengeFormData({...challengeFormData, rewardPromoId: e.target.value})} className="appearance-none w-full bg-[#182136] border border-[#1E293B] rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-slate-300 focus:outline-none focus:border-blue-500 transition-colors">
                                <option value="">Select a generated coupon (Optional)...</option>
                                {promos?.map(pr => <option key={pr._id} value={pr._id}>{pr.title} ({pr.discountType === 'PERCENTAGE' ? pr.discountValue + '%' : '$' + pr.discountValue} OFF)</option>)}
                            </select>
                            <ChevronRight className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 rotate-90" />
                        </div>
                        <div className="bg-[#182136]/50 border border-[#1E293B]/50 rounded-lg p-3 mt-4 flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <p className="text-slate-400 text-xs">The selected coupon's rules and expiry parameters will automatically enforce upon issuance.</p>
                        </div>
                    </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center gap-4 pt-2">
                    <button type="submit" disabled={challengeLoading} className="flex-1 bg-[#0E62E4] hover:bg-[#0E62E4]/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm">{challengeLoading ? <Loader2 className="w-5 h-5 mx-auto animate-spin"/> : 'Launch Challenge'}</button>
                    <button type="button" onClick={()=>{setChallengeFormData({ title: '', description: '', category: 'ENGAGEMENT', difficulty: 'MEDIUM', targetMetric: '', durationDays: '', rewardPromoId: '', partnerId: '' }); setIsAddingChallenge(false);}} className="px-8 py-4 bg-[#0B1120] border border-[#1E293B] hover:bg-[#141E33] text-white font-bold rounded-xl transition-all text-sm">Discard</button>
                </div>
                {challengeMessage && <div className={`font-bold text-center mt-6 text-sm ${challengeMessage.includes('Error') ? 'text-red-500' : 'text-emerald-500'}`}>{challengeMessage}</div>}

            </form>
            )}

            {/* Data Table */}
            <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-2xl overflow-hidden mt-8">
                <div className="px-6 py-4 flex items-center justify-between border-b border-[#1E293B]/50 gap-4 flex-wrap">
                    <div className="flex items-center gap-8">
                        <button className="text-[#0E62E4] font-bold text-sm border-b-2 border-[#0E62E4] pb-4 -mb-[17px]">All Challenges</button>
                        <button className="text-slate-400 hover:text-white font-bold text-sm pb-4 -mb-[17px] transition-colors">Active</button>
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
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Business</th>
                                <th className="px-6 py-4 hidden md:table-cell">Duration</th>
                                <th className="px-6 py-4 hidden lg:table-cell">Reward Promo</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(challenges || []).map((ch, i) => (
                                <tr key={ch._id || i} className="border-b border-[#1E293B]/30 hover:bg-[#1E293B]/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center font-black text-xs">
                                                <Target className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-white font-bold text-sm mb-0.5 whitespace-nowrap">{ch.title}</div>
                                                <div className="text-slate-500 text-[11px]">ID: CH-{ch._id?.toString().substring(0,6).toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm hidden sm:table-cell">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-3.5 h-3.5 text-slate-500" /> 
                                            {typeof ch.partner === 'object' ? ch.partner?.name : ch.partner}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm hidden md:table-cell font-bold">
                                        {ch.durationDays} Days
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm hidden lg:table-cell whitespace-nowrap">
                                        {typeof ch.rewardPromoId === 'object' ? ch.rewardPromoId?.title : ch.rewardPromoId || 'None'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {ch.isActive ? (
                                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black tracking-widest uppercase">Active</span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 text-[9px] font-black tracking-widest uppercase">Expired</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button onClick={() => setActionMenuOpenId(actionMenuOpenId === ch._id ? null : ch._id)} className="text-slate-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#1E293B]">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                        
                                        {actionMenuOpenId === ch._id && (
                                            <div className="absolute right-6 top-10 w-36 bg-[#0B1120] border border-[#1E293B] rounded-xl shadow-xl z-20 overflow-hidden text-left animate-in slide-in-from-top-2 duration-200">
                                                <button 
                                                    onClick={() => {
                                                        setActionMenuOpenId(null);
                                                        deleteChallenge(ch._id);
                                                    }}
                                                    className="w-full px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-[#1E293B] hover:text-red-300 transition-colors flex items-center gap-2"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 text-red-500" /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {(challenges || []).length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-500 text-sm font-medium">No challenges configured yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
