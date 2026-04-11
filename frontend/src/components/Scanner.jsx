import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera } from 'lucide-react';

const Scanner = ({ onScanSuccess, onScanFailure }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        scannerRef.current = null;
        try {
          // html5-qrcode .stop() and .clear() can throw synchronously and crash React
          scanner.stop()
            .then(() => {
              try { scanner.clear(); } catch (e) { /* ignore */ }
            })
            .catch(() => {
              try { scanner.clear(); } catch (e) { /* ignore */ }
            });
        } catch (e) {
          try { scanner.clear(); } catch (err) { /* ignore */ }
        }
      }
    };
  }, []);

  const startScanner = async () => {
    setIsStarting(true);
    setError('');

    // Small delay allows the DOM to render the <div id="qr-video-element"> before the library binds to it
    setTimeout(async () => {
      try {
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode('qr-video-element');
        } else {
          try { await scannerRef.current.stop(); } catch { /* ignore stop errors */ }
        }

        const qrboxSize = Math.min(window.innerWidth - 80, 260);

        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) {
          setError('No cameras found on this device.');
          setIsStarting(false);
          return;
        }

        const backCamera = devices.find(d => 
          d.label.toLowerCase().includes('back') || 
          d.label.toLowerCase().includes('rear') || 
          d.label.toLowerCase().includes('environment')
        );

        const targetCameraId = backCamera ? backCamera.id : devices[devices.length - 1].id;

        await scannerRef.current.start(
          targetCameraId,
          {
            fps: 12,
            qrbox: { width: qrboxSize, height: qrboxSize },
            aspectRatio: 1.0,
          },
          (decodedText, decodedResult) => {
            scannerRef.current.pause(true);
            onScanSuccess(decodedText, decodedResult, () => {
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
          setError(`Failed to start camera: ${err?.message || err?.toString()}`);
        }
      } finally {
        setIsStarting(false);
      }
    }, 50); // 50ms react render commit buffer
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Ready UI - Shown when completely stopped or while starting up */}
      {!isStarted && (
        <div className="w-full max-w-sm mx-auto bg-[#0B1120] border border-[#1E293B] rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden mb-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 w-24 h-24 mb-6 flex items-center justify-center">
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
            onClick={startScanner}
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
      )}

      {/* The Scanner Viewfinder Container - Must always exist in DOM once "Activate" is clicked so library can bind to it. 
          We hide it visually while the camera is not active yet to prevent a white/black box from showing up early. */}
      { (isStarted || isStarting) && (
        <div className={`w-full max-w-sm mx-auto relative transition-opacity duration-300 ${!isStarted ? 'opacity-0 absolute inset-0 pointer-events-none' : 'opacity-100'}`} ref={containerRef}>
          <div className="relative bg-[#0B1120] rounded-3xl overflow-hidden border border-[#1E293B] shadow-2xl shadow-black/40">
            <div id="qr-video-element" className="w-full min-h-[300px]" />

            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
              <div className="relative" style={{ width: Math.min(window.innerWidth - 80, 260), height: Math.min(window.innerWidth - 80, 260) }}>
                <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-emerald-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-emerald-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-emerald-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-emerald-400 rounded-br-lg" />
                <div className="absolute left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80 animate-scanline" />
              </div>
            </div>
          </div>
          <p className="text-center text-slate-500 text-xs font-medium mt-4 tracking-wide">
            Point your rear camera at the QR code
          </p>
        </div>
      )}

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
        #qr-video-element img[alt*="Info"],
        #qr-video-element a[href*="scanapp"],
        #qr-video-element > div:last-child {
          display: none !important;
        }
        #qr-video-element video {
          border-radius: 1rem !important;
          object-fit: cover !important;
          transform: none !important;
        }
        #qr-video-element {
          border: none !important;
          position: relative;
        }
        #qr-shaded-region {
          border-color: rgba(0,0,0,0.5) !important;
        }
      `}} />
    </div>
  );
};

export default Scanner;
