import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, AlertCircle, ShoppingBag, Calendar, Phone, MapPin } from 'lucide-react';

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
      <div className="min-h-screen bg-[#7a7a7a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
       <div className="min-h-screen bg-[#7a7a7a] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full flex flex-col items-center">
             <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-rose-500" />
             </div>
             <h1 className="text-2xl font-bold text-slate-800 mb-2">Oops!</h1>
             <p className="text-slate-500">{error}</p>
          </div>
       </div>
    );
  }

  const { coupon, qrCodeDataUrl } = data;

  // Assume expiry is 30 days from issuedAt if not present
  const expiryDate = new Date(coupon.issuedAt);
  expiryDate.setDate(expiryDate.getDate() + 30);
  const formattedExpiry = expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();
  
  // Format the title to highlight numbers/percentages
  const renderOfferTitle = () => {
      if (!coupon.challengeDescription) return <span className="text-[#5145E5]">REWARD</span>;
      
      const words = coupon.challengeDescription.split(' ');
      return words.map((word, i) => {
          if (/\d/.test(word) || /%/.test(word) || word.toUpperCase() === 'OFF') {
              return <span key={i} className="text-[#5145E5]">{word} </span>
          }
          return <span key={i} className="text-[#1E293B]">{word} </span>
      });
  };

  return (
    <div className="min-h-screen bg-[#7a7a7a] flex items-stretch md:items-center justify-center px-0 md:px-4 py-0 md:py-8 font-sans">
      <div className="bg-white rounded-none md:rounded-[2rem] shadow-2xl w-full max-w-[420px] flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 min-h-screen md:min-h-max">
        
        {/* Redeemed Overlay */}
        {coupon.status === 'Used' && (
           <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-[2rem]">
              <div className="transform -rotate-12 border-8 border-rose-500 text-rose-500 px-10 py-6 rounded-3xl text-5xl font-black uppercase tracking-widest opacity-90 shadow-2xl bg-white">
                 Redeemed
              </div>
           </div>
        )}

        <div className="pt-12 px-6 flex flex-col items-center text-center">
           <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#5145E5] rounded-[0.6rem] flex items-center justify-center shadow-lg shadow-indigo-500/30">
                 <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-[1.3rem] font-black text-[#1E293B] tracking-wide uppercase">{coupon.partner?.name || 'LUMINA RETAIL'}</h2>
           </div>

           <div className="text-[#5145E5] font-bold text-[11px] tracking-[0.15em] uppercase mb-4">
              Exclusive Reward
           </div>
           
           <div className="flex flex-col items-center justify-center gap-1 mb-6">
              <h1 className="text-[4rem] font-black tracking-tighter leading-none whitespace-normal w-full overflow-hidden text-center">
                 {renderOfferTitle()}
              </h1>
           </div>
           
           <p className="text-[#64748B] text-[15px] leading-[1.6] px-2 mb-2">
             Thank you for being a valued customer, <span className="font-semibold text-slate-700">{coupon.user?.name || coupon.user?.phoneNumber}</span>. {coupon.partner?.description ? `Use this voucher at ${coupon.partner.name}: ${coupon.partner.description}` : `Use this voucher on any item in our store.`}
           </p>
        </div>

        <div className="w-full border-t border-slate-50 my-6"></div>

        <div className="flex flex-col items-center w-full">
           <div className="text-slate-400 font-bold text-[11px] tracking-[0.15em] uppercase mb-6">
              Scan to Redeem
           </div>
           
           <div className="bg-[#F8FAFC] w-[180px] h-[180px] rounded-[1.75rem] flex items-center justify-center mb-6 border border-slate-100/60 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
              <img src={qrCodeDataUrl} alt="QR Code" className="w-[120px] h-[120px] mix-blend-multiply opacity-90" />
           </div>

           <p className="text-[#64748B] text-[15px] text-center px-10 mb-8 leading-snug">
              Present this code to the cashier at the time of purchase.
           </p>

           <div className="w-full px-6 flex flex-col gap-3">
             {coupon.partner?.location ? (
                <a href={`https://maps.google.com/?q=${encodeURIComponent(coupon.partner.location)}`} target="_blank" rel="noopener noreferrer" className="w-full py-[1.125rem] bg-[#5145E5] text-white rounded-[1rem] font-bold flex items-center justify-center gap-2.5 transition-all hover:bg-indigo-700 active:scale-[0.98] shadow-lg shadow-indigo-600/20 text-[17px]">
                   Find a Store <MapPin className="w-5 h-5" />
                </a>
             ) : (
                <a href={`tel:${coupon.partner?.phoneNumber}`} className="w-full py-[1.125rem] bg-[#5145E5] text-white rounded-[1rem] font-bold flex items-center justify-center gap-2.5 transition-all hover:bg-indigo-700 active:scale-[0.98] shadow-lg shadow-indigo-600/20 text-[17px]">
                   Contact Store <Phone className="w-4 h-4" />
                </a>
             )}
           </div>
        </div>

        <div className="mx-6 border-t-2 border-dashed border-slate-200/80 my-8"></div>

        <div className="flex flex-col items-center gap-1.5 pb-10 text-[#94A3B8]">
           <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5" /> 
              EXPIRES: {formattedExpiry}
           </div>
           <div className="text-[10px] uppercase tracking-[0.1em] font-medium mt-1">
              Terms and Conditions Apply
           </div>
        </div>

      </div>
    </div>
  );
};

export default RewardPage;

