'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera, RefreshCw } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanFailure, isOpen, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          onScanSuccess(decodedText);
          // Optional: stop scanning after success
          // scanner.clear();
        },
        (error) => {
          if (onScanFailure) onScanFailure(error);
        }
      );

      scannerRef.current = scanner;
      const timer = setTimeout(() => setIsScanning(true), 0);
      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(error => {
            console.error("Failed to clear html5QrcodeScanner. ", error);
          });
          scannerRef.current = null;
          setIsScanning(false);
        }
      };
    }
  }, [isOpen, onScanSuccess, onScanFailure]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-surface-container-low rounded-[2.5rem] border border-outline-variant/10 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-white">Leitor de QR Code</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-surface-container-highest rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-on-surface-variant" />
          </button>
        </div>

        <div className="p-8">
          <div id="qr-reader" className="overflow-hidden rounded-2xl border-2 border-dashed border-outline-variant/20 bg-black/20"></div>
          
          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-on-surface-variant">Posicione o código QR dentro do quadrado para leitura automática.</p>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
              <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
              Aguardando leitura...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
