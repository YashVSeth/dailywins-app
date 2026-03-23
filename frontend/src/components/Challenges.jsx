import React from 'react';
import { Target, ChevronRight, Info, Ticket, CheckCircle2, Loader2, Building2, Search } from 'lucide-react';

export default function Challenges({
    partners,
    promos,
    challengeFormData,
    setChallengeFormData,
    registerChallenge,
    challengeLoading,
    challengeMessage 
}) {
    return (
        <div className="w-full mt-4 pb-12 animate-in fade-in duration-300">
            <div className="mb-8">
                <div className="text-slate-500 text-xs font-semibold mb-2 flex items-center gap-1 uppercase tracking-widest">
                    <span>Challenges</span> <ChevronRight className="w-3 h-3" /> <span className="text-white">Create New Challenge</span>
                </div>
                <h2 className="text-white text-3xl font-bold mb-2">Create New Challenge</h2>
                <p className="text-slate-400 text-sm">Set up a new engagement goal to motivate your users and grow your community activity.</p>
            </div>
            
            <form onSubmit={registerChallenge} className="space-y-10">
                
                {/* Partner Selection */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-[#1E293B]/60 pt-8">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-white text-xs font-bold mb-3">Category</label>
                            <div className="relative">
                                <select value={challengeFormData.category} onChange={e=>setChallengeFormData({...challengeFormData, category: e.target.value})} className="appearance-none w-full bg-[#182136] border border-[#1E293B] rounded-xl pl-4 pr-10 py-3.5 text-sm font-medium text-slate-300 focus:outline-none focus:border-blue-500 transition-colors">
                                <option value="ENGAGEMENT">Engagement</option>
                                <option value="SALES">Sales</option>
                                <option value="REFERRAL">Referral</option>
                                <option value="LOCATION">Location Check-in</option>
                                <option value="MILESTONE">Milestone</option>
                                </select>
                                <ChevronRight className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 rotate-90" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-white text-xs font-bold mb-3">Difficulty</label>
                            <div className="flex items-center bg-[#182136] border border-[#1E293B] rounded-xl p-1">
                                <button type="button" onClick={()=>setChallengeFormData({...challengeFormData, difficulty: 'EASY'})} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${challengeFormData.difficulty==='EASY'?'bg-[#263452] text-white shadow-sm':'text-slate-400 hover:text-slate-300'}`}>Easy</button>
                                <button type="button" onClick={()=>setChallengeFormData({...challengeFormData, difficulty: 'MEDIUM'})} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${challengeFormData.difficulty==='MEDIUM'?'bg-[#263452] text-white shadow-sm':'text-slate-400 hover:text-slate-300'}`}>Med</button>
                                <button type="button" onClick={()=>setChallengeFormData({...challengeFormData, difficulty: 'HARD'})} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${challengeFormData.difficulty==='HARD'?'bg-[#263452] text-white shadow-sm':'text-slate-400 hover:text-slate-300'}`}>Hard</button>
                            </div>
                        </div>
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
                                {promos.map(pr => <option key={pr._id} value={pr._id}>{pr.title} ({pr.discountType === 'PERCENTAGE' ? pr.discountValue + '%' : '$' + pr.discountValue} OFF)</option>)}
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
                <div className="flex items-center justify-end gap-6 border-t border-[#1E293B]/60 pt-6 pb-2">
                    <button type="button" onClick={()=>setChallengeFormData({ title: '', description: '', category: 'ENGAGEMENT', difficulty: 'MEDIUM', targetMetric: '', durationDays: '', rewardPromoId: '', partnerId: '' })} className="text-slate-400 hover:text-white font-bold text-sm transition-colors">Discard</button>
                    <button type="submit" disabled={challengeLoading} className="px-8 py-3.5 bg-[#0E62E4] hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm">{challengeLoading ? <Loader2 className="w-5 h-5 mx-auto animate-spin"/> : 'Launch Challenge'}</button>
                </div>
                {challengeMessage && <div className="text-emerald-500 font-bold text-center mt-2 text-sm">{challengeMessage}</div>}

            </form>
        </div>
    );
}
