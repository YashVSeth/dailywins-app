import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, AlertCircle, Bell, User, CheckCircle2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RewardPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReward = async () => {
      try {
        const res = await axios.get(`${API_BASE}/coupons/${id}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Reward not found or expired.');
      } finally {
        setLoading(false);
      }
    };
    fetchReward();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
       <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-[#141E33] border border-[#1E293B] p-8 rounded-2xl shadow-2xl max-w-sm w-full flex flex-col items-center">
             <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-rose-500" />
             </div>
             <h1 className="text-2xl font-bold text-white mb-2">Oops!</h1>
             <p className="text-slate-400">{error}</p>
          </div>
       </div>
    );
  }

  const { coupon, qrCodeDataUrl } = data;

  // Expiry
  const expiryDate = coupon.redeemedAt ? new Date(coupon.redeemedAt) : new Date(coupon.issuedAt);
  if (!coupon.redeemedAt) expiryDate.setDate(expiryDate.getDate() + 30);
  const formattedExpiry = expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // Challenge info
  const challengeTitle = coupon.challengeDescription || coupon.challenge?.title || 'REWARD VOUCHER';
  const partnerName = coupon.partner?.name || 'Partner Business';
  const discountText = coupon.challenge?.rewardPromoId
    ? (coupon.challenge.rewardPromoId.discountType === 'PERCENTAGE'
        ? `${coupon.challenge.rewardPromoId.discountValue}% OFF`
        : `$${coupon.challenge.rewardPromoId.discountValue} OFF`)
    : 'REWARD';

  const isRedeemed = coupon.status === 'Used';

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center font-sans">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col">

        {/* Top Navigation */}
        <div className="flex items-center px-5 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <span className="font-extrabold text-lg tracking-tight">
              <span className="text-blue-500">Daily</span><span className="text-yellow-400">Wins</span>
            </span>
          </div>
        </div>

        {/* Challenge Completed Banner */}
        <div className="mx-4 mt-4 rounded-2xl overflow-hidden relative"
             style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}>
          
          {/* Redeemed Overlay */}
          {isRedeemed && (
            <div className="absolute inset-0 bg-[#0B1120]/80 backdrop-blur-sm z-30 flex items-center justify-center rounded-2xl">
              <div className="transform -rotate-12 border-4 border-rose-500 text-rose-500 px-8 py-4 rounded-2xl text-3xl font-black uppercase tracking-widest opacity-90">
                Redeemed
              </div>
            </div>
          )}

          <div className="flex flex-col items-center text-center py-8 px-6">
            <span className="px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-full mb-5 shadow-lg shadow-emerald-500/30">
              Challenge Completed
            </span>
            <h1 className="text-white text-2xl sm:text-3xl font-black uppercase italic tracking-wide leading-tight mb-4">
              {challengeTitle}
            </h1>
            <div className="w-10 h-1 bg-yellow-400 rounded-full mb-4"></div>
            <p className="text-blue-400 text-sm font-semibold tracking-wide">
              {coupon.partner?.description || 'Exclusive Voucher'}
            </p>
          </div>
        </div>

        {/* Voucher Card */}
        <div className="mx-4 mt-4 bg-[#141E33] border border-[#1E293B] rounded-2xl overflow-hidden">
          
          {/* Partner & Discount Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E293B]/60">
            <div>
              <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] block mb-1">Partner</span>
              <span className="text-white font-black text-lg">{partnerName}</span>
            </div>
            <div className="bg-yellow-400 text-[#0B1120] px-4 py-2 rounded-lg font-black text-sm tracking-wide shadow-lg shadow-yellow-400/20">
              {discountText}
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center py-8 px-6">
            <div className="bg-[#1E293B] w-[180px] h-[180px] rounded-2xl flex items-center justify-center border border-[#334155] shadow-[inset_0_2px_20px_rgba(0,0,0,0.3)] relative overflow-hidden">
              {/* Decorative corner borders */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-pink-500/60 rounded-tl-md"></div>
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-pink-500/60 rounded-tr-md"></div>
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-pink-500/60 rounded-bl-md"></div>
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-pink-500/60 rounded-br-md"></div>
              
              <img src={qrCodeDataUrl} alt="QR Code" className="w-[130px] h-[130px] object-contain" style={{ filter: 'invert(1)' }} />
            </div>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-5">In-Store Redemption</span>
          </div>

          {/* Expiry & Status */}
          <div className="flex items-center justify-between px-6 py-5 border-t border-[#1E293B]/60">
            <div>
              <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] block mb-1">Expiry Date</span>
              <span className="text-white font-bold text-sm">{formattedExpiry}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] block mb-1 text-right">Status</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className={`w-4 h-4 ${isRedeemed ? 'text-rose-500' : 'text-emerald-500'}`} />
                <span className={`font-black text-sm ${isRedeemed ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {isRedeemed ? 'USED' : 'READY'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Redemption Policy */}
        <div className="mx-4 mt-6 px-1">
          <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Redemption Policy</h4>
          <p className="text-slate-500 text-xs leading-relaxed">
            Present this QR code at any participating {partnerName} location. Single use only. Cannot be combined with other offers. Subject to availability and seasonal booking windows.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-10 pb-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6">
            <span className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.15em] hover:text-slate-400 cursor-pointer transition-colors">Terms</span>
            <span className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.15em] hover:text-slate-400 cursor-pointer transition-colors">Privacy</span>
            <span className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.15em] hover:text-slate-400 cursor-pointer transition-colors">Support</span>
          </div>
          <p className="text-slate-700 text-[10px] font-semibold uppercase tracking-[0.15em]">
            © 2024 DailyWins Victory Pulse
          </p>
        </div>

      </div>
    </div>
  );
};

export default RewardPage;
