import React, { useState, useEffect } from 'react';
import Scanner from './components/Scanner';
import axios from 'axios';
import { CheckCircle2, XCircle, Loader2, ScanLine } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/30 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/30 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Back Navigation */}
      <div className="absolute top-4 left-4 z-50">
         <button onClick={() => navigate('/partner/dashboard')} className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 rounded-xl text-sm font-medium transition-colors text-slate-300 hover:text-white backdrop-blur-md">
            ← Back to Dashboard
         </button>
      </div>

      <div className="w-full max-w-md z-10 flex flex-col items-center gap-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-2 shadow-lg backdrop-blur-sm border border-white/10">
             <ScanLine className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-sm">
            Partner Scanner
          </h1>
          <p className="text-slate-400 text-sm font-medium">Verify community rewards instantly</p>
        </div>

        {/* Scanner Container */}
        <div className={`w-full transition-all duration-500 ${scanStatus !== 'idle' ? 'opacity-0 scale-95 pointer-events-none absolute' : 'opacity-100 scale-100'}`}>
           <Scanner onScanSuccess={handleScanSuccess} />
        </div>

        {/* Result States */}
        {scanStatus !== 'idle' && (
          <div className="w-full bg-slate-800/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center transform transition-all animate-in zoom-in-95 fade-in duration-300">
            
            {scanStatus === 'loading' && (
              <div className="flex flex-col items-center animate-pulse">
                 <Loader2 className="w-16 h-16 text-emerald-400 animate-spin mb-4" />
                 <h2 className="text-xl font-semibold text-slate-200">Verifying Code...</h2>
                 <p className="text-sm text-slate-400 mt-2">Checking secure ledger</p>
              </div>
            )}

            {scanStatus === 'success' && (
              <div className="flex flex-col items-center w-full">
                 <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-2">Approved!</h2>
                 <p className="text-emerald-400 font-medium mb-6 px-4 py-2 bg-emerald-500/10 rounded-lg">
                   {resultMessage}
                 </p>
                 
                 {userData && (
                    <div className="w-full bg-slate-900/50 rounded-xl p-4 mb-8 border border-white/5">
                        <p className="text-sm text-slate-400 mb-1">Customer Name</p>
                        <p className="text-lg font-semibold text-white">{userData}</p>
                    </div>
                 )}

                 <button 
                  onClick={resetScanner}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
                 >
                   Scan Next Customer
                 </button>
              </div>
            )}

            {scanStatus === 'error' && (
              <div className="flex flex-col items-center w-full">
                 <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
                    <XCircle className="w-12 h-12 text-rose-500" />
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-2">Invalid Code</h2>
                 <p className="text-rose-400 font-medium mb-8 px-4 py-2 bg-rose-500/10 rounded-lg">
                   {resultMessage}
                 </p>
                 
                 <button 
                  onClick={resetScanner}
                  className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95"
                 >
                   Try Again
                 </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
