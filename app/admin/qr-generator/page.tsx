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
  X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const QRGeneratorPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

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
    if (item.type === 'STUDENT') {
      return JSON.stringify({
        id: item.id,
        name: item.name,
        grade: item.grade,
        type: 'STUDENT'
      });
    } else {
      return JSON.stringify({
        id: item.id,
        name: item.name,
        role: item.role,
        dept: item.department,
        type: 'STAFF'
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-white">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="Gerador de QR Code" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <QrCode className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-4xl font-black tracking-tight">Gerador de Passes</h2>
              <p className="text-on-surface-variant max-w-md mx-auto">Pesquise por um aluno ou funcionário para gerar o seu código QR de acesso institucional.</p>
            </div>

            {/* Search Section */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input 
                  type="text" 
                  placeholder="Nome do aluno ou funcionário..." 
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/10 rounded-[2rem] py-5 pl-16 pr-6 text-lg outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-xl"
                />
              </div>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-4 bg-surface-container-high border border-outline-variant/10 rounded-[2rem] shadow-2xl overflow-hidden z-50"
                  >
                    {results.map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => {
                          setSelectedItem(item);
                          setResults([]);
                          setSearchTerm('');
                        }}
                        className="w-full p-4 flex items-center gap-4 hover:bg-surface-container-highest transition-all text-left border-b border-outline-variant/5 last:border-0"
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface-container-low">
                          {item.photo_url ? (
                            <Image src={item.photo_url} alt={item.name} fill className="object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {item.type === 'STUDENT' ? <GraduationCap className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">{item.name}</p>
                          <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">
                            {item.type === 'STUDENT' ? `Aluno • ${item.grade}` : `Funcionário • ${item.role}`}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-on-surface-variant">#{item.id}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Selected Item Display */}
            <AnimatePresence mode="wait">
              {selectedItem && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-12 flex flex-col items-center space-y-8"
                >
                  {/* ID Card Preview */}
                  <div className="relative w-full max-w-md aspect-[1.586/1] bg-gradient-to-br from-surface-container-high to-surface-container-low border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                          {selectedItem.type === 'STUDENT' ? <GraduationCap className="w-6 h-6 text-primary" /> : <ShieldCheck className="w-6 h-6 text-primary" />}
                        </div>
                        <div>
                          <h3 className="font-black text-white text-sm tracking-tight">ELO ESCOLAR</h3>
                          <p className="text-[8px] text-primary font-bold uppercase tracking-widest">Passe Institucional</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest">Ano Letivo</span>
                        <p className="text-xs font-black text-white">2026/2027</p>
                      </div>
                    </div>

                    <div className="flex gap-8 items-center flex-1">
                      <div className="relative w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-primary/20 shadow-xl bg-surface-container-low">
                        {selectedItem.photo_url ? (
                          <Image src={selectedItem.photo_url} alt={selectedItem.name} fill className="object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-12 h-12 text-on-surface-variant" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <h2 className="text-xl font-black text-white leading-tight">{selectedItem.name}</h2>
                          <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">
                            {selectedItem.type === 'STUDENT' ? selectedItem.grade : selectedItem.role}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                            {selectedItem.type === 'STUDENT' ? 'Turma / Grupo' : 'Departamento'}
                          </p>
                          <p className="text-sm font-bold text-white">
                            {selectedItem.type === 'STUDENT' ? (selectedItem.class_id || '---') : (selectedItem.department || '---')}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">ID de Identificação</p>
                          <p className="text-sm font-mono font-bold text-white">{selectedItem.id}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest">Validade</p>
                        <p className="text-[10px] font-bold text-white">DEZ 2027</p>
                      </div>
                      <div className="bg-white p-2 rounded-xl shadow-lg">
                        <QRCodeSVG 
                          value={getQRValue(selectedItem)} 
                          size={70}
                          level="H"
                        />
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full -ml-16 -mb-16 blur-3xl" />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-8 py-4 bg-surface-container-high text-white rounded-2xl font-bold hover:bg-surface-container-highest transition-all shadow-xl">
                      <Download className="w-5 h-5" /> Baixar Imagem
                    </button>
                    <button className="flex items-center gap-2 px-8 py-4 bg-primary text-on-primary-fixed rounded-2xl font-bold shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
                      <Printer className="w-5 h-5" /> Imprimir Passe
                    </button>
                    <button 
                      onClick={() => setSelectedItem(null)}
                      className="p-4 bg-error/10 text-error rounded-2xl hover:bg-error/20 transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!selectedItem && !loading && searchTerm.length > 0 && results.length === 0 && (
              <div className="text-center py-20 bg-surface-container-low rounded-[3rem] border border-dashed border-outline-variant/10">
                <p className="text-on-surface-variant">Nenhum aluno ou funcionário encontrado com este nome.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRGeneratorPage;
