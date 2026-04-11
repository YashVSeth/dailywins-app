import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera } from 'lucide-react';

const Scanner = ({ onScanSuccess, onScanFailure }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  const startScanner = async () => {
    setIsStarting(true);
    setError('');

    try {
      // Create scanner if not exists
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-video-element');
      } else {
        // Stop existing scanner before re-starting
        try { await scannerRef.current.stop(); } catch { /* ignore stop errors if scanner is already stopped */ }
      }

      const qrboxSize = Math.min(window.innerWidth - 80, 260);

      await scannerRef.current.start(
        { facingMode: "environment" }, // strictly defaults to the rear camera reliably across all mobile OS
        {
          fps: 12,
          qrbox: { width: qrboxSize, height: qrboxSize },
          aspectRatio: 1.0,
        },
        (decodedText, decodedResult) => {
          // Pause scanning on success
          scannerRef.current.pause(true);
          onScanSuccess(decodedText, decodedResult, () => {
            // Resume callback
            try { scannerRef.current.resume(); } catch { /* ignore resume errors */ }
          });
        },
        (errorMessage) => {
          if (onScanFailure) onScanFailure(errorMessage);
        }
      );

      setIsStarted(true);
    } catch (err) {
      console.error('Scanner start error:', err);
      if (err?.toString().includes('NotAllowedError')) {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else {
        setError('Failed to start rear camera. Please ensure camera permissions are active.');
      }
    } finally {
      setIsStarting(false);
    }
  };

  // Not started — show permission/start screen
  if (!isStarted) {
    return (
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-sm mx-auto bg-[#0B1120] border border-[#1E293B] rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
          
          {/* Animated scanner icon */}
          <div className="relative z-10 w-24 h-24 mb-6 flex items-center justify-center">
            {/* Corner brackets */}
            <svg viewBox="0 0 96 96" className="absolute inset-0 w-full h-full">
              <path d="M8 28V12a4 4 0 014-4h16" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" className="animate-pulse" />
              <path d="M68 8h16a4 4 0 014 4v16" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" className="animate-pulse" style={{animationDelay:'0.15s'}} />
              <path d="M88 68v16a4 4 0 01-4 4H68" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" className="animate-pulse" style={{animationDelay:'0.3s'}} />
              <path d="M28 88H12a4 4 0 01-4-4V68" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" className="animate-pulse" style={{animationDelay:'0.45s'}} />
            </svg>
            <Camera className="w-10 h-10 text-emerald-400" />
          </div>

          <h3 className="text-white text-xl font-bold mb-2 relative z-10">Ready to Scan</h3>
          <p className="text-slate-400 text-sm mb-8 relative z-10 max-w-[240px]">
            Tap below to activate the rear camera and start scanning customer QR codes
          </p>

          {error && (
            <div className="w-full mb-4 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium relative z-10">
              {error}
            </div>
          )}

          <button
            onClick={() => startScanner()}
            disabled={isStarting}
            className="relative z-10 w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isStarting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting Camera...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Activate Camera
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Scanner active — show viewfinder
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-sm mx-auto relative" ref={containerRef}>
        {/* Scanner viewport with dark frame */}
        <div className="relative bg-[#0B1120] rounded-3xl overflow-hidden border border-[#1E293B] shadow-2xl shadow-black/40">
          
          {/* Camera feed */}
          <div id="qr-video-element" className="w-full" />

          {/* Corner bracket overlay */}
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="relative" style={{ width: Math.min(window.innerWidth - 80, 260), height: Math.min(window.innerWidth - 80, 260) }}>
              {/* Top-left */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-emerald-400 rounded-tl-lg" />
              {/* Top-right */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-emerald-400 rounded-tr-lg" />
              {/* Bottom-left */}
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-emerald-400 rounded-bl-lg" />
              {/* Bottom-right */}
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-emerald-400 rounded-br-lg" />
              
              {/* Scan line animation */}
              <div className="absolute left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80 animate-scanline" />
            </div>
          </div>
        </div>

        {/* Hint text */}
        <p className="text-center text-slate-500 text-xs font-medium mt-4 tracking-wide">
          Point your rear camera at the QR code
        </p>
      </div>

      {/* Scan line keyframes injected */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanline {
          0% { top: 8px; opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { top: calc(100% - 8px); opacity: 0; }
        }
        .animate-scanline {
          animation: scanline 2.5s ease-in-out infinite;
        }
        /* Hide html5-qrcode built-in branding */
        #qr-video-element img[alt*="Info"],
        #qr-video-element a[href*="scanapp"],
        #qr-video-element > div:last-child {
          display: none !important;
        }
        #qr-video-element video {
          border-radius: 1rem !important;
          object-fit: cover !important;
          transform: none !important; /* Ensure no mirror effect on rear camera */
        }
        #qr-video-element {
          border: none !important;
          position: relative;
        }
        /* Hide the qr-shaded-region default border */
        #qr-shaded-region {
          border-color: rgba(0,0,0,0.5) !important;
        }
      `}} />
    </div>
  );
};

export default Scanner;
