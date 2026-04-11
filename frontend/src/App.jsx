import React, { useState, useEffect } from 'react';
import Scanner from './components/Scanner';
import axios from 'axios';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/coupons/redeem`;

export default function App() {
  const [scanStatus, setScanStatus] = useState('idle'); // idle, loading, success, error
  const [resultMessage, setResultMessage] = useState('');
  const [userData, setUserData] = useState(null);
  const [resumeScanner, setResumeScanner] = useState(null);
  const navigate = useNavigate();

  // AUTH CHECK
  const [auth, setAuth] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const handleLogout = () => {
     localStorage.removeItem('partnerAuth');
     setAuth(null);
  };

  useEffect(() => {
     const stored = localStorage.getItem('partnerAuth');
     if (stored) setAuth(JSON.parse(stored));
     setAuthChecking(false);
  }, []);

  // 20-minute inactivity timer — must be declared before any early returns
  useEffect(() => {
     if (!auth) return; // skip timer when not authenticated
     let timeoutId;
     const resetTimer = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
           handleLogout();
        }, 20 * 60 * 1000); // 20 minutes
     };

     const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
     events.forEach(event => window.addEventListener(event, resetTimer));
     resetTimer();

     return () => {
        clearTimeout(timeoutId);
        events.forEach(event => window.removeEventListener(event, resetTimer));
     };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  // Early returns AFTER all hooks
  if (authChecking) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>;
  if (!auth) return <Navigate to="/login" replace />;

  const handleScanSuccess = async (decodedText, decodedResult, resumeCallback) => {
    console.log(`Scan success: ${decodedText}`);
    setScanStatus('loading');
    setResumeScanner(() => resumeCallback);

    try {
      const response = await axios.post(API_URL, { code: decodedText, partnerId: auth?.id });
      
      if (response.data.success) {
        setScanStatus('success');
        setResultMessage(response.data.message);
        setUserData(response.data.user);
      }
    } catch (error) {
       console.error(error);
       setScanStatus('error');
       if (error.response && error.response.data) {
           setResultMessage(error.response.data.message || 'Validation Failed');
       } else {
           setResultMessage('Network Error or Server Down');
       }
    }
  };

  const resetScanner = () => {
    setScanStatus('idle');
    setResultMessage('');
    setUserData(null);
    if (resumeScanner) {
       resumeScanner();
       setResumeScanner(null);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0B1120] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-[-20%] left-[-15%] w-[50%] h-[50%] bg-emerald-500/15 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[50%] h-[50%] bg-indigo-500/15 blur-[100px] rounded-full pointer-events-none" />

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 relative z-50 shrink-0">
        <button onClick={() => navigate('/partner/dashboard')} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-colors text-slate-400 hover:text-white backdrop-blur-md">
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 text-xs font-bold tracking-wider uppercase">Live</span>
        </div>
      </div>

      {/* Main Content — vertically centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 relative z-10">
        <div className="w-full max-w-sm flex flex-col items-center gap-5">
          
          {/* Header — compact on mobile */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Scan <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">QR Code</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">Verify customer rewards instantly</p>
          </div>

          {/* Scanner Container */}
          <div className={`w-full transition-all duration-500 ${scanStatus !== 'idle' ? 'opacity-0 scale-95 pointer-events-none absolute' : 'opacity-100 scale-100'}`}>
             <Scanner onScanSuccess={handleScanSuccess} />
          </div>

          {/* Result States */}
          {scanStatus !== 'idle' && (
            <div className="w-full bg-[#141E33]/80 backdrop-blur-xl border border-[#1E293B] p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center">
              
              {scanStatus === 'loading' && (
                <div className="flex flex-col items-center py-4">
                   <div className="w-16 h-16 rounded-full border-[3px] border-emerald-500/20 border-t-emerald-400 animate-spin mb-5" />
                   <h2 className="text-lg font-bold text-white">Verifying Code...</h2>
                   <p className="text-xs text-slate-500 mt-1">Checking secure ledger</p>
                </div>
              )}

              {scanStatus === 'success' && (
                <div className="flex flex-col items-center w-full">
                   <div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mb-5 ring-4 ring-emerald-500/10">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                   </div>
                   <h2 className="text-2xl font-black text-white mb-1">Approved!</h2>
                   <p className="text-emerald-400 font-bold text-sm mb-5 px-4 py-2 bg-emerald-500/10 rounded-lg">
                     {resultMessage}
                   </p>
                   
                   {userData && (
                      <div className="w-full bg-[#0B1120] rounded-xl p-4 mb-6 border border-[#1E293B]">
                          <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mb-1">Customer</p>
                          <p className="text-lg font-bold text-white">{userData}</p>
                      </div>
                   )}

                   <button 
                    onClick={resetScanner}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.97]"
                   >
                     Scan Next Customer
                   </button>
                </div>
              )}

              {scanStatus === 'error' && (
                <div className="flex flex-col items-center w-full">
                   <div className="w-20 h-20 bg-rose-500/15 rounded-full flex items-center justify-center mb-5 ring-4 ring-rose-500/10">
                      <XCircle className="w-10 h-10 text-rose-500" />
                   </div>
                   <h2 className="text-2xl font-black text-white mb-1">Invalid Code</h2>
                   <p className="text-rose-400 font-bold text-sm mb-6 px-4 py-2 bg-rose-500/10 rounded-lg">
                     {resultMessage}
                   </p>
                   
                   <button 
                    onClick={resetScanner}
                    className="w-full py-4 bg-[#1E293B] hover:bg-[#334155] text-white rounded-2xl font-black shadow-lg transition-all active:scale-[0.97]"
                   >
                     Try Again
                   </button>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
