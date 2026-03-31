import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Download, Save, Lock, Loader2, Bell, Database } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Settings() {
    // Password Form State
    const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdMessage, setPwdMessage] = useState({ text: '', type: '' });

    // Mock Config State
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [autoApprove, setAutoApprove] = useState(false);

    // Profile Metadata
    let adminData = {};
    try {
        adminData = JSON.parse(localStorage.getItem('adminAuth')) || {};
    } catch (e) {
        console.warn('Failed to parse admin data', e);
    }

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPwdMessage({ text: '', type: '' });

        if (pwdData.newPassword !== pwdData.confirmPassword) {
            return setPwdMessage({ text: 'New passwords do not match.', type: 'error' });
        }
        if (pwdData.newPassword.length < 6) {
            return setPwdMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
        }

        setPwdLoading(true);
        try {
            await axios.patch(`${API_BASE}/admin/password`, {
                currentPassword: pwdData.currentPassword,
                newPassword: pwdData.newPassword
            }, {
                headers: { Authorization: `Bearer ${adminData?.token}` }
            });
            setPwdMessage({ text: 'Password successfully updated!', type: 'success' });
            setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setPwdMessage({ 
                text: error.response?.data?.message || 'Failed to update password. Check current password.', 
                type: 'error' 
            });
        } finally {
            setPwdLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        try {
            const res = await axios.get(`${API_BASE}/stats/report`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `DailyWins_Export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading report:', err);
            alert('Failed to generate report. Please try again.');
        }
    };

    return (
        <div className="w-full mt-4 pb-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-white text-3xl font-black mb-1.5 tracking-tight">Platform Settings</h2>
                <p className="text-slate-400 text-sm">Manage security, configurations, and system data exports.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Security & Password Card */}
                <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-2xl overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-[#1E293B]/50 flex items-center gap-4 bg-[#0B1120]/50">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold">Account Security</h3>
                            <p className="text-slate-500 text-xs mt-0.5">Logged in as {adminData.username || 'System Root'}</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handlePasswordUpdate} className="p-6 flex-1 flex flex-col">
                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wide">Current Password</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input 
                                        type="password" required 
                                        value={pwdData.currentPassword}
                                        onChange={(e) => setPwdData({...pwdData, currentPassword: e.target.value})}
                                        className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-[#334155]" 
                                        placeholder="••••••••" 
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-2">
                                <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wide mt-2">New Password</label>
                                <input 
                                    type="password" required 
                                    value={pwdData.newPassword}
                                    onChange={(e) => setPwdData({...pwdData, newPassword: e.target.value})}
                                    className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-[#334155]" 
                                    placeholder="Enter new strong password" 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wide">Confirm New Password</label>
                                <input 
                                    type="password" required 
                                    value={pwdData.confirmPassword}
                                    onChange={(e) => setPwdData({...pwdData, confirmPassword: e.target.value})}
                                    className="w-full bg-[#0B1120] border border-[#1E293B] rounded-xl px-4 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-[#334155]" 
                                    placeholder="Verify new password" 
                                />
                            </div>
                        </div>

                        {pwdMessage.text && (
                            <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${pwdMessage.type === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                {pwdMessage.text}
                            </div>
                        )}

                        <div className="mt-auto pt-6 border-t border-[#1E293B]/50 flex justify-end">
                            <button type="submit" disabled={pwdLoading} className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-70 disabled:pointer-events-none shadow-lg shadow-indigo-500/20">
                                {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Update Credentials
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Column (Configs & Data) */}
                <div className="flex flex-col gap-8 h-full">
                    
                    {/* Platform Configurations */}
                    <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Bell className="w-5 h-5 text-yellow-500" />
                            <h3 className="text-white font-bold text-lg">System Behaviors</h3>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Toggle 1 */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-200 font-bold text-sm">Automated Email Digests</p>
                                    <p className="text-slate-500 text-xs mt-1">Receive End-of-Day platform analytics directly to your inbox.</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setEmailAlerts(!emailAlerts)}
                                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${emailAlerts ? 'bg-yellow-500' : 'bg-[#1E293B]'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailAlerts ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {/* Toggle 2 */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-200 font-bold text-sm">Auto-Approve Partner Registrations</p>
                                    <p className="text-slate-500 text-xs mt-1">Allow businesses to onboard safely without Admin review.</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setAutoApprove(!autoApprove)}
                                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${autoApprove ? 'bg-yellow-500' : 'bg-[#1E293B]'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoApprove ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Database Management */}
                    <div className="bg-[#141E33]/30 border border-[#1E293B] rounded-2xl p-6 md:p-8 flex-1">
                        <div className="flex items-center gap-3 mb-6">
                            <Database className="w-5 h-5 text-emerald-500" />
                            <h3 className="text-white font-bold text-lg">Data Management</h3>
                        </div>
                        
                        <div className="bg-[#0B1120] border border-[#1E293B] rounded-xl p-5 mb-6 shadow-md">
                            <h4 className="text-slate-300 font-bold text-sm mb-2">Raw Ledger Export</h4>
                            <p className="text-slate-500 text-xs leading-relaxed mb-4">
                                Download a complete historical CVS report of every coupon generated, scanned, and claimed across the entire system.
                            </p>
                            <button onClick={handleDownloadReport} className="flex items-center gap-2 bg-[#1E293B] hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-colors">
                                <Download className="w-4 h-4 text-emerald-400" /> Backup Database (CSV)
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
