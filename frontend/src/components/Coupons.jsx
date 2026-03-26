import React, { useState } from 'react';
import { Ticket, Building2, Info, Tag, Calendar, ChevronRight, Loader2, Search, Download, Plus, Filter, MoreHorizontal, ChevronLeft, LayoutGrid, Trash2 } from 'lucide-react';

export default function Coupons({
    stats,
    partners,
    promos,
    promoFormData,
    setPromoFormData,
    createPromo,
    promoLoading,
    promoMessage,
    updatePromoStatus,
    deletePromo
}) {
    const [isAddingCoupon, setIsAddingCoupon] = useState(false);
    const [actionMenuOpenId, setActionMenuOpenId] = useState(null);

    return (
        <div className="w-full mt-4 pb-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-white text-3xl font-black mb-1.5 tracking-tight">Active Coupons</h2>
                    <p className="text-slate-400 text-sm">Create, distribute, and manage promotional offers across all business partners.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[#141E33]/80 hover:bg-[#1E293B] border border-[#1E293B] text-white rounded-xl text-sm font-bold transition-colors">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button onClick={() => setIsAddingCoupon(!isAddingCoupon)} className="flex items-center gap-2 px-5 py-2.5 bg-[#0E62E4] hover:bg-blue-600 text-white rounded-xl text-sm font-black transition-colors shadow-lg shadow-blue-500/20">
                        <Plus className="w-4 h-4" /> Create Coupon
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-2xl p-6">
                    <h3 className="text-slate-400 text-xs font-bold mb-3 uppercase tracking-wider">Total Coupons</h3>
                    <div className="flex items-end gap-3">
                        <span className="text-white text-3xl font-black">{stats?.totalCoupons || '0'}</span>
                    </div>
                </div>
                <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-2xl p-6">
                    <h3 className="text-slate-400 text-xs font-bold mb-3 uppercase tracking-wider">Active Coupons</h3>
                    <div className="flex items-end gap-3">
                        <span className="text-white text-3xl font-black">{((stats?.totalCoupons || 0) - (stats?.redeemedCoupons || 0)) || '0'}</span>
                    </div>
                </div>
            </div>

            {isAddingCoupon && (
                <div className="bg-[#0B1120] border-2 border-[#1E293B] hover:border-blue-500/50 transition-colors rounded-2xl p-8 mb-10 relative overflow-hidden group shadow-[0_0_30px_rgba(14,98,228,0.03)] focus-within:shadow-[0_0_30px_rgba(14,98,228,0.05)] focus-within:border-blue-500/50">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
                    
                    <button onClick={() => setIsAddingCoupon(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                        <div className="p-1 rounded-full hover:bg-[#1E293B] transition-colors"><Plus className="w-5 h-5 rotate-45" /></div>
                    </button>

                    <div className="mb-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                            <Ticket className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-white text-xl font-bold">Create New Coupon Form</h2>
                            <p className="text-slate-400 text-sm">Configure discount rules and assignments for your partners.</p>
                        </div>
                    </div>
                    
                    <form onSubmit={createPromo} className="space-y-6">
                        
                        {/* Business Selection Card */}
                        <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-[1rem] overflow-hidden">
                            <div className="px-6 py-4 flex items-center gap-2 border-b border-[#1E293B]/50">
                            <Building2 className="w-4 h-4 text-orange-500" />
                            <h3 className="text-white font-bold text-sm">Business Selection</h3>
                            </div>
                            <div className="p-6">
                            <label className="block text-slate-300 text-xs font-bold mb-3">Assigned Business</label>
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                <select required value={promoFormData.partnerId} onChange={e=>setPromoFormData({...promoFormData, partnerId: e.target.value})} className="appearance-none w-full bg-[#0B1120] border border-[#1E293B] rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-slate-400 focus:outline-none focus:border-blue-500 transition-colors">
                                    <option value="">Search and select a business...</option>
                                    {partners?.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
                                <ChevronRight className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 rotate-90" />
                            </div>
                            </div>
                        </div>

                        {/* Coupon Details Card */}
                        <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-[1rem] overflow-hidden">
                            <div className="px-6 py-4 flex items-center gap-2 border-b border-[#1E293B]/50">
                            <Info className="w-4 h-4 text-orange-500" />
                            <h3 className="text-white font-bold text-sm">Coupon Details</h3>
                            </div>
                            <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-slate-300 text-xs font-bold mb-3">Coupon Name</label>
                                <input required type="text" placeholder="e.g. Summer Flash Sale" value={promoFormData.title} onChange={e=>setPromoFormData({...promoFormData, title: e.target.value})} className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-[#1E293B]" />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-xs font-bold mb-3">Description</label>
                                <textarea placeholder="Describe the promotion..." value={promoFormData.description} onChange={e=>setPromoFormData({...promoFormData, description: e.target.value})} rows="3" className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-[#1E293B] resize-none"></textarea>
                            </div>
                            </div>
                        </div>

                        {/* Discount Configuration Card */}
                        <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-[1rem] overflow-hidden">
                            <div className="px-6 py-4 flex items-center gap-2 border-b border-[#1E293B]/50">
                            <Tag className="w-4 h-4 text-orange-500" />
                            <h3 className="text-white font-bold text-sm">Discount Configuration</h3>
                            </div>
                            <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-slate-300 text-xs font-bold mb-3">Discount Type</label>
                                    <div className="flex items-center bg-[#0B1120] border border-[#1E293B] rounded-xl p-1">
                                        <button type="button" onClick={()=>setPromoFormData({...promoFormData, discountType:'PERCENTAGE'})} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${promoFormData.discountType === 'PERCENTAGE' ? 'bg-[#263452] text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>Percentage</button>
                                        <button type="button" onClick={()=>setPromoFormData({...promoFormData, discountType:'FIXED_AMOUNT'})} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${promoFormData.discountType === 'FIXED_AMOUNT' ? 'bg-[#263452] text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>Fixed Amount</button>
                                    </div>
                                </div>
                                {promoFormData.discountType === 'PERCENTAGE' ? (
                                    <div>
                                        <label className="block text-slate-300 text-xs font-bold mb-3">Discount Percentage</label>
                                        <div className="relative">
                                            <input required type="number" placeholder="20" value={promoFormData.discountValue} onChange={e=>setPromoFormData({...promoFormData, discountValue: e.target.value})} className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-[#1E293B]" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">%</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-slate-300 text-xs font-bold mb-3">Total Amount</label>
                                        <div className="relative flex items-center">
                                            <span className="absolute left-4 text-slate-400 font-bold text-sm">$</span>
                                            <input required type="number" placeholder="50.00" value={promoFormData.discountValue} onChange={e=>setPromoFormData({...promoFormData, discountValue: e.target.value})} className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl pl-8 pr-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-[#1E293B]" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 pt-2">
                            <button type="submit" disabled={promoLoading} className="flex-1 bg-[#0E62E4] hover:bg-[#0E62E4]/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm">{promoLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : 'Deploy Coupon'}</button>
                            <button type="button" onClick={()=>setPromoFormData({ title: '', description: '', partnerId: '', discountType: 'PERCENTAGE', discountValue: '', minSpend: '', validUntil: '', usageLimit: '' })} className="px-8 py-4 bg-[#0B1120] border border-[#1E293B] hover:bg-[#141E33] text-white font-bold rounded-xl transition-all text-sm">Discard</button>
                        </div>
                        {promoMessage && <div className="text-emerald-500 mt-2 text-sm text-center font-bold mb-6">{promoMessage}</div>}

                    </form>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-2xl overflow-hidden mt-8">
                <div className="px-6 py-4 flex items-center justify-between border-b border-[#1E293B]/50 gap-4 flex-wrap">
                    <div className="flex items-center gap-8">
                        <button className="text-[#0E62E4] font-bold text-sm border-b-2 border-[#0E62E4] pb-4 -mb-[17px]">All Coupons</button>
                        <button className="text-slate-400 hover:text-white font-bold text-sm pb-4 -mb-[17px] transition-colors">Active</button>
                        <button className="text-slate-400 hover:text-white font-bold text-sm pb-4 -mb-[17px] transition-colors">Expired</button>
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
                                <th className="px-6 py-4 hidden sm:table-cell">Assigned Business</th>
                                <th className="px-6 py-4 hidden md:table-cell">Discount</th>
                                <th className="px-6 py-4 hidden lg:table-cell">Total Redemptions</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(promos || []).map((p, i) => (
                                <tr key={p._id || i} className="border-b border-[#1E293B]/30 hover:bg-[#1E293B]/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-black text-xs">
                                                <Ticket className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-white font-bold text-sm mb-0.5 whitespace-nowrap">{p.title}</div>
                                                <div className="text-slate-500 text-[11px]">ID: CP-081{3+i}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm hidden sm:table-cell">
                                        <div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-slate-500" /> {typeof p.partner === 'object' ? p.partner?.name : p.partner}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm hidden md:table-cell font-bold">
                                        {p.discountType === 'PERCENTAGE' ? (
                                            <span className="text-emerald-400">{p.discountValue}% OFF</span>
                                        ) : (
                                            <span className="text-orange-400">${p.discountValue} OFF</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm hidden lg:table-cell whitespace-nowrap">
                                        0 Scans
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.status === 'PAUSED' ? (
                                            <span className="px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[9px] font-black tracking-widest uppercase">Inactive</span>
                                        ) : p.status === 'EXPIRED' ? (
                                            <span className="px-2.5 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 text-[9px] font-black tracking-widest uppercase">Expired</span>
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
                                                    onClick={() => {
                                                        setActionMenuOpenId(null);
                                                        updatePromoStatus(p._id, 'ACTIVE');
                                                    }}
                                                    className="w-full px-4 py-2.5 text-xs font-bold text-emerald-400 hover:bg-[#1E293B] transition-colors flex items-center gap-2"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Set Active
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setActionMenuOpenId(null);
                                                        updatePromoStatus(p._id, 'PAUSED');
                                                    }}
                                                    className="w-full px-4 py-2.5 text-xs font-bold text-orange-400 hover:bg-[#1E293B] transition-colors flex items-center gap-2"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> Set Inactive
                                                </button>
                                                <div className="h-px w-full bg-[#1E293B]"></div>
                                                <button 
                                                    onClick={() => {
                                                        setActionMenuOpenId(null);
                                                        deletePromo(p._id);
                                                    }}
                                                    className="w-full px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-[#1E293B] hover:text-red-300 transition-colors flex items-center gap-2"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 text-red-500" /> Delete Promo
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
                        Showing <span className="font-bold text-white">{promos?.length > 0 ? 1 : 0} - {promos?.length || 0}</span> of {promos?.length || 0} results
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-[#1E293B] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0E62E4] text-white font-bold text-xs">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] font-bold text-xs transition-colors">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] font-bold text-xs transition-colors">3</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-[#1E293B] transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

        </div>
    );
}
