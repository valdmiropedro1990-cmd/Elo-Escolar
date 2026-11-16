'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scan, 
  Search, 
  User, 
  Users, 
  Download, 
  Printer, 
  QrCode,
  GraduationCap,
  ShieldCheck,
  X,
  ExternalLink,
  Layers,
  Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

export default function QRGeneratorPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [viewBatchSheet, setViewBatchSheet] = useState(false);

  useEffect(() => {
    fetchInitialStudents();
  }, []);

  const fetchInitialStudents = async () => {
    try {
      const { data } = await supabase.from('students').select('*').limit(8);
      if (data) {
        setAllStudents(data.map(s => ({
          ...s,
          type: 'STUDENT',
          id: s.student_id || s.id
        })));
      }
    } catch (e) {}
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const [
        { data: students },
        { data: staff }
      ] = await Promise.all([
        supabase.from('students').select('*').ilike('name', `%${term}%`).limit(5),
        supabase.from('staff').select('*').ilike('name', `%${term}%`).limit(5)
      ]);

      const formattedResults = [
        ...(students?.map(s => ({ ...s, type: 'STUDENT', id: s.student_id })) || []),
        ...(staff?.map(s => ({ ...s, type: 'STAFF', id: s.staff_id })) || [])
      ];

      setResults(formattedResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getQRValue = (item: any) => {
    return JSON.stringify({
      id: item.id || item.student_id,
      name: item.name,
      type: item.type || 'STUDENT',
      verifyUrl: `http://localhost:3000/verify?code=${item.id || 'AO-2026-PASS-0001'}`
    });
  };

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="Emissão de Passes Escolares & QR Code" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-secondary font-bold">
                  SISTEMA DE IDENTIFICAÇÃO BIOMÉTRICA E ACESSO
                </span>
                <h2 className="font-headline text-3xl font-bold text-white mt-1">
                  Emissão de Passes Escolares com QR
                </h2>
                <p className="text-on-surface-variant text-xs sm:text-sm mt-1 max-w-lg">
                  Gere cartões individuais ou imprima uma folha A4 com múltiplos passes de estudantes para plastificação.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setViewBatchSheet(!viewBatchSheet)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                    viewBatchSheet 
                      ? 'bg-secondary text-on-secondary-fixed shadow-lg shadow-secondary/20' 
                      : 'bg-surface-container-high text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>{viewBatchSheet ? 'Fechar Folha A4' : 'Folha A4 em Lote (8 Passes)'}</span>
                </button>

                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white font-bold text-xs flex items-center gap-2 border border-white/10"
                >
                  <Printer className="w-4 h-4 text-primary" />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>

            {/* BATCH A4 SHEET VIEW */}
            {viewBatchSheet ? (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 flex justify-between items-center text-xs">
                  <div>
                    <strong className="text-white block">Folha A4 de Impressão Contínua (Grade de 8 Cartões)</strong>
                    <span className="text-on-surface-variant">Pronta para impressão em cartolina ou PVC com linhas de corte rápido.</span>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-secondary text-on-secondary-fixed font-bold flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Folha A4</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-6 rounded-3xl text-black">
                  {allStudents.slice(0, 8).map((st, idx) => (
                    <div key={idx} className="border-2 border-dashed border-gray-300 rounded-2xl p-4 flex flex-col justify-between h-[210px] bg-gray-50 relative overflow-hidden">
                      <div className="flex justify-between items-start border-b border-gray-200 pb-2">
                        <div>
                          <span className="text-[7px] font-bold text-blue-800 uppercase tracking-widest block">REPÚBLICA DE ANGOLA</span>
                          <strong className="text-xs text-black block leading-none mt-0.5">COLÉGIO ELO ESCOLAR</strong>
                          <span className="text-[8px] text-gray-500">Passe de Estudante · 2026/2027</span>
                        </div>
                        <span className="text-[8px] font-mono font-bold bg-black text-white px-1.5 py-0.5 rounded">
                          10ª CLASSE
                        </span>
                      </div>

                      <div className="flex gap-3 items-center my-auto">
                        <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0 relative">
                          <Image src={st.photo_url || '/images/sala-aula.jpg'} alt="" fill className="object-cover" />
                        </div>
                        <div className="text-xs space-y-0.5">
                          <h4 className="font-bold text-black text-sm leading-tight">{st.name}</h4>
                          <p className="text-[10px] text-gray-600 font-mono">Processo: <strong>{st.id}</strong></p>
                          <p className="text-[10px] text-gray-600">Curso: <strong>Informática</strong></p>
                          <span className="text-[8px] text-green-700 font-bold block">● Matrícula Regular</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-gray-200 pt-2 text-[8px] text-gray-500">
                        <span>Validade: DEZ/2027</span>
                        <div className="flex items-center gap-1">
                          <QRCodeSVG value={getQRValue(st)} size={32} level="M" />
                          <span className="font-mono text-[7px]">VALIDAR</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Search Box */}
                <div className="bg-surface-container-low rounded-3xl p-6 sm:p-8 border border-outline-variant/10 shadow-xl">
                  <div className="relative max-w-xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input 
                      type="text" 
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Pesquisar por nome do aluno ou funcionário..."
                      className="w-full bg-surface-container-high border border-outline-variant/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Results List */}
                  {results.length > 0 && (
                    <div className="mt-4 max-w-xl mx-auto divide-y divide-white/5 border border-white/5 rounded-2xl overflow-hidden bg-surface-container-high">
                      {results.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedItem(item);
                            setResults([]);
                            setSearchTerm('');
                          }}
                          className="w-full p-4 flex items-center justify-between hover:bg-white/[0.04] transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                              {item.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{item.name}</p>
                              <p className="text-[11px] text-on-surface-variant">{item.id} · {item.type === 'STUDENT' ? item.grade : item.role}</p>
                            </div>
                          </div>
                          <span className="text-xs text-primary font-bold">Gerar Passe →</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Single Pass Preview Card */}
                {selectedItem && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center space-y-6"
                  >
                    <div className="relative w-full max-w-md aspect-[1.586/1] bg-gradient-to-br from-surface-container-high via-surface-container-low to-[#0b1020] border-2 border-secondary/30 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col justify-between text-white overflow-hidden">
                      
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-secondary uppercase tracking-widest block">REPÚBLICA DE ANGOLA</span>
                            <h3 className="font-bold text-white text-sm">ELO ESCOLAR</h3>
                            <span className="text-[9px] text-on-surface-variant">Passe Digital Institucional</span>
                          </div>
                        </div>

                        <div className="text-right font-mono text-[10px]">
                          <span className="text-on-surface-variant block">Ano Lectivo</span>
                          <strong className="text-white">2026/2027</strong>
                        </div>
                      </div>

                      <div className="flex gap-6 items-center my-2">
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/20 bg-surface-container-highest flex-shrink-0">
                          {selectedItem.photo_url ? (
                            <Image src={selectedItem.photo_url} alt="" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary">
                              <GraduationCap className="w-10 h-10" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-lg font-bold text-white">{selectedItem.name}</h4>
                          <p className="text-xs text-secondary font-mono">Processo: <strong>{selectedItem.id}</strong></p>
                          <p className="text-[11px] text-on-surface-variant">Turma: {selectedItem.grade || '10ª Classe A'}</p>
                          <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-secondary/20 text-secondary">
                            Acesso Permitido
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-end border-t border-white/10 pt-3">
                        <div className="text-[9px] text-on-surface-variant">
                          <p>Validade: <strong>DEZ/2027</strong></p>
                          <Link href={`/verify?code=${selectedItem.id}`} target="_blank" className="text-primary hover:underline flex items-center gap-1 mt-0.5">
                            <span>Validar em /verify</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>

                        <div className="bg-white p-1.5 rounded-xl text-black">
                          <QRCodeSVG value={getQRValue(selectedItem)} size={54} level="M" />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => window.print()}
                        className="px-6 py-3 rounded-full bg-secondary text-on-secondary-fixed font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Imprimir Passe Escolar</span>
                      </button>
                      <button 
                        onClick={() => setSelectedItem(null)}
                        className="px-4 py-3 rounded-full bg-white/[0.06] hover:bg-white/10 text-white text-xs font-bold"
                      >
                        Fechar
                      </button>
                    </div>
                  </motion.div>
                )}
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
