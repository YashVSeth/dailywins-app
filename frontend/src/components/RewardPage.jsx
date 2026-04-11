import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, AlertCircle, CheckCircle2, Trophy } from 'lucide-react';
import rewardLogo from '../assets/rewardPage logo.png';

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
      <div className="min-h-[100dvh] bg-[#0B1120] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
       <div className="min-h-[100dvh] bg-[#0B1120] flex flex-col items-center justify-center p-6 text-center">
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
    <div className="min-h-[100dvh] bg-[#0B1120] flex flex-col items-center font-sans">
      <div className="w-full max-w-[420px] min-h-[100dvh] flex flex-col relative overflow-hidden">

        {/* Decorative Background Glow */}
        <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[40%] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute top-[30%] right-[-20%] w-[50%] h-[30%] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        {/* Header - DailyWins Branding */}
        <div className="flex items-center justify-center px-5 pt-8 pb-4 relative z-10 w-full overflow-hidden">
           <div className="w-56 sm:w-64 flex items-center justify-center">
              <img src={rewardLogo} alt="DailyWins Logo" className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300" />
           </div>
        </div>

        {/* Challenge Completed Banner */}
        <div className="mx-4 mt-2 rounded-2xl relative overflow-hidden bg-gradient-to-b from-[#141E33] to-[#0B1120] border border-[#1E293B] border-t-4 border-t-yellow-400 shadow-[0_10px_30px_rgba(250,204,21,0.05)]">
          
          {/* Theme-matching Confetti / Orbs background */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
             <div className="absolute top-4 left-6 w-3 h-3 bg-blue-500/40 rounded-full blur-[1px]"></div>
             <div className="absolute top-12 left-10 w-2 h-2 bg-yellow-400/60 rounded-full"></div>
             <div className="absolute bottom-6 right-8 w-5 h-5 bg-yellow-400/10 rounded-full blur-[2px]"></div>
             <div className="absolute top-8 right-12 w-2 h-2 bg-pink-500/50 rounded-full"></div>
             <div className="absolute bottom-4 left-10 w-4 h-4 bg-emerald-500/20 rounded-full blur-[1px]"></div>
          </div>

          <div className="flex flex-col items-center text-center py-8 px-6 relative z-10">
            <span className="px-5 py-1.5 bg-[#0B1120] border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-5 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Challenge Completed
            </span>
            <h1 className="text-white text-2xl sm:text-3xl font-black uppercase italic tracking-wide leading-tight mb-4 drop-shadow-md">
              {challengeTitle}
            </h1>
            <div className="flex items-center gap-1 mb-5">
               <div className="w-8 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
               <div className="w-2 h-1 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.3)]"></div>
            </div>
            <p className="text-slate-300 text-sm font-medium tracking-wide px-2 uppercase text-[11px] tracking-widest">
              {coupon.partner?.description || 'Exclusive Voucher'}
            </p>
          </div>
        </div>

        {/* Voucher Ticket Card */}
        <div className="mx-4 mt-6 bg-[#141E33] border border-[#1E293B] rounded-2xl flex flex-col relative shadow-xl z-10">
          
          {/* Redeemed Stamp Overlay */}
          {isRedeemed && (
            <div className="absolute inset-0 z-40 flex items-center justify-center rounded-2xl pointer-events-none bg-[#0B1120]/80 backdrop-blur-sm">
              <div className="transform -rotate-12 border-4 border-rose-500 text-rose-500 px-8 py-3 rounded-2xl text-3xl font-black uppercase tracking-widest opacity-90 shadow-lg drop-shadow-md">
                USED
              </div>
            </div>
          )}

          {/* Top Section: Partner & Badge */}
          <div className="px-6 py-6 pb-8">
             <div className="flex flex-col items-center gap-4 text-center">
                <div>
                   <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">Redeem At</span>
                   <span className="text-white font-black text-xl">{partnerName}</span>
                </div>
                <div className="bg-yellow-400 text-slate-900 px-6 py-2 rounded-xl font-black text-[15px] tracking-wide shadow-lg shadow-yellow-400/20">
                   {discountText}
                </div>
             </div>
          </div>

          {/* Perforated Divider */}
          <div className="relative flex items-center justify-between w-full h-8 -my-4 z-20">
             <div className="w-6 h-6 bg-[#0B1120] rounded-full -ml-3 shadow-inner"></div>
             <div className="w-full h-px bg-slate-700/50 bg-[length:10px_10px] bg-dashed mx-2"></div>
             <div className="w-6 h-6 bg-[#0B1120] rounded-full -mr-3 shadow-inner"></div>
          </div>

          {/* Bottom Section: QR Code */}
          <div className="flex flex-col items-center px-6 pt-8 pb-6 bg-[#182136] rounded-b-2xl">
            <div className={`relative p-5 bg-[#0B1120] rounded-2xl border border-[#1E293B] flex items-center justify-center ${isRedeemed ? 'opacity-40 grayscale' : ''}`}>
              {/* Minimal Emerald Corner Brackets */}
              <div className="absolute top-[-2px] left-[-2px] w-6 h-6 border-t-[3px] border-l-[3px] border-emerald-500 rounded-tl-xl pointer-events-none"></div>
              <div className="absolute top-[-2px] right-[-2px] w-6 h-6 border-t-[3px] border-r-[3px] border-emerald-500 rounded-tr-xl pointer-events-none"></div>
              <div className="absolute bottom-[-2px] left-[-2px] w-6 h-6 border-b-[3px] border-l-[3px] border-emerald-500 rounded-bl-xl pointer-events-none"></div>
              <div className="absolute bottom-[-2px] right-[-2px] w-6 h-6 border-b-[3px] border-r-[3px] border-emerald-500 rounded-br-xl pointer-events-none"></div>
              
              <div className="w-[160px] h-[160px] bg-white rounded-xl p-2 shadow-sm">
                 <img src={qrCodeDataUrl} alt="QR Code" className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 mb-2">
               <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em]">Scan at Counter</span>
               <div className="w-1 h-1 rounded-full bg-slate-600"></div>
               <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.15em] bg-emerald-500/10 px-2 py-1 rounded">
                  In-Store Only
               </span>
            </div>
            
            {/* Expiry & Status Inline Row */}
            <div className="w-full flex items-center justify-between mt-6 pt-4 border-t border-[#334155]/50">
              <div className="flex flex-col">
                <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Valid Until</span>
                <span className="text-slate-300 font-bold text-sm">{formattedExpiry}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Status</span>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                     {!isRedeemed && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                     <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRedeemed ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                  </span>
                  <span className={`font-black text-sm tracking-wide ${isRedeemed ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {isRedeemed ? 'USED' : 'READY'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Redemption Policy */}
        <div className="mx-6 mt-8 mb-4">
          <h4 className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
             <div className="h-px bg-slate-700/50 flex-1"></div>
             Redemption Policy
             <div className="h-px bg-slate-700/50 flex-1"></div>
          </h4>
          <p className="text-slate-400/80 text-[11px] font-medium leading-relaxed text-center">
            Present this QR code at any participating <strong className="text-slate-300">{partnerName}</strong> location. Single use only. Cannot be combined with other offers. Valid only during standard business hours.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 pb-8 flex flex-col items-center gap-5 z-10 w-full bg-gradient-to-t from-[#0B1120] to-transparent">
          <div className="flex items-center gap-8 border-b border-slate-800/60 pb-5 w-[80%] justify-center">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em] hover:text-slate-300 cursor-pointer transition-colors">Terms</span>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em] hover:text-slate-300 cursor-pointer transition-colors">Privacy</span>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em] hover:text-slate-300 cursor-pointer transition-colors">Support</span>
          </div>
          <div className="flex flex-col items-center gap-2">
             <div className="flex items-center gap-1.5 opacity-60">
                <div className="h-4 w-4 bg-blue-500/10 rounded-full flex items-center justify-center">
                   <Trophy className="w-2.5 h-2.5 text-yellow-500" />
                </div>
                <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest mt-0.5">
                   DailyWins
                </span>
             </div>
             <p className="text-slate-700 text-[9px] font-semibold uppercase tracking-[0.15em]">
               © 2026 Victory Pulse
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RewardPage;
