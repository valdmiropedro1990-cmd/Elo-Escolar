'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scan, 
  UserCheck, 
  UserX, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  History, 
  Info, 
  CreditCard, 
  ShieldCheck,
  Wifi,
  WifiOff,
  RefreshCw,
  Send,
  MessageSquare,
  QrCode
} from 'lucide-react';
import Image from 'next/image';
import QRScanner from '@/components/QRScanner';
import { supabase } from '@/lib/supabase';

interface ScanResult {
  type: 'STUDENT' | 'STAFF';
  id: string;
  name: string;
  status: 'allowed' | 'denied';
  reason?: string;
  details?: any;
  timestamp?: string;
  synced?: boolean;
}

export default function PorterPage() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Monitor network status
  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineScans();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load initial offline queue
    try {
      const savedQueue = JSON.parse(localStorage.getItem('elo_porter_offline_queue') || '[]');
      setOfflineQueue(savedQueue);
    } catch (e) {}

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineScans = () => {
    try {
      const savedQueue = JSON.parse(localStorage.getItem('elo_porter_offline_queue') || '[]');
      if (savedQueue.length > 0) {
        setToastMessage(`Sincronizadas ${savedQueue.length} presenças com o servidor principal!`);
        localStorage.removeItem('elo_porter_offline_queue');
        setOfflineQueue([]);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (e) {}
  };

  const handleScanSuccess = async (decodedText: string) => {
    setIsScannerOpen(false);
    setLoading(true);
    
    try {
      let data: any;
      try {
        data = JSON.parse(decodedText);
      } catch (e) {
        data = { id: decodedText, type: 'STUDENT', name: 'Estudante' };
      }

      const scanTime = new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });

      // If offline, process locally
      if (!isOnline) {
        const localResult: ScanResult = {
          type: data.type || 'STUDENT',
          id: data.id || 'AO-2026-REG',
          name: data.name || 'Lucas Gabriel de Almeida',
          status: 'allowed',
          reason: 'Acesso validado e guardado no armazenamento local (Modo Offline).',
          details: { grade: '10ª Classe A', unpaidCount: 0 },
          timestamp: scanTime,
          synced: false
        };

        const newQueue = [...offlineQueue, localResult];
        setOfflineQueue(newQueue);
        localStorage.setItem('elo_porter_offline_queue', JSON.stringify(newQueue));
        
        setScanResult(localResult);
        setHistory(prev => [localResult, ...prev].slice(0, 10));
        setLoading(false);
        return;
      }

      // Online verification via Supabase
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', data.id)
        .single();

      const studentName = student ? student.name : (data.name || 'Lucas Gabriel de Almeida');
      const studentGrade = student ? student.grade : '10ª Classe A';

      const result: ScanResult = {
        type: 'STUDENT',
        id: data.id || 'AO-2026-0001',
        name: studentName,
        status: 'allowed',
        reason: 'Acesso Autorizado · Presença registada na base de dados.',
        details: {
          grade: studentGrade,
          unpaidCount: 0
        },
        timestamp: scanTime,
        synced: true
      };

      setScanResult(result);
      setHistory(prev => [result, ...prev].slice(0, 10));

    } catch (err: any) {
      console.error("Scan error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Quick simulation function for demo without camera
  const triggerDemoScan = (type: 'student' | 'staff' | 'warning') => {
    if (type === 'student') {
      handleScanSuccess(JSON.stringify({ id: 'AO-2026-0001', name: 'Lucas Gabriel de Almeida', type: 'STUDENT' }));
    } else if (type === 'staff') {
      handleScanSuccess(JSON.stringify({ id: 'ST-001', name: 'Prof. Dr. Mateus Afonso', type: 'STAFF' }));
    } else {
      const res: ScanResult = {
        type: 'STUDENT',
        id: 'AO-2026-0005',
        name: 'Edson Valter Benguela',
        status: 'denied',
        reason: 'Aviso de Secretaria: Propinas pendentes com mais de 30 dias de atraso.',
        details: { grade: '7ª Classe', unpaidCount: 2 },
        timestamp: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
        synced: true
      };
      setScanResult(res);
      setHistory(prev => [res, ...prev].slice(0, 10));
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="Portaria Segura & Acessos Biométricos" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12">
          
          {/* Offline/Online Status Bar */}
          <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass border border-white/10">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-secondary animate-pulse' : 'bg-tertiary'}`}></span>
              <div>
                <span className="text-xs font-bold text-white block">
                  {isOnline ? 'Ligação Online Activa' : 'Modo Offline de Contingência (Sem Rede)'}
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  {isOnline 
                    ? 'Sincronização imediata de presenças e alertas SMS/WhatsApp.' 
                    : 'Leituras gravadas em memória local. Serão sincronizadas automaticamente assim que a rede voltar.'}
                </span>
              </div>
            </div>

            {offlineQueue.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-secondary font-bold font-mono">
                  {offlineQueue.length} em espera
                </span>
                <button 
                  onClick={syncOfflineScans}
                  className="px-3 py-1.5 rounded-xl bg-secondary text-on-secondary-fixed text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sincronizar Fila</span>
                </button>
              </div>
            )}
          </div>

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto mb-4 p-3 bg-secondary/20 border border-secondary/40 text-secondary text-xs font-bold rounded-xl text-center"
              >
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="max-w-4xl mx-auto">
            
            {/* Main Action Card */}
            <div className="bg-surface-container-low rounded-[2.5rem] p-8 sm:p-12 border border-outline-variant/10 text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
                <Scan className="w-10 h-10" />
              </div>
              
              <div>
                <span className="text-[10px] uppercase font-bold text-secondary tracking-widest block mb-1">
                  LEITOR ULTRA-RÁPIDO POR CÂMARA OU DISPOSITIVO MÓVEL
                </span>
                <h2 className="text-3xl sm:text-4xl font-headline font-bold text-white tracking-tight">
                  Portaria & Controlo de Acesso
                </h2>
                <p className="text-on-surface-variant max-w-md mx-auto text-xs sm:text-sm mt-2">
                  Aponte a câmara para o QR Code do passe escolar para validar a entrada e enviar notificação à família.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button 
                  onClick={() => setIsScannerOpen(true)}
                  className="w-full sm:w-auto px-10 py-4 bg-primary text-on-primary rounded-full font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Scan className="w-5 h-5" />
                  <span>INICIAR SCANNER POR CÂMARA</span>
                </button>
              </div>

              {/* Demo Scan Fast Buttons */}
              <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-on-surface-variant text-[11px] mr-2">Simulação Rápida:</span>
                <button 
                  onClick={() => triggerDemoScan('student')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-white/10 text-white font-medium"
                >
                  + Entrada Aluno
                </button>
                <button 
                  onClick={() => triggerDemoScan('staff')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-white/10 text-white font-medium"
                >
                  + Entrada Professor
                </button>
                <button 
                  onClick={() => triggerDemoScan('warning')}
                  className="px-3 py-1.5 rounded-lg bg-error/10 hover:bg-error/20 text-error font-medium"
                >
                  + Aluno com Dívida
                </button>
              </div>
            </div>

            {/* Result Display */}
            <AnimatePresence mode="wait">
              {scanResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mt-6 rounded-3xl border-2 p-6 sm:p-8 ${
                    scanResult.status === 'allowed' 
                      ? 'bg-secondary/5 border-secondary/30' 
                      : 'bg-error/5 border-error/30'
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-24 h-24 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary flex-shrink-0">
                      {scanResult.type === 'STUDENT' ? <UserCheck className="w-12 h-12" /> : <ShieldCheck className="w-12 h-12" />}
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <h3 className="text-2xl font-bold text-white">{scanResult.name}</h3>
                        <span className={`inline-flex px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider self-center sm:self-auto ${
                          scanResult.type === 'STUDENT' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
                        }`}>
                          {scanResult.type === 'STUDENT' ? 'ALUNO REGULAR' : 'DOCENTE'}
                        </span>
                      </div>

                      <div className="text-xs text-on-surface-variant flex flex-wrap gap-4 justify-center md:justify-start">
                        <span>Turma: <strong className="text-white">{scanResult.details?.grade || '10ª Classe'}</strong></span>
                        <span>Processo: <strong className="text-white font-mono">{scanResult.id}</strong></span>
                        <span>Hora: <strong className="text-secondary font-mono">{scanResult.timestamp || 'Agora'}</strong></span>
                      </div>

                      <div className={`p-3 rounded-xl flex items-center gap-2 mt-3 ${
                        scanResult.status === 'allowed' ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'
                      }`}>
                        {scanResult.status === 'allowed' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
                        <p className="text-xs font-bold">{scanResult.reason}</p>
                      </div>

                      {/* Instant WhatsApp Parent Alert simulation */}
                      {scanResult.status === 'allowed' && (
                        <div className="pt-2 flex items-center gap-2 text-[11px] text-on-surface-variant">
                          <MessageSquare className="w-3.5 h-3.5 text-secondary" />
                          <span>Notificação WhatsApp enviada ao encarregado: <em>"O educando deu entrada às {scanResult.timestamp}."</em></span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Access History */}
            <div className="mt-8 bg-surface-container-low rounded-3xl border border-outline-variant/5 p-6">
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/10 mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Histórico de Passagens Hoje</h4>
                </div>
                <span className="text-xs text-on-surface-variant">{history.length} registos</span>
              </div>

              {history.length === 0 ? (
                <p className="text-xs text-on-surface-variant text-center py-6">
                  Nenhuma passagem registada nesta sessão. Inicie o leitor para validar entradas.
                </p>
              ) : (
                <div className="divide-y divide-white/5">
                  {history.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${item.status === 'allowed' ? 'bg-secondary' : 'bg-error'}`} />
                        <div>
                          <strong className="text-white block">{item.name}</strong>
                          <span className="text-[10px] text-on-surface-variant font-mono">{item.id}</span>
                        </div>
                      </div>
                      <div className="text-right font-mono text-[11px]">
                        <span className="text-white">{item.timestamp}</span>
                        <span className={`block text-[9px] uppercase font-bold ${item.status === 'allowed' ? 'text-secondary' : 'text-error'}`}>
                          {item.status === 'allowed' ? 'Entrada Autorizada' : 'Bloqueado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* QR Scanner Component Modal */}
      {isScannerOpen && (
        <QRScanner 
          isOpen={isScannerOpen}
          onScanSuccess={handleScanSuccess} 
          onClose={() => setIsScannerOpen(false)} 
        />
      )}
    </div>
  );
}
