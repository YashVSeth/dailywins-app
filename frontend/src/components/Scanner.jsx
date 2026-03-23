import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const Scanner = ({ onScanSuccess, onScanFailure }) => {
  useEffect(() => {
    // Initialization configuration for the scanner
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      supportedScanTypes: [0] // 0 == QR_CODE
    };

    // Initialize scanner instance with verbose = false
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader", config, false
    );

    html5QrcodeScanner.render(
      (decodedText, decodedResult) => {
        // Prevent continuous scanning identical codes
        html5QrcodeScanner.pause(true);
        onScanSuccess(decodedText, decodedResult, () => {
             // callback to resume scanning after modal closes
             html5QrcodeScanner.resume();
        });
      },
      (error) => {
        if (onScanFailure) {
           onScanFailure(error);
        }
      }
    );

    // Cleanup when component unmounts
    return () => {
      html5QrcodeScanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-2xl shadow-2xl glass-panel relative group">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 rounded-2xl pointer-events-none backdrop-blur-md -z-10"></div>
        <div id="qr-reader" className="w-full border-0 bg-white/60 backdrop-blur pb-4"></div>
        <style dangerouslySetInnerHTML={{__html: `
            #qr-reader { border: none !important; border-radius: 1rem; overflow: hidden; }
            #qr-reader__scan_region { min-height: 250px; }
            #qr-reader__dashboard_section_csr button { 
               background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;
            }
            #qr-reader__dashboard_section_csr button:hover { background: #059669; }
            #qr-reader a { color: #10b981; text-decoration: none; }
        `}} />
    </div>
  );
};

export default Scanner;
