'use client';

import React, { useState } from 'react';
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
  ShieldCheck
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
}

const PorterPage = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ScanResult[]>([]);

  const handleScanSuccess = async (decodedText: string) => {
    setIsScannerOpen(false);
    setLoading(true);
    
    try {
      const data = JSON.parse(decodedText);
      if (!data.id || !data.type) throw new Error("Formato inválido");

      if (data.type === 'STUDENT') {
        // Check student in Supabase
        const { data: student, error } = await supabase
          .from('students')
          .select('*, payments(*)')
          .eq('student_id', data.id)
          .single();

        if (error || !student) {
          setScanResult({
            type: 'STUDENT',
            id: data.id,
            name: data.name || 'Desconhecido',
            status: 'denied',
            reason: 'Aluno não encontrado no sistema.'
          });
          return;
        }

        // Check payments (propinas)
        const unpaidMonths = student.payments?.filter((p: any) => p.status !== 'Pago') || [];
        const isAllowed = unpaidMonths.length === 0;

        const result: ScanResult = {
          type: 'STUDENT',
          id: student.student_id,
          name: student.name,
          status: isAllowed ? 'allowed' : 'denied',
          reason: isAllowed ? 'Tudo em dia.' : `Dívida de ${unpaidMonths.length} meses de propina.`,
          details: {
            grade: student.grade,
            photo: student.photo_url,
            unpaidCount: unpaidMonths.length
          }
        };
        setScanResult(result);
        setHistory(prev => [result, ...prev].slice(0, 10));

      } else if (data.type === 'STAFF') {
        // Check staff in Supabase
        const { data: staff, error } = await supabase
          .from('staff')
          .select('*')
          .eq('staff_id', data.id)
          .single();

        if (error || !staff) {
          setScanResult({
            type: 'STAFF',
            id: data.id,
            name: data.name || 'Desconhecido',
            status: 'denied',
            reason: 'Funcionário não encontrado ou inativo.'
          });
          return;
        }

        const isAllowed = staff.status === 'active' || staff.status === 'Ativo';
        const result: ScanResult = {
          type: 'STAFF',
          id: staff.staff_id,
          name: staff.name,
          status: isAllowed ? 'allowed' : 'denied',
          reason: isAllowed ? 'Funcionário Ativo.' : 'Acesso Negado: Funcionário Inativo.',
          details: {
            role: staff.role,
            dept: staff.department,
            photo: staff.photo_url
          }
        };
        setScanResult(result);
        setHistory(prev => [result, ...prev].slice(0, 10));
      }

    } catch (error) {
      console.error("Scan error:", error);
      setScanResult({
        type: 'STUDENT',
        id: 'ERR',
        name: 'Erro de Leitura',
        status: 'denied',
        reason: 'O código QR lido não é válido ou está corrompido.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-white">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="Controlo de Portaria" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12">
          <div className="max-w-4xl mx-auto">
            {/* Main Action */}
            <div className="bg-surface-container-low rounded-[3rem] p-12 border border-outline-variant/10 text-center space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              
              <div className="relative space-y-4">
                <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <Scan className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-4xl font-black tracking-tight">Leitura de Acesso</h2>
                <p className="text-on-surface-variant max-w-md mx-auto">Aponte a câmara para o QR Code do passe do aluno ou funcionário para validar a entrada.</p>
              </div>

              <button 
                onClick={() => setIsScannerOpen(true)}
                className="group relative px-12 py-6 bg-primary text-on-primary-fixed rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 mx-auto"
              >
                <Scan className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                INICIAR SCANNER
              </button>
            </div>

            {/* Result Display */}
            <AnimatePresence mode="wait">
              {scanResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mt-8 rounded-[3rem] border-2 p-8 ${
                    scanResult.status === 'allowed' 
                      ? 'bg-secondary/5 border-secondary/20' 
                      : 'bg-error/5 border-error/20'
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="relative w-40 h-40 rounded-[2.5rem] overflow-hidden ring-4 ring-white/10 shadow-2xl">
                      {scanResult.details?.photo ? (
                        <Image src={scanResult.details.photo} alt={scanResult.name} fill className="object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                          {scanResult.type === 'STUDENT' ? <UserCheck className="w-16 h-16" /> : <ShieldCheck className="w-16 h-16" />}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <h3 className="text-3xl font-black">{scanResult.name}</h3>
                        <span className={`inline-flex px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          scanResult.type === 'STUDENT' ? 'bg-tertiary/20 text-tertiary' : 'bg-primary/20 text-primary'
                        }`}>
                          {scanResult.type === 'STUDENT' ? 'ALUNO' : 'FUNCIONÁRIO'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-on-surface-variant">
                          <Info className="w-5 h-5" />
                          <span className="font-bold">{scanResult.details?.grade || scanResult.details?.role || '---'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-on-surface-variant">
                          <CreditCard className="w-5 h-5" />
                          <span className="font-bold">ID: {scanResult.id}</span>
                        </div>
                        {scanResult.type === 'STUDENT' && (
                          <div className="flex items-center gap-3 text-error">
                            <Info className="w-5 h-5" />
                            <span className="font-bold">Dívidas: {scanResult.details?.unpaidCount || 0} meses</span>
                          </div>
                        )}
                      </div>

                      <div className={`flex items-center gap-3 p-4 rounded-2xl ${
                        scanResult.status === 'allowed' ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'
                      }`}>
                        {scanResult.status === 'allowed' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                        <p className="text-lg font-black">{scanResult.reason}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* History */}
            <div className="mt-12 space-y-6">
              <div className="flex items-center gap-3 px-4">
                <History className="w-5 h-5 text-on-surface-variant" />
                <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Últimas Leituras</h3>
              </div>

              <div className="space-y-3">
                {history.map((item, idx) => (
                  <div key={idx} className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        item.status === 'allowed' ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'
                      }`}>
                        {item.status === 'allowed' ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{item.name}</p>
                        <p className="text-[10px] text-on-surface-variant font-medium">{item.type} • {item.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-black ${item.status === 'allowed' ? 'text-secondary' : 'text-error'}`}>
                        {item.status === 'allowed' ? 'ENTRADA AUTORIZADA' : 'ACESSO NEGADO'}
                      </p>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-center p-12 bg-surface-container-low rounded-3xl border border-dashed border-outline-variant/10">
                    <p className="text-on-surface-variant text-sm">Nenhuma leitura realizada hoje.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <QRScanner 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScanSuccess={handleScanSuccess} 
      />
    </div>
  );
};

export default PorterPage;
