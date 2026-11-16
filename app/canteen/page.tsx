'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coffee, 
  Utensils, 
  CreditCard, 
  QrCode, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Wallet,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Apple
} from 'lucide-react';
import Link from 'next/link';

interface StudentCanteen {
  id: string;
  name: string;
  grade: string;
  balance: number;
  lastMeal: string;
  plan: 'Almoço Completo' | 'Lanche Pré-Pago' | 'Avulso';
}

export default function CanteenPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentCanteen | null>(null);
  const [topUpAmount, setTopUpAmount] = useState(10000);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [studentsList, setStudentsList] = useState<StudentCanteen[]>([
    { id: 'AO-2026-0001', name: 'Lucas Gabriel de Almeida', grade: '10ª Classe A', balance: 14500, lastMeal: 'Almoço (Frango Grelhado com Arroz de Feijão)', plan: 'Almoço Completo' },
    { id: 'AO-2026-0002', name: 'Marta Domingas Kiala', grade: '10ª Classe A', balance: 22000, lastMeal: 'Almoço (Bife de Vaca com Puré)', plan: 'Almoço Completo' },
    { id: 'AO-2026-0003', name: 'Sebastião Manuel da Costa', grade: '11ª Classe B', balance: 3200, lastMeal: 'Lanche Matinal (Sumo Natural + Tosta Mista)', plan: 'Lanche Pré-Pago' },
    { id: 'AO-2026-0004', name: 'Esperança Beatriz dos Santos', grade: '12ª Classe A', balance: 18000, lastMeal: 'Almoço (Calulu de Peixe Fresco)', plan: 'Almoço Completo' },
    { id: 'AO-2026-0005', name: 'Edson Valter Benguela', grade: '7ª Classe A', balance: 1500, lastMeal: 'Lanche da Tarde', plan: 'Avulso' },
    { id: 'AO-2026-0006', name: 'Helena Teresa Van-Dúnem', grade: '8ª Classe B', balance: 8500, lastMeal: 'Almoço Completo', plan: 'Almoço Completo' },
  ]);

  const weeklyMenu = [
    { day: 'Segunda-feira', dish: 'Bife de Novilho com Arroz de Feijão e Salada Fresca', soup: 'Sopa de Legumes da Horta', fruit: 'Manga e Papaia' },
    { day: 'Terça-feira', dish: 'Frango Assado à Moda de Luanda com Batata Dourada', soup: 'Caldo de Peixe Fresco', fruit: 'Laranja e Banana' },
    { day: 'Quarta-feira', dish: 'Calulu Tradicional de Peixe com Funge e Feijão de Óleo de Palma', soup: 'Sopa de Abóbora', fruit: 'Melancia Fatiada' },
    { day: 'Quinta-feira', dish: 'Peixe Grelhado da Ilha com Batata-Doce e Molho Vilão', soup: 'Creme de Cenoura', fruit: 'Salada de Frutas' },
    { day: 'Sexta-feira', dish: 'Feijoada de Choco e Gambas com Arroz Branco', soup: 'Sopa Rica de Galinha', fruit: 'Abacaxi Grelhado' },
  ];

  const handleTopUp = () => {
    if (!selectedStudent) return;
    setStudentsList(prev => prev.map(s => {
      if (s.id === selectedStudent.id) {
        return { ...s, balance: s.balance + Number(topUpAmount) };
      }
      return s;
    }));
    setToastMessage(`Carregamento de ${Number(topUpAmount).toLocaleString()} AOA concluído via Multicaixa para ${selectedStudent.name}!`);
    setSelectedStudent(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredStudents = studentsList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <TopBar title="Cantina Escolar & Saldo do Aluno" />
        
        <div className="pt-24 px-4 lg:px-8 pb-12">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-secondary font-bold">
                NUTRIÇÃO, ALIMENTAÇÃO E SALDO PRÉ-PAGO NO CARTÃO QR
              </span>
              <h2 className="font-headline text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-1">
                Cantina & Refeitório Escolar
              </h2>
              <p className="text-on-surface-variant max-w-xl text-sm">
                Ementas semanais nutritivas, carregamento de saldo por Multicaixa Express e pagamento sem dinheiro vivo pelo passe QR do aluno.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setSelectedStudent(studentsList[0]);
                }}
                className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Carregar Saldo no Cartão</span>
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-secondary/20 border border-secondary/40 text-secondary text-xs font-bold rounded-2xl text-center shadow-lg"
              >
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/5">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Refeições Servidas Hoje</span>
              <h3 className="text-2xl font-black text-white mt-2">142 Almoços</h3>
              <span className="text-[10px] text-secondary font-bold">100% Capacidade Coberta</span>
            </div>
            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/5">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Planos Mensais Activos</span>
              <h3 className="text-2xl font-black text-secondary mt-2">118 Alunos</h3>
              <span className="text-[10px] text-on-surface-variant">Alimentação Escolar Equilibrada</span>
            </div>
            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/5">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Saldo em Carteira Digital</span>
              <h3 className="text-2xl font-black text-primary mt-2">1.840.000 AOA</h3>
              <span className="text-[10px] text-primary font-bold">Carregado por Multicaixa</span>
            </div>
            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/5">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Segurança Alimentar</span>
              <h3 className="text-2xl font-black text-white mt-2">10/10</h3>
              <span className="text-[10px] text-secondary font-bold">Normas de Saúde Certificadas</span>
            </div>
          </div>

          {/* Weekly Menu Display */}
          <div className="bg-surface-container-low rounded-3xl p-6 sm:p-8 border border-outline-variant/10 mb-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <Utensils className="w-5 h-5 text-secondary" />
              <div>
                <h3 className="text-lg font-bold text-white">Ementa Semanal da Cantina Escolar</h3>
                <span className="text-xs text-on-surface-variant">Supervisionada por nutricionista pedagógico · Ingredientes locais frescos</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {weeklyMenu.map((m, i) => (
                <div key={m.day} className="p-4 rounded-2xl bg-surface-container-high/40 border border-white/5 space-y-2">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider block">{m.day}</span>
                  <p className="text-xs text-white font-medium leading-snug">{m.dish}</p>
                  <div className="text-[10px] text-on-surface-variant pt-2 border-t border-white/5 space-y-1">
                    <p>🍲 {m.soup}</p>
                    <p>🍎 {m.fruit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Cards & Wallet Table */}
          <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 pb-4 border-b border-white/10">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar aluno ou Nº de processo..."
                  className="w-full bg-surface-container-high border border-outline-variant/10 rounded-xl py-2.5 pl-11 pr-4 text-xs sm:text-sm text-white outline-none"
                />
              </div>
              <span className="text-xs text-on-surface-variant">Total: {filteredStudents.length} alunos com carteira digital</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-surface-container-high/50 text-[10px] uppercase tracking-wider text-on-surface-variant">
                    <th className="px-6 py-4 font-bold">Aluno / Turma</th>
                    <th className="px-6 py-4 font-bold">Plano de Cantina</th>
                    <th className="px-6 py-4 font-bold">Saldo Disponível no Cartão</th>
                    <th className="px-6 py-4 font-bold">Última Refeição</th>
                    <th className="px-6 py-4 font-bold text-right">Carregar Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <strong className="text-white block">{st.name}</strong>
                        <span className="text-[10px] text-on-surface-variant font-mono">{st.id} · {st.grade}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/20 text-primary">
                          {st.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold">
                        <span className={st.balance > 5000 ? 'text-secondary' : 'text-tertiary'}>
                          {st.balance.toLocaleString()} AOA
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant">
                        {st.lastMeal}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedStudent(st)}
                          className="px-4 py-1.5 rounded-xl bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/30 text-xs font-bold inline-flex items-center gap-1.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>+ Carregar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* Top-up Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-md w-full bg-surface-container-low border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4"
            >
              <h3 className="text-xl font-bold text-white">Carregamento de Saldo de Cantina</h3>
              <div className="p-4 rounded-2xl bg-surface-container-high/60 text-xs space-y-1">
                <p>Aluno: <strong className="text-white">{selectedStudent.name}</strong></p>
                <p>Processo: <strong className="text-secondary font-mono">{selectedStudent.id}</strong></p>
                <p>Saldo Actual: <strong className="text-white font-mono">{selectedStudent.balance.toLocaleString()} AOA</strong></p>
              </div>

              <div>
                <label className="text-xs text-on-surface-variant block mb-1">Montante a Carregar (AOA)</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[5000, 10000, 20000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTopUpAmount(val)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        topUpAmount === val 
                          ? 'bg-secondary text-on-secondary-fixed border-secondary' 
                          : 'bg-surface-container-high text-white border-white/10'
                      }`}
                    >
                      {val.toLocaleString()} Kz
                    </button>
                  ))}
                </div>
                <input 
                  type="number" 
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  className="w-full bg-surface-container-high border border-outline-variant/10 rounded-xl px-4 py-3 text-white font-mono text-lg font-bold outline-none"
                />
              </div>

              <div className="p-3 bg-secondary/10 rounded-xl border border-secondary/20 text-[11px] text-secondary">
                O encarregado recebe instantaneamente uma Referência Multicaixa Express ou confirmação de débito.
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="flex-1 py-3 rounded-xl bg-surface-container-high text-white text-xs font-bold"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={handleTopUp}
                  className="flex-1 py-3 rounded-xl bg-secondary text-on-secondary-fixed text-xs font-bold shadow-lg shadow-secondary/20"
                >
                  Confirmar Recarga
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
